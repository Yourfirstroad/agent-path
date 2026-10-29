import json
from pathlib import Path

projects = [
    ("CLI", "l10"),
    ("结构化工作台", "l20"),
    ("知识助手", "l30"),
    ("研究助手", "l38"),
]
for name, lesson in projects:
    file = Path(f"portfolio-{lesson}.md")
    if file.exists():
        print("保留已有：", file)
        continue
    file.write_text(
        f"# {name}\n\n课程：{lesson}\n\n## 解决的问题\n待填写自己的用户场景\n\n## 启动\n按该课 README 实测后粘贴自己的命令\n\n## 演示证据\n未验证；填写实际日期、截图与复现步骤\n\n## 技术取舍\n说明一个选择与一个未采用的方案\n\n## 失败与限制\n明确离线模型、单用户本地服务边界\n",
        encoding="utf-8",
    )
    print("已生成：", file)
