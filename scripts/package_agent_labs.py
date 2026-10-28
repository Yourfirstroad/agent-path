"""Package only reviewed source files, never an environment, checkpoint or personal DB."""
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'examples' / 'agent_labs'
FILES = ['README.md', 'requirements.txt', 'requirements-lock.txt', 'lab_support.py', 'test_labs.py',
    '01_messages.py', '02_tools.py', '03_agent_memory.py', '04_structured_plan.py',
    '05_graph_basics.py', '06_graph_routes.py', '07_checkpoints.py', '08_approval.py', '09_research_assistant.py']

def package():
    target = ROOT / 'public' / 'downloads' / 'agent-labs.zip'
    target.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        for filename in FILES:
            data = (SOURCE / filename).read_bytes()
            entry = zipfile.ZipInfo('agent-labs/' + filename, date_time=(2026, 10, 28, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(entry, data)
    print(f'Packaged {len(FILES)} reviewed lab files, no runtime data.')
    return target

if __name__ == '__main__':
    package()
