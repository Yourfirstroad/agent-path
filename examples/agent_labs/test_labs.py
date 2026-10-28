"""Run python -m unittest -v test_labs; each CLI invocation is a fresh process."""
import json
import os
from pathlib import Path
from contextlib import closing
import sqlite3
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parent
GUARD = '''import socket,runpy,sys
def blocked(*args, **kwargs): raise AssertionError("Offline lab attempted network access")
socket.socket.connect=blocked
socket.create_connection=blocked
socket.getaddrinfo=blocked
sys.argv=sys.argv[1:]
runpy.run_path(sys.argv[0],run_name="__main__")
'''

def cli(file, *args, success=True):
    allowed = ['PATH', 'SystemRoot', 'SYSTEMROOT', 'WINDIR', 'TEMP', 'TMP', 'COMSPEC']
    env = {key: value for key, value in os.environ.items() if key in allowed}
    env.update(PYTHONIOENCODING='utf-8', LANGSMITH_TRACING='false', LANGCHAIN_TRACING_V2='false', LANGGRAPH_STRICT_MSGPACK='true')
    result = subprocess.run([sys.executable, '-X', 'utf8', '-c', GUARD, str(ROOT / file), *map(str, args)],
        cwd=ROOT, env=env, text=True, encoding='utf-8', capture_output=True, timeout=30)
    if success and result.returncode:
        raise AssertionError(result.stderr)
    if not success:
        if result.returncode == 0: raise AssertionError('Expected command to be rejected')
        return result
    return json.loads(result.stdout.strip().splitlines()[-1])

class AgentLabTests(unittest.TestCase):
    def test_messages_have_real_prompt_variables(self):
        result = cli('01_messages.py')
        self.assertIn('Python 函数', result['messages'][1])
        self.assertEqual(result['mode'], 'offline-scripted')

    def test_tool_schema_and_invalid_input(self):
        result = cli('02_tools.py')
        self.assertEqual(sum(result['schedule'].values()), 60)
        self.assertTrue(result['invalid_input_rejected'])

    def test_real_agent_calls_tool_and_isolates_threads(self):
        result = cli('03_agent_memory.py')
        self.assertIn('LangGraph', result['same_thread'])
        self.assertNotIn('https://', result['other_thread'])
        self.assertEqual(result['tool_messages'], 2)

    def test_structured_plan_and_unknown_topic(self):
        result = cli('04_structured_plan.py')
        self.assertEqual(result['minutes'], 60)
        self.assertTrue(result['sources'][0].startswith('https://docs.langchain.com/'))
        cli('04_structured_plan.py', '--topic', '不存在的主题', success=False)

    def test_basic_graph_and_both_routes(self):
        result = cli('05_graph_basics.py')
        self.assertIn('LangGraph', result['result'])
        self.assertNotEqual(cli('06_graph_routes.py', '--mode', 'review')['task'],
                            cli('06_graph_routes.py', '--mode', 'practice')['task'])

    def test_checkpoint_survives_new_process_and_does_not_duplicate(self):
        with tempfile.TemporaryDirectory() as directory:
            first = cli('07_checkpoints.py', 'start', '--workdir', directory)
            self.assertEqual(first['pending'], ['finish'])
            self.assertEqual(first['action_count'], 0)
            resumed = cli('07_checkpoints.py', 'resume', '--workdir', directory)
            self.assertEqual(resumed['state']['status'], 'done')
            self.assertEqual(resumed['action_count'], 1)
            self.assertEqual(cli('07_checkpoints.py', 'resume', '--workdir', directory)['action_count'], 1)
            cli('07_checkpoints.py', 'start', '--workdir', directory, success=False)
            with closing(sqlite3.connect(Path(directory) / 'checkpoints.sqlite3')) as db:
                self.assertGreater(db.execute('select count(*) from checkpoints').fetchone()[0], 0)

    def test_human_approval_and_rejection_are_persisted(self):
        with tempfile.TemporaryDirectory() as directory:
            common = ['--workdir', directory]
            self.assertEqual(cli('08_approval.py', 'start', *common)['action_count'], 0)
            self.assertEqual(cli('08_approval.py', 'approve', *common)['action_count'], 1)
            self.assertEqual(cli('08_approval.py', 'approve', *common)['action_count'], 1)
            rejected = ['--workdir', directory, '--thread', 'reject-case']
            cli('08_approval.py', 'start', *rejected)
            result = cli('08_approval.py', 'reject', *rejected)
            self.assertEqual(result['state']['status'], 'rejected')
            self.assertEqual(result['action_count'], 0)

    def test_complete_research_assistant_restarts_and_streams(self):
        with tempfile.TemporaryDirectory() as directory:
            common = ['--workdir', directory, '--thread', 'research-test']
            started = cli('09_research_assistant.py', 'start', '--stream', *common)
            self.assertEqual(started['state']['status'], 'waiting_approval')
            self.assertEqual(started['action_count'], 0)
            result = cli('09_research_assistant.py', 'approve', *common)
            self.assertEqual(result['state']['status'], 'done')
            self.assertEqual(result['action_count'], 1)
            self.assertEqual(result['state']['plan']['topic'], 'LangGraph')
            self.assertEqual(cli('09_research_assistant.py', 'approve', *common)['action_count'], 1)

    def test_live_mode_requires_explicit_configuration(self):
        result = cli('03_agent_memory.py', '--live', success=False)
        self.assertIn('LAB_MODEL', result.stderr)

if __name__ == '__main__':
    unittest.main()
