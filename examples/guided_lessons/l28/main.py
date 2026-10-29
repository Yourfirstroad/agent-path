import json
from pathlib import Path
from rag import retrieve

DOCS = json.loads(Path(__file__).with_name("docs.json").read_text(encoding="utf-8"))


def run():
    # 前十题开发集，后十题保留集；此演示不据保留集改参数。
    cases = [{"query": d["title"], "expected": d["id"], "split": "dev"} for d in DOCS]
    cases += [
        {"query": d["title"].lower(), "expected": d["id"], "split": "holdout"}
        for d in DOCS
    ]
    rows = []
    for case in cases:
        # 两个切分策略：整条笔记 / 只留前两个字符（故意造成证据截断）。
        for strategy in ["whole", "short"]:
            hits = (
                retrieve(case["query"])
                if strategy == "whole"
                else [d for d in DOCS if case["query"].lower() in d["text"][:2].lower()]
            )
            ids = [d["id"] for d in hits[:3]]
            rows.append(
                {
                    **case,
                    "strategy": strategy,
                    "retrieved": ids,
                    "recall_at_3": int(case["expected"] in ids),
                }
            )
    for split in ["dev", "holdout"]:
        for strategy in ["whole", "short"]:
            group = [
                r for r in rows if r["split"] == split and r["strategy"] == strategy
            ]
            print(
                split,
                strategy,
                "Recall@3:",
                sum(r["recall_at_3"] for r in group) / len(group),
            )
    Path("report.json").write_text(
        json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return rows


if __name__ == "__main__":
    run()
