"""第三课：只选择有来源、适合当前问题且放得下的资料。"""

CATALOG = [
    {
        "topic": "Python",
        "text": "函数用 def 定义。",
        "source": "https://docs.python.org/3/tutorial/",
        "reviewed": "2026-10-29",
    },
    {
        "topic": "Deep Agents",
        "text": "SDK 提供文件工具与子代理。",
        "source": "https://docs.langchain.com/oss/python/deepagents/overview",
        "reviewed": "2026-10-29",
    },
]


def context_for(topic, max_chars=200):
    selected, used = [], 0
    for row in CATALOG:
        if row["topic"].casefold() != topic.casefold():
            continue
        # 把来源也算进字符预算；字符数不是 token 数，更不是费用。
        text = f"{row['text']} 来源：{row['source']} 核对：{row['reviewed']}"
        if used + len(text) <= max_chars:
            selected.append(text)
            used += len(text)
    return {"context": selected, "chars": used, "answerable": bool(selected)}


if __name__ == "__main__":
    print("正常：", context_for("Python"))
    print("空间不足：", context_for("Python", max_chars=5))
    print("未知：", context_for("不存在的主题"))
