import json
from pathlib import Path
import unittest
import zipfile
from backend.curriculum import CURRICULUM
from scripts.package_guided_lessons import manifest, package_guides

ROOT=Path(__file__).resolve().parent.parent
class GuidedCurriculumTests(unittest.TestCase):
    def test_all_48_lessons_have_specific_complete_guides(self):
        lessons=CURRICULUM['lessons']; self.assertEqual(len(lessons),48)
        ids={l['id']:l['number'] for l in lessons}
        for lesson in lessons:
            with self.subTest(lesson=lesson['id']):
                g=lesson['guide']
                for key in ['intro','before','run','expected','challenge','solution','scope']:
                    self.assertTrue(g[key])
                self.assertGreaterEqual(len(g['explain']),3)
                self.assertTrue(g['files'])
                for previous in g['prerequisites']: self.assertLess(ids[previous],lesson['number'])
                for file in g['files']:
                    self.assertTrue(file['code'].strip())
                    if file['name'].endswith('.py'): compile(file['code'],file['name'],'exec')
                self.assertEqual(len(lesson['checks']),3)

    def test_archive_exact_allowlist_and_no_private_data(self):
        archive=package_guides()
        with zipfile.ZipFile(archive) as z:
            self.assertEqual(z.namelist(),['guided-lessons/'+p for p in manifest()])
            self.assertIsNone(z.testzip())
            for p in manifest():
                self.assertEqual(z.read('guided-lessons/'+p),(ROOT/'examples/guided_lessons'/p).read_bytes())
                self.assertFalse(p.endswith(('.db','.sqlite3','.pyc','.env')))
                self.assertNotIn('node_modules',p)

if __name__=='__main__':unittest.main()
