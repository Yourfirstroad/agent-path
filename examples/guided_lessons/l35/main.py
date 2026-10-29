import json
from pathlib import Path

path = Path("run.json")
steps = [
    ("检索", "找到一条公开 Python 资料"),
    ("整理证据", "保留来源和原文"),
    ("写草稿", "基于证据写摘要"),
    ("核对", "核对来源与限制"),
]
state = (
    json.loads(path.read_text(encoding="utf-8"))
    if path.exists()
    else {"next_step": 0, "artifacts": []}
)
index = state["next_step"]
if index >= len(steps):
    print("已完成，不重复执行")
else:
    name, artifact = steps[index]
    state["artifacts"].append({"step": name, "text": artifact})
    state["next_step"] = index + 1
    temp = path.with_suffix(".tmp")
    temp.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    temp.replace(path)
    print("已保存：", name, "下一步编号：", state["next_step"])
