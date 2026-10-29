"""第四课：主 Agent 委派一个边界清晰的任务给资料员。"""

from da_support import ScriptModel, call, lookup, show, tool_results
from deepagents import create_deep_agent


def researcher():
    return {
        "name": "researcher",
        "description": "从本地目录查找 Deep Agents 官方资料",
        "system_prompt": "只返回查到的来源，不推测。",
        "model": ScriptModel(steps=[call("lookup", topic="Deep Agents")]),
        "tools": [lookup],
    }


def run():
    agent = create_deep_agent(
        model=ScriptModel(
            steps=[
                call(
                    "task",
                    subagent_type="researcher",
                    description="查找 Deep Agents 官方入门地址，只返回有依据的结果",
                )
            ]
        ),
        subagents=[researcher()],
    )
    return agent.invoke(
        {"messages": [("user", "请资料员查找学习来源")]}, {"recursion_limit": 40}
    )


if __name__ == "__main__":
    result = run()
    show(tool_results(result))
    # 主线程收到 task 的总结；子线程 lookup 的完整消息没有铺满主线程。
