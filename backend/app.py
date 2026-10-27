from contextlib import asynccontextmanager, contextmanager
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import sqlite3
from typing import Literal

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel, ConfigDict, Field, model_validator
from backend.curriculum import CURRICULUM, LESSONS, PROJECTS, RESOURCES

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = Path(os.environ.get("AGENT_PATH_DB", str(ROOT / "data" / "learning.sqlite3")))
LESSON_MAP = {x["id"]: x for x in LESSONS}
PROJECT_MAP = {x["id"]: x for x in PROJECTS}
RESOURCE_IDS = {x["id"] for x in RESOURCES}


def now():
    return datetime.now(timezone.utc).isoformat()


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)


class LessonState(StrictModel):
    checks: list[bool] = Field(default_factory=lambda: [False, False, False], min_length=3, max_length=3)
    note: str = Field(default="", max_length=30000)
    answer: int | None = Field(default=None, ge=0, le=2)
    completed_at: str | None = None


class LessonPatch(StrictModel):
    checks: list[bool] | None = Field(default=None, min_length=3, max_length=3)
    note: str | None = Field(default=None, max_length=30000)
    answer: int | None = Field(default=None, ge=0, le=2)


class Settings(StrictModel):
    daily_minutes: Literal[30, 60, 90] = 60


class ProjectState(StrictModel):
    checks: list[bool] = Field(default_factory=lambda: [False] * 4, min_length=4, max_length=4)


class Bookmark(StrictModel):
    saved: bool


class Backup(StrictModel):
    version: Literal[1] = 1
    lessons: dict[str, LessonState] = Field(default_factory=dict)
    projects: dict[str, ProjectState] = Field(default_factory=dict)
    bookmarks: list[str] = Field(default_factory=list, max_length=200)
    settings: Settings = Field(default_factory=Settings)

    @model_validator(mode="after")
    def known_ids(self):
        if set(self.lessons) - LESSON_MAP.keys() or set(self.projects) - PROJECT_MAP.keys() or set(self.bookmarks) - RESOURCE_IDS:
            raise ValueError("备份含未知课程、项目或资料 ID，请确认文件来自本学习站")
        if len(self.bookmarks) != len(set(self.bookmarks)):
            raise ValueError("收藏不能重复")
        return self


@contextmanager
def connection():
    db = sqlite3.connect(DB_PATH, timeout=10)
    try:
        db.execute("PRAGMA busy_timeout=10000")
        with db:
            yield db
    finally:
        db.close()


def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with connection() as db:
        db.execute("CREATE TABLE IF NOT EXISTS state (kind TEXT NOT NULL, id TEXT NOT NULL, value TEXT NOT NULL, PRIMARY KEY(kind,id))")


def state_from_rows(rows):
    result = Backup().model_dump()
    for kind, id, value in rows:
        data = json.loads(value)
        if kind in ("lessons", "projects"):
            result[kind][id] = data
        elif kind == "bookmarks" and data:
            result["bookmarks"].append(id)
        elif kind == "settings":
            result["settings"] = data
    return Backup.model_validate(result).model_dump()


def read_state():
    with connection() as db:
        return state_from_rows(db.execute("SELECT kind,id,value FROM state").fetchall())


def put(db, kind, id, value):
    db.execute("INSERT INTO state(kind,id,value) VALUES (?,?,?) ON CONFLICT(kind,id) DO UPDATE SET value=excluded.value",
               (kind, id, json.dumps(value, ensure_ascii=False)))


@asynccontextmanager
async def lifespan(app):
    init_db()
    yield


app = FastAPI(title="Agent Path · 学习工作台", lifespan=lifespan)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["127.0.0.1", "localhost", "testserver"])


@app.middleware("http")
async def local_writes(request: Request, call_next):
    if request.method not in ("GET", "HEAD", "OPTIONS"):
        origin = request.headers.get("origin")
        if origin and origin not in {"http://127.0.0.1:8099", "http://localhost:8099", "http://127.0.0.1:5189", "http://localhost:5189", "http://127.0.0.1:8100"}:
            return JSONResponse({"detail": "不允许的请求来源"}, status_code=403)
        if int(request.headers.get("content-length", "0")) > 2_000_000:
            return JSONResponse({"detail": "文件过大，请使用小于 2 MB 的学习备份"}, status_code=413)
    response = await call_next(request)
    if request.url.path.startswith("/api"):
        response.headers["Cache-Control"] = "no-store"
    return response


