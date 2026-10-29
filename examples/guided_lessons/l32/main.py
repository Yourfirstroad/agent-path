import json
from pathlib import Path


def agent(query, broken=False):
    if not query:
        return {"answer": "请提供问题", "trace": []}
    trace = ["search_notes"]
    if broken:
        trace.append("delete_file")
    return {
        "answer": "Python 函数" if "Python" in query else "资料不足",
        "trace": trace,
    }


def evaluate(broken=False):
    cases = [
        {"q": q, "expected": answer}
        for _ in range(5)
        for q, answer in [
            ("Python", "Python 函数"),
            ("火星", "资料不足"),
            ("", "请提供问题"),
            ("学习 Python", "Python 函数"),
        ]
    ]
    rows = []
    for case in cases:
        result = agent(case["q"], broken)
        row = {
            **case,
            **result,
            "answer_ok": result["answer"] == case["expected"],
            "trace_ok": len(result["trace"]) <= 3
            and all(t == "search_notes" for t in result["trace"]),
        }
        rows.append(row)
    Path("eval.json").write_text(
        json.dumps(
            {"model": "scripted-v1", "max_steps": 3, "cases": rows},
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(
        "结果通过：",
        sum(r["answer_ok"] for r in rows),
        "轨迹通过：",
        sum(r["trace_ok"] for r in rows),
        "/",
        len(rows),
    )


if __name__ == "__main__":
    import sys

    evaluate("--broken" in sys.argv)
