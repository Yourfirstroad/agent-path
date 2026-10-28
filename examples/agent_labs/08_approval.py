"""A human decision pauses execution. Nothing is written before approval."""
import argparse
from pathlib import Path
from typing import TypedDict
from lab_support import action_count, write_once, show
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.types import interrupt, Command

class ApprovalState(TypedDict, total=False):
    task_id: str
    draft: str
    status: str
    writes: int

def build(saver, directory):
    def approval(state):
        decision = interrupt({'question': '是否把这条练习计划写入实验记录？', 'draft': state['draft']})
        if not isinstance(decision, bool):
            raise ValueError('审批必须是布尔值，不能把字符串 false 当作批准。')
        return {'status': 'approved' if decision else 'rejected'}
    def commit(state):
        return {'writes': write_once(directory, state['task_id'], {'draft': state['draft']}), 'status': 'done'}
    builder = StateGraph(ApprovalState)
    builder.add_node('approval', approval); builder.add_node('commit', commit)
    builder.add_node('reject', lambda state: {'status': 'rejected', 'writes': 0})
    builder.add_edge(START, 'approval')
    builder.add_conditional_edges('approval', lambda state: state['status'], {'approved': 'commit', 'rejected': 'reject'})
    builder.add_edge('commit', END); builder.add_edge('reject', END)
    return builder.compile(checkpointer=saver)

def main():
    parser = argparse.ArgumentParser(); parser.add_argument('mode', choices=['start', 'approve', 'reject', 'show'])
    parser.add_argument('--thread', default='lab08-demo'); parser.add_argument('--workdir', type=Path, default=Path('work/lab08'))
    args = parser.parse_args(); args.workdir.mkdir(parents=True, exist_ok=True)
    config = {'configurable': {'thread_id': args.thread}}
    with SqliteSaver.from_conn_string(str(args.workdir / 'checkpoints.sqlite3')) as saver:
        graph = build(saver, args.workdir); previous = graph.get_state(config)
        if args.mode == 'start':
            if previous.values: raise SystemExit('thread 已存在；请继续审批或换一个新 thread。')
            graph.invoke({'task_id': args.thread, 'draft': '今天运行并解释一个 LangGraph 例子', 'status': 'waiting'}, config)
        elif args.mode in ('approve', 'reject'):
            if not previous.values: raise SystemExit('找不到待审批任务，请先 start。')
            if previous.next: graph.invoke(Command(resume=args.mode == 'approve'), config)
        snapshot = graph.get_state(config)
        show({'state': snapshot.values, 'pending': list(snapshot.next), 'action_count': action_count(args.workdir, args.thread)})

if __name__ == '__main__':
    main()
