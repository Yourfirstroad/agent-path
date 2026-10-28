"""Only local fixtures: no live cloud or personal credentials are used."""
from contextlib import redirect_stdout
import io
import json
from pathlib import Path
import runpy
import tempfile
import unittest
from unittest.mock import patch

import httpx

SCRIPT = Path(__file__).resolve().parent.parent / "scripts" / "read_cloud_progress.py"


class CloudReaderTests(unittest.TestCase):
    def run_reader(self, path, response=None):
        output = io.StringIO()
        with patch("sys.argv", [str(SCRIPT), "--connection", str(path)]), patch("httpx.post", return_value=response) as post, redirect_stdout(output):
            try:
                runpy.run_path(str(SCRIPT), run_name="__main__")
            except SystemExit as error:
                return output.getvalue(), str(error), post
        return output.getvalue(), "", post

    def config(self, root):
        path = Path(root) / "connection.json"
        path.write_text(json.dumps({"version": 1, "project_url": "https://agent-path-test.supabase.co", "publishable_key": "sb_publishable_fixture_only", "reminder_token": "A" * 43}), encoding="utf-8")
        return path

    def test_readonly_summary_and_no_token_in_output(self):
        with tempfile.TemporaryDirectory() as root:
            path = self.config(root)
            response = httpx.Response(200, json={"has_progress": True, "completed_count": 2, "next_lesson_id": "l03", "daily_minutes": 60, "updated_at": "2026-10-28T00:00:00Z"})
            output, error, post = self.run_reader(path, response)
            self.assertFalse(error)
            self.assertEqual(json.loads(output)["next_lesson_id"], "l03")
            self.assertNotIn("A" * 43, output)
            self.assertTrue(post.call_args.args[0].endswith("/rest/v1/rpc/ap_read_reminder_progress"))
            self.assertNotIn("A" * 43, post.call_args.args[0])

    def test_missing_connection_is_not_zero_progress(self):
        with tempfile.TemporaryDirectory() as root:
            output, error, post = self.run_reader(Path(root) / "missing.json")
            self.assertEqual(output, "")
            self.assertIn("不能据此判定学习进度为零", error)
            post.assert_not_called()

    def test_unexpected_private_fields_are_not_printed(self):
        with tempfile.TemporaryDirectory() as root:
            path = self.config(root)
            output, error, _ = self.run_reader(path, httpx.Response(200, json={"has_progress": True, "note": "PRIVATE FIXTURE"}))
            self.assertEqual(output, "")
            self.assertIn("停止输出", error)
            self.assertNotIn("PRIVATE FIXTURE", error)

    def test_revoked_and_bad_endpoint_do_not_fallback_or_expose_key(self):
        with tempfile.TemporaryDirectory() as root:
            path = self.config(root)
            output, error, _ = self.run_reader(path, httpx.Response(400, json={"message": "invalid token"}))
            self.assertEqual(output, "")
            self.assertIn("HTTP 400", error)
            self.assertNotIn("A" * 43, error)
            config = json.loads(path.read_text(encoding="utf-8"))
            config["project_url"] = "https://attacker.example"
            path.write_text(json.dumps(config), encoding="utf-8")
            output, error, post = self.run_reader(path)
            self.assertEqual(output, "")
            post.assert_not_called()


if __name__ == "__main__":
    unittest.main()
