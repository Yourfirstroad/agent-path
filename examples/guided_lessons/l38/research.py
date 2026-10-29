from contextlib import closing
import sqlite3
from pathlib import Path
from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.types import interrupt, Command
from langgraph.checkpoint.sqlite import SqliteSaver


class State(TypedDict, total=False):
    id: str
    topic: str
    budget: int
    spent: int
    status: str
    sources: list
    draft: str
    trace: list
    writes: int


def build(saver, directory):
    def research(s):
        if s["budget"] < 1:
            return {
                "status": "budget_exhausted",
                "spent": 0,
                "trace": ["预算不足，未查询"],
                "sources": [],
            }
        catalog = {
            "Python": "https://docs.python.org/3/tutorial/",
            "LangGraph": "https://docs.langchain.com/oss/python/langgraph/overview",
        }
        url = catalog.get(s["topic"])
        if not url:
            return {
                "status": "no_evidence",
                "spent": 1,
                "trace": ["本地目录无结果"],
                "sources": [],
            }
        return {
            "status": "waiting_approval",
            "spent": 1,
            "sources": [url],
            "draft": f"阅读 {s['topic']} 官方入门并运行第一个例子",
            "trace": ["查询本地官方目录", "生成规则计划"],
        }

    def approval(s):
        decision = interrupt({"draft": s["draft"], "sources": s["sources"]})
        if decision not in ("approve", "reject", "cancel"):
            raise ValueError("未知决策")
        status = {"approve": "approved", "reject": "rejected", "cancel": "cancelled"}[
            decision
        ]
        return {"status": status, "trace": s["trace"] + [status]}

    def commit(s):
        with closing(sqlite3.connect(directory / "actions.db")) as db, db:
            db.execute(
                "CREATE TABLE IF NOT EXISTS actions(id TEXT PRIMARY KEY,draft TEXT)"
            )
            db.execute(
                "INSERT OR IGNORE INTO actions VALUES (?,?)", (s["id"], s["draft"])
            )
            count = db.execute(
                "SELECT count(*) FROM actions WHERE id=?", (s["id"],)
            ).fetchone()[0]
        return {"status": "done", "writes": count, "trace": s["trace"] + ["保存一次"]}

    graph = StateGraph(State)
    graph.add_node("research", research)
    graph.add_node("approval", approval)
    graph.add_node("commit", commit)
    graph.add_edge(START, "research")
    graph.add_conditional_edges(
        "research",
        lambda s: "approval" if s["status"] == "waiting_approval" else END,
        {"approval": "approval", END: END},
    )
    graph.add_conditional_edges(
        "approval",
        lambda s: "commit" if s["status"] == "approved" else END,
        {"commit": "commit", END: END},
    )
    graph.add_edge("commit", END)
    return graph.compile(checkpointer=saver)


def operate(directory, task_id, action, topic="LangGraph", budget=2):
    directory = Path(directory)
    directory.mkdir(parents=True, exist_ok=True)
    config = {"configurable": {"thread_id": task_id}, "recursion_limit": 12}
    with SqliteSaver.from_conn_string(str(directory / "checkpoints.db")) as saver:
        graph = build(saver, directory)
        old = graph.get_state(config)
        if action == "start":
            if old.values:
                raise ValueError("任务已存在，请读取或继续")
            graph.invoke(
                {
                    "id": task_id,
                    "topic": topic,
                    "budget": budget,
                    "spent": 0,
                    "writes": 0,
                },
                config,
            )
        elif action in ("approve", "reject", "cancel"):
            if not old.values:
                raise ValueError("找不到任务")
            if old.next:
                graph.invoke(Command(resume=action), config)
        snapshot = graph.get_state(config)
        if not snapshot.values:
            raise ValueError("找不到任务")
        return dict(snapshot.values)
