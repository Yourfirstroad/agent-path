"""Only fixed reviewed sources and authored lesson guides enter the public ZIP."""

from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "examples/harness_labs"
FILES = [
    "README.md",
    "requirements.txt",
    "requirements-lock.txt",
    "da_support.py",
    "test_lessons.py",
    "AGENTS.md",
    "skills/study/SKILL.md",
    "h01_loop.py",
    "h02_tools.py",
    "h03_context.py",
    "h04_checkpoint.py",
    "h05_limits.py",
    "h06_research.py",
    "da01_first.py",
    "da02_plan_files.py",
    "da03_store.py",
    "da04_subagents.py",
    "da05_skills.py",
    "da06_approval.py",
    "da07_context.py",
    "da08_project.py",
]


def guide_markdown(lesson):
    g = lesson["guide"]
    paragraphs = [
        f"# {lesson['title']}",
        g["intro"],
        "## 准备",
        g["before"],
        "文件：" + "、".join(f["name"] for f in g["files"]),
        "## Windows 运行",
        "```powershell\n" + g["run"] + "\n```",
        "macOS / Linux：python -m venv 换成 python3 -m venv；.venv/Scripts/python.exe 换成 .venv/bin/python。",
        "## 预期结果",
        g["expected"],
        "## 逐段讲解",
    ]
    paragraphs += ["### " + e["anchor"] + "\n\n" + e["text"] for e in g["explain"]]
    paragraphs += [
        "## 修改练习",
        g["challenge"],
        "## 参考答案",
        g["solution"],
        "## 排错",
        *g["pitfalls"],
        "## 完成标准",
        *lesson["checks"],
        "## 边界",
        g["scope"],
        "核对日期：" + g["reviewed"],
    ]
    paragraphs += [s["title"] + "：" + s["url"] for s in g["sources"]]
    return "\n\n".join(paragraphs) + "\n"


def package_harness():
    from backend.harness_curriculum import courses

    target = ROOT / "public/downloads/harness-labs.zip"
    target.parent.mkdir(parents=True, exist_ok=True)
    entries = {"harness-labs/" + name: (SOURCE / name).read_bytes() for name in FILES}
    for lesson in courses():
        entries[f"harness-labs/guides/{lesson['id']}.md"] = guide_markdown(
            lesson
        ).encode("utf-8")
    with zipfile.ZipFile(target, "w") as archive:
        for name, data in entries.items():
            entry = zipfile.ZipInfo(name, date_time=(2026, 10, 29, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(entry, data)
    print(
        f"Packaged {len(entries)} reviewed Harness/Deep Agents files, no runtime data."
    )
    return target


if __name__ == "__main__":
    import sys

    sys.path.insert(0, str(ROOT))
    package_harness()
