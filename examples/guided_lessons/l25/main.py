from contextlib import closing
import json, sqlite3
from pathlib import Path


def save_once(request_id, payload, confirmed, path=Path("actions.db")):
    if not confirmed:
        return {"ok": False, "error": "approval_required"}
    if not payload.get("title", "").strip():
        return {"ok": False, "error": "invalid_input"}
    encoded = json.dumps(payload, sort_keys=True, ensure_ascii=False)
    with closing(sqlite3.connect(path)) as db, db:
        db.execute(
            "CREATE TABLE IF NOT EXISTS actions(id TEXT PRIMARY KEY,payload TEXT)"
        )
        db.execute("INSERT OR IGNORE INTO actions VALUES (?,?)", (request_id, encoded))
        old = db.execute(
            "SELECT payload FROM actions WHERE id=?", (request_id,)
        ).fetchone()[0]
        if old != encoded:
            return {"ok": False, "error": "request_id_conflict"}
        count = db.execute(
            "SELECT count(*) FROM actions WHERE id=?", (request_id,)
        ).fetchone()[0]
    return {"ok": True, "count": count}


def read_tool(name):
    if name == "slow":
        return {"ok": False, "error": "timeout"}  # 明确的离线故障注入
    if name != "public":
        return {"ok": False, "error": "not_found"}
    return {"ok": True, "data": "公开资料"}


if __name__ == "__main__":
    payload = {"title": "学习审批"}
    print(save_once("demo", payload, False))
    print(save_once("demo", payload, True))
    print(save_once("demo", payload, True))
    print(save_once("demo", {"title": "被修改的动作"}, True))
    print(read_tool("slow"))
    print(read_tool("missing"))
