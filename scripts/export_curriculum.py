"""Export public course content only. Never import the app or open the learning DB."""
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from backend.curriculum import CURRICULUM  # noqa: E402
from package_agent_labs import package
from package_guided_lessons import package_guides
from package_harness_labs import package_harness

package()
package_guides()
package_harness()

target = ROOT / "public" / "curriculum.json"
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps(CURRICULUM, ensure_ascii=False), encoding="utf-8")
print(f"Exported {len(CURRICULUM['lessons'])} public lessons (no personal records).")
