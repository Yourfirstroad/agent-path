import importlib.metadata as metadata
import json, sys
from datetime import date
from pathlib import Path

sources = {
    "pydantic": "https://docs.pydantic.dev/latest/changelog/",
    "fastapi": "https://fastapi.tiangolo.com/release-notes/",
    "langgraph": "https://github.com/langchain-ai/langgraph/releases",
}
versions = {}
for name in sources:
    try:
        versions[name] = metadata.version(name)
    except metadata.PackageNotFoundError:
        versions[name] = "本环境未安装"
report = {
    "collected_at": str(date.today()),
    "python": sys.version.split()[0],
    "installed": versions,
    "official_sources": sources,
    "online_checked": False,
    "migration": "尚未试验，不作升级决定",
}
path = Path("dependency-review.json")
path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
