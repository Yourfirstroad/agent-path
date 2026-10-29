from fastapi import FastAPI
from pydantic import BaseModel, Field, field_validator

app = FastAPI()


class Task(BaseModel):
    title: str = Field(min_length=1)
    minutes: int = Field(ge=1, le=180, strict=True)

    @field_validator("title")
    @classmethod
    def nonblank(cls, value):
        if not value.strip():
            raise ValueError("标题不能为空白")
        return value.strip()


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/tasks")
def create_task(task: Task):
    return task
