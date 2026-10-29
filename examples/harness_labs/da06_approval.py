"""第六课：跨进程恢复真实框架审批；交付仅写本地 SQLite，没有外发。"""

import argparse
from contextlib import closing
from pathlib import Path
import sqlite3
from da_support import ScriptModel, call, show
from deepagents import create_deep_agent
from langchain.tools import tool
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.types import Command


def delivery_tool(directory, task):
    @tool
    def deliver(text: str) -> str:
        """确认后保存一份本地交付记录；同一个任务只保存一次。"""
        with closing(sqlite3.connect(directory / "deliveries.sqlite3")) as db, db:
            db.execute(
                "CREATE TABLE IF NOT EXISTS deliveries(id TEXT PRIMARY KEY, body TEXT)"
            )
            db.execute("INSERT OR IGNORE INTO deliveries VALUES (?,?)", (task, text))
        return "本地交付记录已保存；没有向网络发布。"

    return deliver


def count(directory, task):
    path = directory / "deliveries.sqlite3"
    if not path.exists():
        return 0
    with closing(sqlite3.connect(path)) as db:
        return db.execute(
            "SELECT count(*) FROM deliveries WHERE id=?", (task,)
        ).fetchone()[0]


def execute(action, directory, task, build=None, files=None):
    directory = Path(directory)
    directory.mkdir(parents=True, exist_ok=True)
    tool = delivery_tool(directory, task)
    with SqliteSaver.from_conn_string(str(directory / "checkpoints.sqlite3")) as saver:
        agent = (
            build(saver, tool)
            if build
            else create_deep_agent(
                model=ScriptModel(
                    steps=[call("deliver", text="学习计划：运行一个 Python 例子")]
                ),
                tools=[tool],
                checkpointer=saver,
                interrupt_on={"deliver": {"allowed_decisions": ["approve", "reject"]}},
            )
        )
        config = {"configurable": {"thread_id": task}, "recursion_limit": 80}
        snapshot = agent.get_state(config)
        if action == "start" and not snapshot.values:
            agent.invoke(
                {
                    "messages": [("user", "制作学习计划，交付前等我确认")],
                    **({"files": files} if files else {}),
                },
                config,
            )
        elif action in ("approve", "reject"):
            if not snapshot.values:
                raise ValueError("先 start，再审批")
            if snapshot.next:
                agent.invoke(Command(resume={"decisions": [{"type": action}]}), config)
        snapshot = agent.get_state(config)
        waiting = bool(snapshot.next)
        requests = [
            interrupt.value for t in snapshot.tasks for interrupt in t.interrupts
        ]
        return {
            "status": "waiting_approval"
            if waiting
            else ("finished" if snapshot.values else "not_started"),
            "deliveries": count(directory, task),
            "approval_requests": requests,
            "files": sorted(snapshot.values.get("files", {})),
            "todos": snapshot.values.get("todos", []),
        }


def arguments():
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=["start", "status", "approve", "reject"])
    parser.add_argument("--task", default="demo")
    parser.add_argument("--directory", default="work/deep-approval")
    return parser.parse_args()


if __name__ == "__main__":
    args = arguments()
    show(execute(args.action, args.directory, args.task))
