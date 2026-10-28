"""Run: python 06_graph_routes.py --mode review (or practice). No LLM is required."""
import argparse
from typing import TypedDict, Literal
from lab_support import show
from langgraph.graph import StateGraph, START, END

class RouteState(TypedDict):
    mode: Literal['review', 'practice']
    task: str

def choose(state: RouteState):
    return state['mode']

def build():
    builder = StateGraph(RouteState)
    builder.add_node('review', lambda state: {'task': '解释昨天的代码，并修复一个已记录的错误'})
    builder.add_node('practice', lambda state: {'task': '独立运行一个例子，再修改输入验证结果'})
    builder.add_conditional_edges(START, choose, {'review': 'review', 'practice': 'practice'})
    builder.add_edge('review', END); builder.add_edge('practice', END)
    return builder.compile()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(); parser.add_argument('--mode', choices=['review', 'practice'], default='practice')
    show(build().invoke({'mode': parser.parse_args().mode, 'task': ''}))
