import json
from pathlib import Path

path = Path(__file__).with_name("tasks.json")
if not path.exists():
    text = json.dumps([{"title": "练习", "done": False}], ensure_ascii=False)
    path.write_text(text, encoding="utf-8")
try:
    tasks = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(tasks, list):
        raise ValueError("最外层必须是列表")
    print(tasks)
except (json.JSONDecodeError, ValueError) as error:
    print("读取失败，原文件未覆盖：", error)
