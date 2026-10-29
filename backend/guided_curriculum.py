"""Attach authored tutorials without changing stable progress or quiz identities."""
import copy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GUIDES = json.loads((ROOT / 'backend' / 'guided_lessons.json').read_text(encoding='utf-8'))

def extend_guides(lessons):
    for lesson in lessons:
        guide = copy.deepcopy(GUIDES[lesson['id']])
        framework = guide.pop('framework', False)
        folder = ROOT / 'examples' / ('agent_labs' if framework else 'guided_lessons/' + lesson['id'])
        guide['download'] = 'downloads/agent-labs.zip' if framework else 'downloads/guided-lessons.zip'
        guide['files'] = [dict(name=name, code=(folder / name).read_text(encoding='utf-8')) for name in guide['files']]
        lesson['guide'] = guide
        if not framework:
            lesson['code'] = guide['files'][0]['code']
        # The former open-ended exercise remains an extension, never the only instruction.
        lesson['exercise'] = [guide['challenge'], '对照参考答案修正，再亲自验证下方完成标准。复杂作品可以分多天，不必一次写完。']
