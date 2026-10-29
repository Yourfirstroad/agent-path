from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()


@app.get("/", response_class=HTMLResponse)
def home():
    return Path(__file__).with_name("index.html").read_text(encoding="utf-8")


@app.get("/api/tasks")
def tasks():
    return [{"id": 1, "title": "学习 fetch", "done": False}]
