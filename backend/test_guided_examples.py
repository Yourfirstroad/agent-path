"""Run tutorial programs in disposable copies, never in the user's learning data."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT/'examples/guided_lessons'

class GuidedExamplesTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def copy(self, id):
        target=self.root/id
        if not target.exists(): shutil.copytree(SOURCE/id,target,ignore=shutil.ignore_patterns('node_modules','.venv','__pycache__','data','*.db'))
        return target

    def run_lesson(self,id,*args,input=None,ok=True):
        result=subprocess.run([sys.executable,'-X','utf8',*args],cwd=self.copy(id),input=input,capture_output=True,text=True,encoding='utf-8',timeout=45,env={**os.environ,'PYTHONIOENCODING':'utf-8'})
        if ok: self.assertEqual(result.returncode,0,f'{id}: {result.stderr}\n{result.stdout}')
        return result.stdout+result.stderr

    def snippet(self,id,code): return self.run_lesson(id,'-c',code)

    def test_basics_and_input_boundaries(self):
        self.assertIn('你好，学习者',self.run_lesson('l01','hello.py'))
        for value,expected in [('0','轻量任务'),('30','标准任务'),('abc','请输入整数'),('-1','不能为负数')]:
            self.assertIn(expected,self.run_lesson('l02','main.py',input=value+'\n'))
        self.assertIn('完成： 1 总数： 3',self.run_lesson('l03','main.py'))
        self.assertIn('2/5 → 40%',self.run_lesson('l04','main.py'))
        self.assertIn('3 passed',self.run_lesson('l08','-m','pytest','-q'))

    def test_json_and_sql_persistence(self):
        self.run_lesson('l05','main.py'); self.run_lesson('l05','main.py')
        file=self.copy('l05')/'tasks.json';file.write_text('{',encoding='utf-8')
        self.assertIn('原文件未覆盖',self.run_lesson('l05','main.py'));self.assertEqual(file.read_text(),'{')
        for _ in range(2): self.assertIn("(2, 'HTTP', 0)",self.run_lesson('l09','main.py'))
        self.assertIn('OK',self.run_lesson('l10','-m','unittest','-v'))
        self.run_lesson('l10','tasks.py','add','跨进程')
        self.assertIn('跨进程',self.run_lesson('l10','tasks.py','list'))
        self.run_lesson('l10','tasks.py','done','1')
        self.assertIn("'跨进程', 1",self.run_lesson('l10','tasks.py','list'))
        self.assertIn('不存在',self.run_lesson('l10','tasks.py','done','999',ok=False))

    def test_apis_validate_and_store_edited_content(self):
        self.snippet('l12','''from fastapi.testclient import TestClient
from app import app
c=TestClient(app)
assert c.get('/health').json()=={'ok':True}
assert c.post('/tasks',json={'title':'Python','minutes':30}).status_code==200
for data in [{'title':' ','minutes':30},{'title':'x','minutes':-1},{'title':'x','minutes':'30'}]:
    assert c.post('/tasks',json=data).status_code==422
''')
        self.snippet('l15',"from fastapi.testclient import TestClient; from app import app; c=TestClient(app); assert c.get('/api/tasks').json()[0]['title']=='学习 fetch'; assert '读取任务' in c.get('/').text")
        self.snippet('l19',"import json; from fastapi.testclient import TestClient; from app import app; c=TestClient(app); assert json.loads(c.get('/stream').text.splitlines()[-1])=={'done':True}; assert 'done' not in c.get('/stream?fail=true').text")
        self.snippet('l20','''from fastapi.testclient import TestClient
from app import app
c=TestClient(app)
assert c.post('/api/extract',json={'text':'任务：草稿'}).json()['mode']=='offline-rule'
assert c.get('/api/tasks').json()==[]
assert c.post('/api/tasks',json={'title':'编辑后的结果'}).status_code==200
assert c.post('/api/tasks',json={'title':' '}).status_code==422
assert c.post('/api/extract',json={'text':'任务：x','fail':True}).status_code==503
assert c.post('/api/extract',json={'text':'无前缀'}).status_code==422
assert c.get('/api/tasks').json()==[{'id':1,'title':'编辑后的结果'}]
''')
        self.snippet('l20',"from fastapi.testclient import TestClient; from app import app; assert TestClient(app).get('/api/tasks').json()[0]['title']=='编辑后的结果'")

    def test_timeout_and_offline_model(self):
        output=self.run_lesson('l13','main.py'); self.assertEqual(output.count('次超时'),3);self.assertIn('已停止',output)
        self.assertIn('offline',self.run_lesson('l17','main.py'))
        self.assertIn('TimeoutError',self.run_lesson('l17','main.py','--fail'))

    def test_structured_extractor_all_boundaries(self):
        output=self.run_lesson('l18','main.py');self.assertEqual(output.count('需要修改：'),3)
        self.snippet('l18','''from main import extract,ExtractedTask
from pydantic import ValidationError
assert extract('任务：学习 Python；日期：2026-11-01').due_date=='2026-11-01'
assert extract('任务：复习').due_date is None
for text in ['任务：','随便一句话','任务：复习；日期：明天','任务：复习；日期：2026-02-30','任务：复习；日期：2026-11-01 或 2026-11-02']:
    try: extract(text)
    except ValueError: pass
    else: raise AssertionError(text)
for value in [-0.2,1.5]:
    try: ExtractedTask.model_validate({'title':'x','confidence':value})
    except ValidationError: pass
    else: raise AssertionError(value)
''')

    def test_tool_boundaries_loop_and_confirmation(self):
        self.assertIn('unknown_tool',self.run_lesson('l21','main.py'))
        self.assertIn('invalid_input',self.run_lesson('l21','main.py'))
        self.assertIn('达到最大步数',self.run_lesson('l22','main.py'))
        self.run_lesson('l23','main.py')
        self.snippet('l23',"from main import workflow; from pathlib import Path; workflow('任务：未确认',False,Path('preview.json')); assert not Path('preview.json').exists()")
        for _ in range(2):
            out=self.run_lesson('l25','main.py');self.assertEqual(out.count("'count': 1"),2);self.assertIn('request_id_conflict',out)

    def test_real_mcp_discovery_call_and_path_rejection(self):
        output=self.run_lesson('l24','client.py')
        self.assertIn('read_note',output);self.assertIn('Python 函数',output)
        self.assertEqual(output.count('错误： True'),2)

    def test_retrieval_vector_and_evaluation(self):
        self.assertIn('资料不足',self.run_lesson('l26','main.py'))
        self.assertIn('维度： 3',self.run_lesson('l27','main.py'))
        self.snippet('l27',"from main import cosine; assert cosine([0,0],[1,0])==0;\ntry: cosine([1],[1,2])\nexcept ValueError: pass\nelse: raise AssertionError('dimension')")
        self.run_lesson('l28','main.py')
        rows=json.loads((self.copy('l28')/'report.json').read_text(encoding='utf-8'))
        self.assertEqual(len(rows),40)
        self.assertEqual(sum(r['recall_at_3'] for r in rows if r['strategy']=='whole'),20)
        self.assertLess(sum(r['recall_at_3'] for r in rows if r['strategy']=='short'),20)
        self.snippet('l30',"from fastapi.testclient import TestClient; from app import app; c=TestClient(app); assert c.post('/api/ask',json={'query':'HTTP'}).json()['sources'][0]['id']=='http'; assert c.post('/api/ask',json={'query':'火星天气'}).json()['sources']==[]")
        self.run_lesson('l30','evaluate.py')

    def test_memory_conflicts_and_deletion(self):
        self.run_lesson('l29','main.py','set','60')
        self.run_lesson('l29','main.py','set','30','--revision','1')
        self.assertIn('旧版本冲突',self.run_lesson('l29','main.py','set','90','--revision','1'))
        self.run_lesson('l29','main.py','delete','--revision','2')
        state=json.loads((self.copy('l29')/'memory.json').read_text(encoding='utf-8'))
        self.assertIsNone(state['daily_minutes']);self.assertEqual(state['revision'],3)

    def test_evaluation_budget_and_recovery(self):
        self.assertIn('轨迹通过： 20',self.run_lesson('l32','main.py'))
        self.assertIn('轨迹通过： 5',self.run_lesson('l32','main.py','--broken'))
        self.assertIn('budget_exhausted',self.run_lesson('l33','main.py'))
        self.assertIn('已阻止',self.run_lesson('l34','main.py'))
        for _ in range(4): self.run_lesson('l35','main.py')
        self.assertIn('不重复执行',self.run_lesson('l35','main.py'))
        self.assertIn('OK',self.run_lesson('l38','-m','unittest','-v'))

    def test_portfolio_does_not_overwrite_and_versions_are_honest(self):
        self.run_lesson('l39','main.py');file=self.copy('l39')/'portfolio-l10.md';file.write_text('我的真实证据',encoding='utf-8')
        self.run_lesson('l39','main.py');self.assertEqual(file.read_text(encoding='utf-8'),'我的真实证据')
        self.run_lesson('l40','main.py');report=json.loads((self.copy('l40')/'dependency-review.json').read_text(encoding='utf-8'))
        self.assertFalse(report['online_checked']);self.assertIn('official_sources',report)

if __name__=='__main__':unittest.main()
