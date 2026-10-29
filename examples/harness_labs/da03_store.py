"""第三课：跨会话共享指定用户的记忆；进程内 store 不等于磁盘持久化。"""

from da_support import ScriptModel, call, show, tool_results
from deepagents import create_deep_agent
from deepagents.backends import StoreBackend
from langgraph.store.memory import InMemoryStore


def run():
    store = InMemoryStore()

    def agent_for(user, steps):
        # user 在本例由应用写死；生产中必须来自服务端验证后的身份。
        return create_deep_agent(
            model=ScriptModel(steps=steps),
            store=store,
            backend=StoreBackend(namespace=lambda runtime: ("students", user)),
        )

    writer = agent_for(
        "alice",
        [call("write_file", file_path="/preference.txt", content="每天学习 60 分钟")],
    )
    writer.invoke(
        {"messages": [("user", "保存偏好")]},
        {"configurable": {"thread_id": "one"}, "recursion_limit": 30},
    )
    results = {}
    for user in ["alice", "bob"]:
        reader = agent_for(user, [call("read_file", file_path="/preference.txt")])
        results[user] = tool_results(
            reader.invoke(
                {"messages": [("user", "读取偏好")]},
                {"configurable": {"thread_id": "two"}, "recursion_limit": 30},
            )
        )
    return results


if __name__ == "__main__":
    show(run())
