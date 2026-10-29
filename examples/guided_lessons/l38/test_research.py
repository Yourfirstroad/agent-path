import json, subprocess, sys, tempfile, unittest
from pathlib import Path
from research import operate


class ResearchTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.path = Path(self.temp.name)

    def test_approve_once(self):
        self.assertEqual(operate(self.path, "a", "start")["writes"], 0)
        self.assertEqual(operate(self.path, "a", "approve")["writes"], 1)
        self.assertEqual(operate(self.path, "a", "approve")["writes"], 1)

    def test_reject(self):
        operate(self.path, "r", "start")
        state = operate(self.path, "r", "reject")
        self.assertEqual((state["status"], state["writes"]), ("rejected", 0))

    def test_cancel(self):
        operate(self.path, "c", "start")
        self.assertEqual(operate(self.path, "c", "cancel")["status"], "cancelled")

    def test_budget(self):
        state = operate(self.path, "b", "start", budget=0)
        self.assertEqual(
            (state["status"], state["spent"], state["writes"]),
            ("budget_exhausted", 0, 0),
        )

    def test_resume_process(self):
        operate(self.path, "p", "start")
        code = 'from research import operate; import sys,json; print(json.dumps(operate(sys.argv[1],"p","approve")))'
        result = subprocess.run(
            [sys.executable, "-c", code, str(self.path)],
            capture_output=True,
            text=True,
            check=True,
        )
        self.assertEqual(json.loads(result.stdout)["writes"], 1)


if __name__ == "__main__":
    unittest.main()
