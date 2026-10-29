from contextlib import closing
import os, sqlite3
from pathlib import Path
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator

app = FastAPI()
DATA = Path(os.getenv("LAB_DATA_DIR", "data"))
DATA.mkdir(parents=True, exist_ok=True)
DB = DATA / "tasks.db"


def connection():
    db = sqlite3.connect(DB)
    db.execute(
        "CREATE TABLE IF NOT EXISTS tasks(id INTEGER PRIMARY KEY,title TEXT NOT NULL)"
    )
    return db


class Input(BaseModel):
    text: str
    fail: bool = False


class Task(BaseModel):
    title: str = Field(min_length=1, max_length=200)

    @field_validator("title")
    @classmethod
    def clean(cls, v):
        if not v.strip():
            raise ValueError("标题不能为空")
        return v.strip()


@app.get("/api/health")
def health():
    return {"ok": True}


@app.post("/api/extract")
def extract(data: Input):
    if data.fail:
        raise HTTPException(503, "教学模拟：模型服务不可用")
    if not data.text.startswith("任务："):
        raise HTTPException(422, "本课规则模式请使用 任务：标题")
    title = data.text[3:].strip()
    if not title or len(title) > 200:
        raise HTTPException(422, "标题长度应为 1 到 200")
    return {"mode": "offline-rule", "draft": {"title": title}}


@app.post("/api/tasks")
def save(task: Task):
    with closing(connection()) as db, db:
        row = db.execute("INSERT INTO tasks(title) VALUES (?)", (task.title,))
        return {"id": row.lastrowid, "title": task.title}


@app.get("/api/tasks")
def tasks():
    with closing(connection()) as db, db:
        return [
            {"id": id, "title": title}
            for id, title in db.execute("SELECT id,title FROM tasks ORDER BY id")
        ]
