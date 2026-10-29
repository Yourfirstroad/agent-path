from pathlib import Path
import json


def extract(text):
    if not text.startswith("任务："):
        raise ValueError("请输入任务：加标题")
    return {"title": text[3:].strip()}


def workflow(text, confirmed=False, path=Path("confirmed.json")):
    draft = extract(text)
    if not draft["title"]:
        raise ValueError("空标题不保存")
    if not confirmed:
        return {"status": "preview", "draft": draft}
    path.write_text(json.dumps(draft, ensure_ascii=False), encoding="utf-8")
    return {"status": "saved", "draft": draft}


if __name__ == "__main__":
    print(workflow("任务：学习流程"))
    print(workflow("任务：学习流程", confirmed=True))
    try:
        workflow("无法理解的输入", confirmed=True)
    except ValueError as e:
        print("请人工修改：", e)
