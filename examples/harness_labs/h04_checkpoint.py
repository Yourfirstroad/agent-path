"""第四课：用 SQLite 保存待审批草稿；多次批准只写一份本地交付记录。"""

import argparse
from contextlib import closing
from pathlib import Path
import sqlite3


def act(path, task, action, draft="Python 学习草稿"):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with closing(sqlite3.connect(path)) as db, db:
        db.execute(
            "CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY, status TEXT, draft TEXT)"
        )
        db.execute(
            "CREATE TABLE IF NOT EXISTS deliveries(id TEXT PRIMARY KEY, draft TEXT)"
        )
        if action == "start":
            db.execute(
                "INSERT OR IGNORE INTO jobs VALUES (?, 'waiting', ?)", (task, draft)
            )
        row = db.execute("SELECT status,draft FROM jobs WHERE id=?", (task,)).fetchone()
        if not row:
            raise ValueError("任务不存在，请先 start")
        if action == "start" and row[1] != draft:
            raise ValueError("该任务已有不同草稿，请换一个 --task，不能悄悄覆盖")
        if action == "approve" and row[0] == "waiting":
            db.execute("INSERT OR IGNORE INTO deliveries VALUES (?,?)", (task, row[1]))
            db.execute("UPDATE jobs SET status='done' WHERE id=?", (task,))
        elif action == "reject" and row[0] == "waiting":
            db.execute("UPDATE jobs SET status='rejected' WHERE id=?", (task,))
        state = db.execute("SELECT status FROM jobs WHERE id=?", (task,)).fetchone()[0]
        count = db.execute(
            "SELECT count(*) FROM deliveries WHERE id=?", (task,)
        ).fetchone()[0]
        return {"task": task, "status": state, "deliveries": count}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=["start", "status", "approve", "reject"])
    parser.add_argument("--task", default="demo")
    parser.add_argument("--db", default="work/harness.sqlite3")
    args = parser.parse_args()
    print(act(args.db, args.task, args.action))
