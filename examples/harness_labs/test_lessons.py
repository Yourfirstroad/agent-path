"""实际框架行为测试；阻止网络，持久化测试启动独立 Python 进程。"""

import json
import os
from pathlib import Path
import socket
import subprocess
import sys
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parent


class Lessons(unittest.TestCase):
    def setUp(self):
        self.network = patch.object(
            socket.socket, "connect", side_effect=AssertionError("练习不应联网")
        )
        self.network.start()
        self.addCleanup(self.network.stop)

    def test_loop(self):
        from h01_loop import run

        self.assertEqual(run()["status"], "done")
        self.assertEqual(len(run()["events"]), 1)
        self.assertEqual(run(2, True)["status"], "step_limit")

    def test_permission(self):
        from h02_tools import read_note

        with TemporaryDirectory() as path:
            root = Path(path) / "allowed"
            root.mkdir()
            (root / "x.txt").write_text("hello", encoding="utf-8")
            (root.parent / "outside.txt").write_text("secret", encoding="utf-8")
            self.assertEqual(read_note(root, "x.txt"), "hello")
            with self.assertRaises(PermissionError):
                read_note(root, "../outside.txt")
            with self.assertRaises(ValueError):
                read_note(root, "x.py")
            (root / "big.txt").write_text("x" * 4097)
            with self.assertRaises(ValueError):
                read_note(root, "big.txt")

    def test_context(self):
        from h03_context import context_for

        self.assertTrue(context_for("Python")["answerable"])
        self.assertFalse(context_for("unknown")["answerable"])
        self.assertFalse(context_for("Python", 1)["answerable"])

    def test_checkpoint(self):
        from h04_checkpoint import act

        with TemporaryDirectory() as path:
            db = Path(path) / "test.sqlite3"
            self.assertEqual(act(db, "a", "start")["deliveries"], 0)
            self.assertEqual(act(db, "a", "approve")["deliveries"], 1)
            self.assertEqual(act(db, "a", "approve")["deliveries"], 1)
            act(db, "b", "start")
            self.assertEqual(act(db, "b", "reject")["deliveries"], 0)
            with self.assertRaises(ValueError):
                act(db, "a", "start", "不同草稿")

    def test_limits(self):
        from h05_limits import Budget, retry_read

        budget = Budget(max_calls=2)
        attempts = []

        def read():
            attempts.append(1)
            if len(attempts) == 1:
                raise TimeoutError()
            return "ok"

        self.assertEqual(retry_read(read, budget), "ok")
        self.assertEqual(budget.calls, 2)
        with self.assertRaisesRegex(RuntimeError, "call_limit"):
            budget.reserve()
        with self.assertRaisesRegex(TimeoutError, "deadline"):
            Budget(seconds=0).reserve()
        with self.assertRaisesRegex(RuntimeError, "cancelled"):
            Budget(cancelled=True).reserve()

    def test_harness_project(self):
        from h06_research import start
        from h04_checkpoint import act

        with TemporaryDirectory() as path:
            db = Path(path) / "test.sqlite3"
            self.assertEqual(start(db, "a", "Python")["status"], "waiting")
            self.assertEqual(start(db, "b", "unknown")["status"], "no_evidence")
            self.assertEqual(act(db, "a", "approve")["deliveries"], 1)

    def test_deep_tool(self):
        from da01_first import run
        from da_support import ScriptModel, call, tool_results

        with self.assertRaises(ValueError):
            run(live=True)
        with patch(
            "da01_first.init_chat_model",
            return_value=ScriptModel(steps=[call("lookup", topic="Python")]),
        ) as provider:
            self.assertTrue(
                json.loads(
                    tool_results(run("Python", live=True, model_id="demo:model"))[0][
                        "content"
                    ]
                )["found"]
            )
            provider.assert_called_once_with("demo:model")

        self.assertTrue(json.loads(tool_results(run())[0]["content"])["found"])
        self.assertFalse(
            json.loads(tool_results(run("unknown"))[0]["content"])["found"]
        )

    def test_plan_file(self):
        from da02_plan_files import run
        from da_support import tool_results

        result = run()
        self.assertEqual(result["todos"][0]["status"], "completed")
        self.assertIn("/report.md", result["files"])
        self.assertTrue(all(t["status"] == "success" for t in tool_results(result)))

    def test_store_isolation(self):
        from da03_store import run

        result = run()
        self.assertIn("60", result["alice"][0]["content"])
        self.assertEqual(result["bob"][0]["status"], "error")

    def test_delegation(self):
        from da04_subagents import run
        from da_support import tool_results

        results = tool_results(run())
        self.assertEqual([r["name"] for r in results], ["task"])
        self.assertIn('"found": true', results[0]["content"])

    def test_skill_progressive_loading(self):
        from da05_skills import run

        result = run()
        self.assertTrue(result["memory_loaded"])
        self.assertTrue(result["skill_listed"])
        self.assertFalse(result["body_in_system"])
        self.assertIn("SKILL_BODY_MARKER", result["tools"][0]["content"])

    def test_context_and_denied_write(self):
        from da07_context import run

        result = run()
        self.assertTrue(result["blocked_file_absent"])
        self.assertIn("第 3 条", result["tools"][0]["content"])
        self.assertNotIn("第 4 条", result["tools"][0]["content"])
        self.assertEqual(result["tools"][1]["status"], "error")

    def process(self, script, action, directory, task):
        # 子进程也禁止出网。只载入本包已审阅的文件，参数通过 argv 传递。
        runner = "import socket,runpy,sys; socket.socket.connect=lambda *a,**k: (_ for _ in ()).throw(AssertionError('network disabled')); f=sys.argv.pop(1); runpy.run_path(f,run_name='__main__')"
        result = subprocess.run(
            [
                sys.executable,
                "-X",
                "utf8",
                "-c",
                runner,
                str(ROOT / script),
                action,
                "--directory",
                str(directory),
                "--task",
                task,
            ],
            cwd=ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=45,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        return json.loads(result.stdout)

    def verify_approval(self, script):
        with TemporaryDirectory() as path:
            started = self.process(script, "start", path, "accept")
            self.assertEqual(started["status"], "waiting_approval")
            self.assertEqual(started["deliveries"], 0)
            self.assertTrue(started["approval_requests"])
            self.assertEqual(
                self.process(script, "status", path, "accept")["status"],
                "waiting_approval",
            )
            self.assertEqual(
                self.process(script, "approve", path, "accept")["deliveries"], 1
            )
            self.assertEqual(
                self.process(script, "approve", path, "accept")["deliveries"], 1
            )
            self.process(script, "start", path, "deny")
            self.assertEqual(
                self.process(script, "reject", path, "deny")["deliveries"], 0
            )
            self.assertEqual(
                self.process(script, "approve", path, "deny")["deliveries"], 0
            )
            return started

    def test_deep_approval_across_processes(self):
        self.verify_approval("da06_approval.py")

    def test_complete_deep_project(self):
        started = self.verify_approval("da08_project.py")
        self.assertIn("/report.md", started["files"])
        self.assertEqual(started["todos"][0]["status"], "completed")


if __name__ == "__main__":
    unittest.main(verbosity=2)
