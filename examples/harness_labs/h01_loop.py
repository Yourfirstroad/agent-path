"""第一课：看清模型提议、工具执行和停止；仅用 Python 标准库。"""

import json


def run(limit=3, repeat=False):
    messages = []
    for step in range(limit):
        # 教学替身：第一次查资料，第二次回答。它不是能推理的模型。
        proposal = (
            {"tool": "lookup", "topic": "Python"}
            if not messages or repeat
            else {"answer": messages[-1]["result"]}
        )
        if "answer" in proposal:
            return {"status": "done", "answer": proposal["answer"], "events": messages}
        if proposal["tool"] != "lookup":
            return {"status": "rejected", "events": messages}
        result = {"Python": "https://docs.python.org/3/tutorial/"}.get(
            proposal["topic"], "没有依据"
        )
        messages.append({"step": step + 1, "tool": "lookup", "result": result})
    return {"status": "step_limit", "events": messages}


if __name__ == "__main__":
    print(json.dumps(run(), ensure_ascii=False, indent=2))
    print("一直调用工具：", run(limit=2, repeat=True)["status"])
