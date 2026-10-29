"""第二课：显式开启规划，把结果写入虚拟文件，再读回来。"""

from da_support import ScriptModel, call, show, tool_results
from deepagents import create_deep_agent
from langchain.agents.middleware import TodoListMiddleware


def run():
    model = ScriptModel(
        steps=[
            call(
                "write_todos", todos=[{"content": "整理资料", "status": "in_progress"}]
            ),
            call(
                "write_file",
                file_path="/report.md",
                content="# 学习计划\n先读文档，再运行一课。",
            ),
            call("read_file", file_path="/report.md"),
            call("write_todos", todos=[{"content": "整理资料", "status": "completed"}]),
        ]
    )
    agent = create_deep_agent(model=model, middleware=[TodoListMiddleware()])
    return agent.invoke(
        {"messages": [("user", "制作学习计划")]}, {"recursion_limit": 40}
    )


if __name__ == "__main__":
    result = run()
    show(
        {
            "todos": result["todos"],
            "files": list(result["files"]),
            "tools": tool_results(result),
        }
    )
    # 默认 StateBackend 的文件在返回状态里，并没有创建电脑上的 /report.md。
