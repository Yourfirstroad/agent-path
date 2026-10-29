import tempfile
import unittest
from pathlib import Path
from tasks import execute


class TaskTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.path = Path(self.temp.name) / "tasks.db"

    def test_persist(self):
        execute("add", "HTTP", self.path)
        self.assertEqual(execute("list", path=self.path), [(1, "HTTP", 0)])

    def test_done(self):
        execute("add", "HTTP", self.path)
        execute("done", "1", self.path)
        self.assertEqual(execute("list", path=self.path)[0][2], 1)

    def test_invalid(self):
        with self.assertRaises(ValueError):
            execute("add", " ", self.path)
        with self.assertRaises(ValueError):
            execute("done", "99", self.path)


if __name__ == "__main__":
    unittest.main()
