"""第七课：大资料放虚拟文件，只读需要的行；限制 Agent 改动原始资料。"""

from da_support import ScriptModel, call, show, tool_results
from deepagents import create_deep_agent
from deepagents.backends.utils import create_file_data
from deepagents.middleware.filesystem import FilesystemPermission


def run():
    content = "\n".join(f"第 {i} 条公开学习资料" for i in range(1, 101))
    model = ScriptModel(
        steps=[
            call("read_file", file_path="/sources/catalog.txt", offset=0, limit=3),
            call("write_file", file_path="/sources/changed.txt", content="不应写入"),
        ]
    )
    agent = create_deep_agent(
        model=model,
        permissions=[
            FilesystemPermission(
                operations=["write"], paths=["/sources/**"], mode="deny"
            )
        ],
    )
    result = agent.invoke(
        {
            "messages": [("user", "只读取前三条来源")],
            "files": {"/sources/catalog.txt": create_file_data(content)},
        },
        {"recursion_limit": 30},
    )
    return {
        "tools": tool_results(result),
        "blocked_file_absent": "/sources/changed.txt" not in result["files"],
    }


if __name__ == "__main__":
    show(run())
