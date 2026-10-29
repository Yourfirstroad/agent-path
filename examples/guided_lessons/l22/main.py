from tools import dispatch


def run(always_tool=False, limit=3):
    messages = []
    for step in range(limit):
        # 教学脚本模拟模型提议，不具有自主推理。
        if step < 2 or always_tool:
            query = "Python" if step == 0 else "HTTP"
            action = {"name": "search_notes", "arguments": {"query": query}}
            result = dispatch(action)
            messages.append({"role": "tool", "content": result})
            print("工具步骤", step + 1, result)
        else:
            answer = "；".join(
                item for m in messages for item in m["content"].get("data", [])
            )
            print("最终：", answer)
            return {"status": "done", "messages": messages, "answer": answer}
    print("达到最大步数，停止")
    return {"status": "limit", "messages": messages}


if __name__ == "__main__":
    run()
    run(always_tool=True)
