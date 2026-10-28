"""Read only a cloud progress summary. Never print connection credentials."""
import argparse
import json
from pathlib import Path
import re
import sys
import httpx

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
parser = argparse.ArgumentParser()
parser.add_argument("--connection", default="work/reminders/connection.json")
args = parser.parse_args()
path = Path(args.connection)
if not path.is_file():
    sys.exit("尚未连接云端提醒：缺少本机私有连接文件，不能据此判定学习进度为零。")
try:
    config = json.loads(path.read_text(encoding="utf-8"))
    url = config["project_url"].rstrip("/")
    token = config["reminder_token"]
    key = config["publishable_key"]
    if config.get("version") != 1 or not re.fullmatch(r"https://[a-z0-9-]+\.supabase\.co", url):
        raise ValueError("invalid project")
    if not re.fullmatch(r"[A-Za-z0-9_-]{43}", token):
        raise ValueError("invalid read-only connection")
    if not isinstance(key, str) or not key.startswith(("sb_publishable_", "eyJ")):
        raise ValueError("invalid public key")
except (ValueError, KeyError, TypeError):
    sys.exit("连接文件格式不正确；未发送凭证或读取进度。")
try:
    response = httpx.post(url + "/rest/v1/rpc/ap_read_reminder_progress", trust_env=False, timeout=20,
        headers={"apikey": key, "Content-Type": "application/json"}, json={"p_token": token})
    if response.status_code != 200:
        sys.exit(f"无法读取云端进度（HTTP {response.status_code}），连接可能已撤销或服务暂停；未修改任何记录。")
    data = response.json()
    allowed = {"has_progress", "completed_count", "total_lessons", "next_lesson_id", "last_lesson_id", "next_lesson_progress", "daily_minutes", "updated_at"}
    if not isinstance(data, dict) or set(data) - allowed:
        sys.exit("云端返回了非预期的数据结构，已停止输出。")
    if data.get("next_lesson_progress") is not None and set(data["next_lesson_progress"]) - {"checks", "answer", "completed_at"}:
        sys.exit("进度摘要包含非预期字段，已停止输出。")
    print(json.dumps(data, ensure_ascii=False))
except httpx.HTTPError:
    sys.exit("云端进度暂不可达；未修改记录，也未回退成零进度。请稍后重试。")
