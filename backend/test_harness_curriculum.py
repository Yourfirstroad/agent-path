from pathlib import Path
import unittest
import zipfile
from backend.curriculum import CURRICULUM
from backend.harness_curriculum import courses, SOURCE
from scripts.package_harness_labs import FILES, guide_markdown, package_harness


class HarnessCurriculum(unittest.TestCase):
    def test_order_and_existing_quiz_contract(self):
        lessons = CURRICULUM["lessons"]
        ids = [l["id"] for l in lessons]
        self.assertEqual(
            ids[ids.index("l35") + 1 : ids.index("l36")],
            [f"h{i:02}" for i in range(1, 7)] + [f"da{i:02}" for i in range(1, 9)],
        )
        self.assertEqual(len({l["id"] for l in lessons}), 62)
        self.assertEqual(
            [s["id"] for s in CURRICULUM["stages"]],
            ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s9", "s10", "s8"],
        )
        for lesson in courses():
            self.assertGreaterEqual(len(lesson["guide"]["explain"]), 4)
            self.assertIn(".venv/Scripts/python.exe", lesson["guide"]["run"])
            for file in lesson["guide"]["files"]:
                self.assertEqual(
                    file["code"], (SOURCE / file["name"]).read_text(encoding="utf-8")
                )
        old_answers = [1, 1, 0, 1, 2, 0, 2, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0] + [
            1
        ] * 20
        by_id = {l["id"]: l for l in lessons}
        self.assertEqual(
            [by_id[f"l{i:02}"]["quiz"]["answer"] for i in range(1, 41)], old_answers
        )

    def test_packaged_exact_sources_and_guides(self):
        target = package_harness()
        with zipfile.ZipFile(target) as z:
            expected = ["harness-labs/" + name for name in FILES] + [
                f"harness-labs/guides/{l['id']}.md" for l in courses()
            ]
            self.assertEqual(z.namelist(), expected)
            self.assertIsNone(z.testzip())
            for name in FILES:
                self.assertEqual(
                    z.read("harness-labs/" + name), (SOURCE / name).read_bytes()
                )
            for lesson in courses():
                self.assertEqual(
                    z.read(f"harness-labs/guides/{lesson['id']}.md").decode(),
                    guide_markdown(lesson),
                )
            self.assertFalse(
                any(
                    "/work/" in p or p.endswith((".db", ".sqlite3", ".pyc", ".env"))
                    for p in z.namelist()
                )
            )


if __name__ == "__main__":
    unittest.main()
