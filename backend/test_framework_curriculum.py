from pathlib import Path
import unittest
import zipfile
from backend.curriculum import CURRICULUM
from scripts.package_agent_labs import FILES, package, SOURCE

class FrameworkCurriculumTests(unittest.TestCase):
    def test_stable_ids_order_counts_and_resources(self):
        lessons = CURRICULUM['lessons']
        ids = [lesson['id'] for lesson in lessons]
        self.assertEqual(len(ids), 62)
        self.assertEqual(len(set(ids)), 62)
        self.assertTrue({f'l{number:02}' for number in range(1,41)} <= set(ids))
        self.assertEqual([lesson['number'] for lesson in lessons], list(range(1,63)))
        self.assertEqual(ids[ids.index('l25')+1:ids.index('l26')], ['lc01','lc02','lc03','lc04'])
        self.assertEqual(ids[ids.index('l31')+1:ids.index('l32')], ['lg01','lg02','lg03','lg04'])
        resources = {item['id'] for item in CURRICULUM['resources']}
        for lesson in lessons:
            self.assertEqual(len(lesson['checks']),3)
            self.assertTrue(set(lesson['resources']) <= resources)
        self.assertEqual(len([item for item in lessons if item['stage']=='s5']),9)
        self.assertEqual(len([item for item in lessons if item['stage']=='s7']),9)

    def test_lab_code_is_complete_project_source(self):
        labs = [lesson for lesson in CURRICULUM['lessons'] if lesson.get('lab')]
        self.assertEqual(len(labs),9)
        for lesson in labs:
            self.assertEqual(lesson['code'], (SOURCE / lesson['lab']['file']).read_text(encoding='utf-8'))
            compile(lesson['code'], lesson['lab']['file'], 'exec')
            self.assertEqual(lesson['lab']['download'],'downloads/agent-labs.zip')

    def test_download_archive_only_contains_reviewed_sources(self):
        target = package()
        with zipfile.ZipFile(target) as archive:
            self.assertEqual(archive.namelist(),['agent-labs/'+filename for filename in FILES])
            self.assertIsNone(archive.testzip())
            for filename in FILES:
                self.assertEqual(archive.read('agent-labs/'+filename),(SOURCE/filename).read_bytes())
            self.assertFalse(any(name.endswith(('.sqlite3','.db','.pyc')) for name in archive.namelist()))

if __name__ == '__main__': unittest.main()
