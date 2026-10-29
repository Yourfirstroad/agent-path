"""第五课：长期偏好随启动加载；Skill 正文通过文件工具按需读取。"""

from pathlib import Path
from da_support import ScriptModel, call, show, tool_results
from deepagents import create_deep_agent
from deepagents.backends.utils import create_file_data

ROOT = Path(__file__).resolve().parent


def seed_files():
    return {
        "/AGENTS.md": create_file_data(
            (ROOT / "AGENTS.md").read_text(encoding="utf-8")
        ),
        "/skills/study/SKILL.md": create_file_data(
            (ROOT / "skills/study/SKILL.md").read_text(encoding="utf-8")
        ),
    }


def run():
    model = ScriptModel(steps=[call("read_file", file_path="/skills/study/SKILL.md")])
    agent = create_deep_agent(model=model, memory=["/AGENTS.md"], skills=["/skills/"])
    result = agent.invoke(
        {"messages": [("user", "请按 study skill 整理计划")], "files": seed_files()},
        {"recursion_limit": 30},
    )
    system = "\n".join(model.seen_system)
    return {
        "memory_loaded": "60 分钟" in system,
        "skill_listed": "study" in system,
        "body_in_system": "SKILL_BODY_MARKER" in system,
        "tools": tool_results(result),
    }


if __name__ == "__main__":
    show(run())
