"""第八课：规划、Skill、子代理、文件和审批组成一个可恢复的学习助手。"""

from da_support import ScriptModel, call, show
from deepagents import create_deep_agent
from langchain.agents.middleware import TodoListMiddleware
from da04_subagents import researcher
from da05_skills import seed_files
from da06_approval import execute, arguments


def build(saver, delivery):
    # 离线脚本的文案是固定参考答案，不能声称由模型自主推理生成。
    report = "来源：https://docs.langchain.com/oss/python/deepagents/overview\n动手：运行 da01_first.py\n验证：工具返回 found=true。"
    model = ScriptModel(
        steps=[
            call(
                "write_todos",
                todos=[{"content": "查资料并准备草稿", "status": "in_progress"}],
            ),
            call("read_file", file_path="/skills/study/SKILL.md"),
            call(
                "task",
                subagent_type="researcher",
                description="查找 Deep Agents 官方来源",
            ),
            call("write_file", file_path="/report.md", content=report),
            call(
                "write_todos",
                todos=[{"content": "查资料并准备草稿", "status": "completed"}],
            ),
            call("deliver", text=report),
        ]
    )
    return create_deep_agent(
        model=model,
        tools=[delivery],
        middleware=[TodoListMiddleware()],
        subagents=[researcher()],
        memory=["/AGENTS.md"],
        skills=["/skills/"],
        checkpointer=saver,
        interrupt_on={"deliver": {"allowed_decisions": ["approve", "reject"]}},
    )


if __name__ == "__main__":
    args = arguments()
    show(
        execute(args.action, args.directory, args.task, build=build, files=seed_files())
    )
