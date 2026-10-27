import importlib
import json
from pathlib import Path
import tempfile
import unittest
from fastapi.testclient import TestClient

module = importlib.import_module("backend.app")


class AppTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        module.DB_PATH = Path(self.temp.name) / "learning.sqlite3"
        self.client = TestClient(module.app)
        self.client.__enter__()

    def tearDown(self):
        self.client.__exit__(None, None, None)
        self.temp.cleanup()

    def test_completion_and_partial_update(self):
        self.client.patch('/api/lessons/l01', json={'note': '中文笔记'})
        r=self.client.patch('/api/lessons/l01',json={'checks':[True]*3,'answer':0})
        self.assertIsNone(r.json()['completed_at'])
        r=self.client.patch('/api/lessons/l01',json={'answer':1})
        self.assertIsNotNone(r.json()['completed_at'])
        self.assertEqual(r.json()['note'],'中文笔记')
        r=self.client.patch('/api/lessons/l01',json={'checks':[False,True,True]})
        self.assertIsNone(r.json()['completed_at'])

    def test_validation_keeps_original(self):
        self.client.patch('/api/lessons/l01',json={'note':'保留'})
        for payload in ({'checks':None},{'note':None},{'checks':[True]},{'answer':99},{'note':'x'*30001}):
            self.assertEqual(self.client.patch('/api/lessons/l01',json=payload).status_code,422)
        self.assertEqual(self.client.patch('/api/lessons/unknown',json={'note':'x'}).status_code,404)
        self.assertEqual(self.client.get('/api/export').json()['lessons']['l01']['note'],'保留')

    def test_backup_transaction(self):
        self.client.patch('/api/lessons/l01',json={'note':'before'})
        data=self.client.get('/api/export').json()
        bad={**data,'version':88}
        self.assertEqual(self.client.post('/api/import',json=bad).status_code,422)
        self.assertEqual(self.client.get('/api/export').json(),data)
        data['lessons']['l01']['note']='restored'
        self.assertEqual(self.client.post('/api/import',json=data).status_code,200)
        self.assertEqual(self.client.get('/api/export').json()['lessons']['l01']['note'],'restored')
        self.assertEqual(len(list(module.DB_PATH.parent.glob('before-import-*'))),1)
        snapshot=json.loads(next(module.DB_PATH.parent.glob('before-import-*')).read_text(encoding='utf-8'))
        self.assertEqual(snapshot['lessons']['l01']['note'],'before')
        self.assertEqual(self.client.post('/api/import',json=snapshot).status_code,200)
        self.assertEqual(self.client.get('/api/export').json()['lessons']['l01']['note'],'before')

    def test_bookmark_idempotence_and_settings(self):
        for _ in range(2):self.client.put('/api/bookmarks/python',json={'saved':True})
        self.assertEqual(self.client.get('/api/export').json()['bookmarks'],['python'])
        self.assertEqual(self.client.put('/api/settings',json={'daily_minutes':17}).status_code,422)
        self.client.put('/api/settings',json={'daily_minutes':90})
        self.assertEqual(self.client.get('/api/export').json()['settings']['daily_minutes'],90)

    def test_local_boundary(self):
        self.assertEqual(self.client.put('/api/settings',json={'daily_minutes':30},headers={'origin':'https://unrelated.example'}).status_code,403)
        self.assertEqual(self.client.get('/api/missing').status_code,404)
        self.assertEqual(self.client.get('/backend/app.py').status_code,404)

if __name__ == '__main__':unittest.main()