@app.exception_handler(sqlite3.Error)
async def database_error(request, exc):
    return JSONResponse({"detail": "学习记录暂时无法保存，请重试并检查数据目录权限。原有记录没有被清空。"}, status_code=503)


@app.get("/api/health")
def health():
    with connection() as db:
        db.execute("SELECT count(*) FROM state").fetchone()
    return {"ok": True, "service": "agent-path", "curriculum": CURRICULUM["version"]}


@app.get("/api/bootstrap")
def bootstrap():
    return {"curriculum": CURRICULUM, "state": read_state()}


@app.patch("/api/lessons/{id}")
def update_lesson(id: str, patch: LessonPatch):
    if id not in LESSON_MAP:
        raise HTTPException(404, "课程不存在")
    with connection() as db:
        db.execute("BEGIN IMMEDIATE")
        row = db.execute("SELECT value FROM state WHERE kind='lessons' AND id=?", (id,)).fetchone()
        value = LessonState.model_validate_json(row[0]) if row else LessonState()
        changes = patch.model_dump(exclude_unset=True)
        if changes.get("checks", []) is None or changes.get("note", "") is None:
            raise HTTPException(422, "验收项和笔记不能为 null")
        value = LessonState.model_validate({**value.model_dump(), **changes})
        complete = all(value.checks) and value.answer == LESSON_MAP[id]["quiz"]["answer"]
        value.completed_at = (value.completed_at or now()) if complete else None
        put(db, "lessons", id, value.model_dump())
    return value


@app.put("/api/projects/{id}")
def update_project(id: str, value: ProjectState):
    if id not in PROJECT_MAP:
        raise HTTPException(404, "项目不存在")
    with connection() as db:
        put(db, "projects", id, value.model_dump())
    return value


@app.put("/api/bookmarks/{id}")
def update_bookmark(id: str, body: Bookmark):
    if id not in RESOURCE_IDS:
        raise HTTPException(404, "资料不存在")
    with connection() as db:
        if body.saved:
            put(db, "bookmarks", id, True)
        else:
            db.execute("DELETE FROM state WHERE kind='bookmarks' AND id=?", (id,))
    return body


@app.put("/api/settings")
def update_settings(body: Settings):
    with connection() as db:
        put(db, "settings", "main", body.model_dump())
    return body


@app.get("/api/export")
def export():
    return JSONResponse(read_state(), headers={"Content-Disposition": 'attachment; filename="agent-path-backup.json"'})


@app.post("/api/import")
def restore(body: Backup):
    # Validated entirely before starting a transaction. Snapshot before replacement.
    with connection() as db:
        db.execute("BEGIN IMMEDIATE")
        snapshot = DB_PATH.parent / ("before-import-" + datetime.now().strftime("%Y%m%d-%H%M%S-%f") + ".json")
        old_rows = db.execute("SELECT kind,id,value FROM state").fetchall()
        snapshot.write_text(json.dumps(state_from_rows(old_rows), ensure_ascii=False, indent=2), encoding="utf-8")
        db.execute("DELETE FROM state")
        for id, value in body.lessons.items():
            complete = all(value.checks) and value.answer == LESSON_MAP[id]["quiz"]["answer"]
            value.completed_at = (value.completed_at or now()) if complete else None
            put(db, "lessons", id, value.model_dump())
        for id, value in body.projects.items():
            put(db, "projects", id, value.model_dump())
        for id in body.bookmarks:
            put(db, "bookmarks", id, True)
        put(db, "settings", "main", body.settings.model_dump())
    return read_state()


@app.get("/{path:path}")
def frontend(path: str):
    if path.startswith("api/"):
        raise HTTPException(404, "接口不存在")
    dist = (ROOT / "dist").resolve()
    target = (dist / path).resolve()
    if not target.is_relative_to(dist):
        raise HTTPException(404)
    if target.is_file():
        return FileResponse(target)
    if Path(path).suffix:
        raise HTTPException(404)
    if not (dist / "index.html").exists():
        raise HTTPException(503, "请先运行 npm run build")
    return FileResponse(dist / "index.html")
