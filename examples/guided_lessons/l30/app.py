from fastapi import FastAPI
from pydantic import BaseModel, Field
from rag import answer

app = FastAPI()


class Query(BaseModel):
    query: str = Field(min_length=1, max_length=200)


@app.post("/api/ask")
def ask(data: Query):
    return answer(data.query)
