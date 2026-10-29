from contextlib import closing
import sqlite3
from pathlib import Path

path = Path(__file__).with_name("study.db")
with closing(sqlite3.connect(path)) as db, db:
    db.execute(
        "CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, title TEXT, done INTEGER)"
    )
    db.executemany(
        "INSERT OR IGNORE INTO tasks VALUES (?, ?, ?)", [(1, "SQL", 0), (2, "HTTP", 0)]
    )
    db.execute("UPDATE tasks SET done = ? WHERE id = ?", (1, 1))
with closing(sqlite3.connect(path)) as db, db:
    print(
        "全部：", db.execute("SELECT id, title, done FROM tasks ORDER BY id").fetchall()
    )
    print(
        "待学习：",
        db.execute("SELECT title FROM tasks WHERE done = ?", (0,)).fetchall(),
    )
