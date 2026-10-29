"""第六课：把资料选择、执行预算和审批交付连接起来。不会发送邮件或发布到网络。"""

import argparse
from h03_context import context_for
from h04_checkpoint import act
from h05_limits import Budget, retry_read


def start(db, task, topic):
    budget = Budget(max_calls=2)
    evidence = retry_read(lambda: context_for(topic), budget)
    if not evidence["answerable"]:
        return {"status": "no_evidence", "calls": budget.calls, "deliveries": 0}
    draft = "\n".join(evidence["context"])
    result = act(db, task, "start", draft)
    return {**result, "calls": budget.calls, "draft": draft}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=["start", "status", "approve", "reject"])
    parser.add_argument("--topic", default="Python")
    parser.add_argument("--task", default="research")
    parser.add_argument("--db", default="work/research.sqlite3")
    args = parser.parse_args()
    print(
        start(args.db, args.task, args.topic)
        if args.action == "start"
        else act(args.db, args.task, args.action)
    )
