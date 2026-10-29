import argparse, json
from datetime import datetime, timezone
from pathlib import Path

path = Path("memory.json")


def read():
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}


def update(value, expected_revision):
    data = read()
    if data.get("revision", 0) != expected_revision:
        raise ValueError("旧版本冲突，请先重新查看")
    data = {
        "revision": expected_revision + 1,
        "daily_minutes": value,
        "source": "user",
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    return data


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=["show", "set", "delete"])
    parser.add_argument("value", type=int, nargs="?")
    parser.add_argument("--revision", type=int, default=0)
    args = parser.parse_args()
    try:
        if args.action == "show":
            print(read())
        else:
            if args.action == "set" and args.value not in (30, 60, 90):
                raise ValueError("时长选 30/60/90")
            print(update(args.value if args.action == "set" else None, args.revision))
    except ValueError as e:
        print(e)
