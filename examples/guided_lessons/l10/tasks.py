from contextlib import closing
import argparse
import sqlite3
from pathlib import Path


def execute(command, value=None, path=Path("tasks.db")):
    if command == "add" and (not value or not value.strip()):
        raise ValueError("标题不能为空")
    with closing(sqlite3.connect(path)) as db, db:
        db.execute(
            "CREATE TABLE IF NOT EXISTS tasks(id INTEGER PRIMARY KEY, title TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0)"
        )
        if command == "add":
            row = db.execute("INSERT INTO tasks(title) VALUES (?)", (value.strip(),))
            return f"已添加 #{row.lastrowid}"
        if command == "done":
            row = db.execute("UPDATE tasks SET done=1 WHERE id=?", (int(value),))
            if row.rowcount == 0:
                raise ValueError("任务不存在")
            return f"已完成 #{value}"
        return db.execute("SELECT id,title,done FROM tasks ORDER BY id").fetchall()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=["add", "list", "done"])
    parser.add_argument("value", nargs="?")
    parser.add_argument("--db", type=Path, default=Path("tasks.db"))
    args = parser.parse_args()
    try:
        if args.command == "done" and args.value is None:
            raise ValueError("请提供任务编号")
        print(execute(args.command, args.value, args.db))
    except (ValueError, sqlite3.DatabaseError) as error:
        parser.exit(1, f"操作失败（原文件保留）：{error}\n")
