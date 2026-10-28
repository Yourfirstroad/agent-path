"""Start and resume in DIFFERENT processes; --workdir owns only these lab databases."""
import argparse
from pathlib import Path
from typing import TypedDict
from lab_support import action_count, write_once, show
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.sqlite import SqliteSaver

class TaskState(TypedDict, total=False):
    task_id: str
    topic: str
    draft: str
    status: str
    writes: int

def build(checkpointer, directory: Path):
    def plan(state):
        return {'draft': f"练习 {state['topic']}，保留真实运行结果", 'status': 'planned'}
    def finish(state):
        count = write_once(directory, state['task_id'], {'draft': state['draft']})
        return {'status': 'done', 'writes': count}
    builder = StateGraph(TaskState)
    builder.add_node('plan', plan); builder.add_node('finish', finish)
    builder.add_edge(START, 'plan'); builder.add_edge('plan', 'finish'); builder.add_edge('finish', END)
    # A static breakpoint for this persistence exercise; human approvals use interrupt().
    return builder.compile(checkpointer=checkpointer, interrupt_after=['plan'])

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('mode', choices=['start', 'resume', 'show'])
    parser.add_argument('--thread', default='lab07-demo')
    parser.add_argument('--workdir', type=Path, default=Path('work/lab07'))
    args = parser.parse_args(); args.workdir.mkdir(parents=True, exist_ok=True)
    config = {'configurable': {'thread_id': args.thread}}
    with SqliteSaver.from_conn_string(str(args.workdir / 'checkpoints.sqlite3')) as saver:
        graph = build(saver, args.workdir)
        previous = graph.get_state(config)
        if args.mode == 'start':
            if previous.values:
                raise SystemExit('这个 thread 已有记录；请用 resume / show，或换一个新 thread。')
            graph.invoke({'task_id': args.thread, 'topic': 'LangGraph'}, config)
        elif args.mode == 'resume':
            if not previous.values:
                raise SystemExit('找不到这个 thread；请先 start，并保持相同 workdir 和 thread。')
            graph.invoke(None, config)
        snapshot = graph.get_state(config)
        show({'state': snapshot.values, 'pending': list(snapshot.next),
              'action_count': action_count(args.workdir, args.thread)})

if __name__ == '__main__':
    main()
