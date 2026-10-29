import json
from pathlib import Path

DOCS = json.loads(Path(__file__).with_name("docs.json").read_text(encoding="utf-8"))


def retrieve(query):
    query = query.strip().lower()
    if not query:
        return []
    return [doc for doc in DOCS if query in (doc["title"] + doc["text"]).lower()]


def answer(query):
    hits = retrieve(query)
    if not hits:
        return {"answer": "资料不足，无法回答", "sources": []}
    return {
        "answer": "\n".join(f"[{d['id']}] {d['text']}" for d in hits),
        "sources": hits,
    }


if __name__ == "__main__":
    for query in ["HTTP", "火星天气"]:
        print(answer(query))
