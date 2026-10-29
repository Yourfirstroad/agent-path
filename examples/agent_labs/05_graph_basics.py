"""Run: python 05_graph_basics.py. Graph nodes return partial state updates."""

from typing import TypedDict
from lab_support import show
from langgraph.graph import StateGraph, START, END


class StudyState(TypedDict):
    topic: str
    task: str
    result: str


def prepare(state: StudyState):
    return {"task": f"阅读 {state['topic']} 官方入门，并运行一个例子"}


def summarize(state: StudyState):
    return {"result": f"下一步：{state['task']}；完成后记录真实输出。"}


def build():
    builder = StateGraph(StudyState)
    builder.add_node("prepare", prepare)
    builder.add_node("summarize", summarize)
    builder.add_edge(START, "prepare")
    builder.add_edge("prepare", "summarize")
    builder.add_edge("summarize", END)
    return builder.compile()


if __name__ == "__main__":
    show(build().invoke({"topic": "LangGraph", "task": "", "result": ""}))
