import os, threading
from pathlib import Path
from uuid import uuid4
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from research import operate

app = FastAPI()
directory = Path(os.getenv("LAB_DATA_DIR", "data"))
lock = threading.Lock()


class Start(BaseModel):
    topic: str = Field(min_length=1, max_length=80)
    budget: int = Field(ge=0, le=5)


class Decision(BaseModel):
    id: str
    action: str


def call(id, action, topic="LangGraph", budget=2):
    with lock:
        try:
            return operate(directory, id, action, topic, budget)
        except ValueError as error:
            raise HTTPException(400, str(error)) from error


@app.post("/api/start")
def start(data: Start):
    return call(str(uuid4()), "start", data.topic, data.budget)


@app.post("/api/decision")
def decision(data: Decision):
    if data.action not in ("approve", "reject", "cancel"):
        raise HTTPException(422, "未知决策")
    return call(data.id, data.action)


@app.get("/api/run/{id}")
def read(id: str):
    return call(id, "show")
