import re
from datetime import date
from pydantic import BaseModel, Field, ValidationError, field_validator


# 给程序一张“任务表格”：标题必填，日期允许空，分数只能在 0 到 1。
class ExtractedTask(BaseModel):
    title: str = Field(min_length=1)
    due_date: str | None = None
    confidence: float = Field(ge=0, le=1)

    @field_validator("title")
    @classmethod
    def title_not_blank(cls, value):
        if not value.strip():
            raise ValueError("标题不能为空")
        return value.strip()

    @field_validator("due_date")
    @classmethod
    def valid_date(cls, value):
        if value is not None:
            if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
                raise ValueError("日期格式应为 YYYY-MM-DD")
            date.fromisoformat(value)
        return value


def extract(text):
    # 这是规则演示，不是大模型：只支持“任务：标题；日期：YYYY-MM-DD”。
    parts = text.split("；")
    if len(parts) > 2 or not parts[0].startswith("任务："):
        raise ValueError("请使用 任务：标题；日期：YYYY-MM-DD，日期段可省略")
    title = parts[0][3:].strip()
    due_date = None
    if len(parts) == 2:
        if not parts[1].startswith("日期："):
            raise ValueError("第二段应以日期：开头")
        raw = parts[1][3:].strip()
        if raw:
            due_date = raw  # “明天”或冲突日期交给校验拒绝，绝不猜。
    draft = {"title": title, "due_date": due_date, "confidence": 0.0}
    return ExtractedTask.model_validate(draft)


if __name__ == "__main__":
    samples = [
        "任务：学习 Python；日期：2026-11-01",
        "任务：复习函数",
        "任务：复习；日期：明天",
        "任务：复习；日期：2026-11-01 或 2026-11-02",
        "任务：复习；日期：2026-02-30",
    ]
    for text in samples:
        print("输入：", text)
        try:
            print("结果：", extract(text).model_dump_json())
        except (ValueError, ValidationError):
            print("需要修改：标题不能为空，日期请只填一个真实的 YYYY-MM-DD 日期")
    try:
        ExtractedTask.model_validate({"title": "学习", "confidence": 1.5})
    except ValidationError:
        print("校验拦截：confidence 不能大于 1")
