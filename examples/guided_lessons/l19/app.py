import asyncio, json
from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import HTMLResponse, StreamingResponse

app = FastAPI()


@app.get("/", response_class=HTMLResponse)
def home():
    return Path(__file__).with_name("index.html").read_text(encoding="utf-8")


@app.get("/stream")
def stream(fail: bool = False):
    async def events():
        for index, word in enumerate(["这是", "本地", "预设", "文字流。"]):
            await asyncio.sleep(0.4)
            if fail and index == 2:
                return
            yield json.dumps({"text": word}, ensure_ascii=False) + "\n"
        yield json.dumps({"done": True}) + "\n"

    return StreamingResponse(events(), media_type="application/x-ndjson")
