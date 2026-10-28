"""Research -> validated plan -> human approval -> idempotent local record."""
import argparse
from pathlib import Path
from typing import TypedDict
from lab_support import StudyPlan, PUBLIC_RESOURCES, model_for, search_resources, write_once, action_count, show
from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.types import interrupt, Command

class ResearchState(TypedDict, total=False):
    task_id: str
    topic: str
    plan: dict
    status: str
    writes: int

def build(saver, directory, live=False):
    def research(state):
        agent = create_agent(model=model_for(live, structured=True), tools=[search_resources],
            system_prompt='查询本地官方资料目录，为主题生成一份带来源的 60 分钟学习计划。',
            response_format=ToolStrategy(StudyPlan))
        result = agent.invoke({'messages': [{'role': 'user', 'content': f"为 {state['topic']} 安排学习计划"}]}, {'recursion_limit': 12})
        plan = result.get('structured_response')
        if not isinstance(plan, StudyPlan): raise ValueError('没有有效的结构化计划，不进入审批或写入。')
        if any(source not in PUBLIC_RESOURCES.values() for source in plan.sources):
            raise ValueError('计划含资料目录之外的来源，停止执行。')
        return {'plan': plan.model_dump(), 'status': 'waiting_approval'}
    def approve(state):
        # Code before interrupt can execute again on resume: keep it free of writes.
        decision = interrupt({'question': '确认后才会写入本地实验记录', 'plan': state['plan']})
        if not isinstance(decision, bool): raise ValueError('审批必须是布尔值')
        return {'status': 'approved' if decision else 'rejected'}
    def commit(state):
        return {'writes': write_once(directory, state['task_id'], state['plan']), 'status': 'done'}
    builder = StateGraph(ResearchState)
    builder.add_node('research', research); builder.add_node('approve', approve); builder.add_node('commit', commit)
    builder.add_node('reject', lambda state: {'status': 'rejected', 'writes': 0})
    builder.add_edge(START, 'research'); builder.add_edge('research', 'approve')
    builder.add_conditional_edges('approve', lambda state: state['status'], {'approved': 'commit', 'rejected': 'reject'})
    builder.add_edge('commit', END); builder.add_edge('reject', END)
    return builder.compile(checkpointer=saver)

def main():
    parser = argparse.ArgumentParser(); parser.add_argument('mode', choices=['start', 'approve', 'reject', 'show'])
    parser.add_argument('--thread', default='research-demo'); parser.add_argument('--workdir', type=Path, default=Path('work/research'))
    parser.add_argument('--topic', choices=list(PUBLIC_RESOURCES), default='LangGraph')
    parser.add_argument('--stream', action='store_true'); parser.add_argument('--live', action='store_true')
    args = parser.parse_args(); args.workdir.mkdir(parents=True, exist_ok=True)
    config = {'configurable': {'thread_id': args.thread}, 'recursion_limit': 12}
    with SqliteSaver.from_conn_string(str(args.workdir / 'checkpoints.sqlite3')) as saver:
        graph = build(saver, args.workdir, args.live); previous = graph.get_state(config)
        payload = None
        if args.mode == 'start':
            if previous.values: raise SystemExit('thread 已存在，不能重新 start 覆盖；请继续审批或换 thread。')
            payload = {'task_id': args.thread, 'topic': args.topic, 'status': 'starting'}
        elif args.mode in ('approve', 'reject'):
            if not previous.values: raise SystemExit('找不到任务，请先 start。')
            if previous.next: payload = Command(resume=args.mode == 'approve')
        if payload is not None:
            if args.stream:
                for update in graph.stream(payload, config, stream_mode='updates'): show({'node_update': update})
            else: graph.invoke(payload, config)
        snapshot = graph.get_state(config)
        show({'mode': 'live' if args.live else 'offline-scripted', 'state': snapshot.values,
              'pending': list(snapshot.next), 'action_count': action_count(args.workdir, args.thread)})

if __name__ == '__main__':
    main()
