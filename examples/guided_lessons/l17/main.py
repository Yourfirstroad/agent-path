import os
import json
from time import perf_counter
import httpx


def ask(text, live=False, fail=False):
    if not text.strip():
        raise ValueError("问题不能为空")
    if not live:
        if fail:
            raise TimeoutError("教学模拟超时")
        return {"text": "离线预设：API 是程序之间交换信息的约定。", "usage": None}
    key = os.getenv("MODEL_API_KEY")
    model = os.getenv("MODEL_NAME")
    if not key or not model:
        raise ValueError("先设置 MODEL_API_KEY 和 MODEL_NAME")
    response = httpx.post(
        "https://api.deepseek.com/chat/completions",
        timeout=30,
        headers={"Authorization": f"Bearer {key}"},
        json={
            "model": model,
            "messages": [{"role": "user", "content": text}],
            "max_tokens": 128,
            "stream": False,
        },
    )
    response.raise_for_status()
    data = response.json()
    return {
        "text": data["choices"][0]["message"]["content"],
        "usage": data.get("usage"),
    }


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--live", action="store_true")
    parser.add_argument("--fail", action="store_true")
    args = parser.parse_args()
    start = perf_counter()
    try:
        result = ask("用一句话解释 API", args.live, args.fail)
        print(
            json.dumps(
                {"mode": "live" if args.live else "offline", "result": result},
                ensure_ascii=False,
            )
        )
    except (ValueError, KeyError, IndexError, TimeoutError, httpx.HTTPError) as error:
        # 不打印请求 headers、原始响应或密钥。
        print("请求失败：", type(error).__name__, "请检查配置、服务状态或稍后重试")
    print("elapsed_ms:", round((perf_counter() - start) * 1000, 2))
