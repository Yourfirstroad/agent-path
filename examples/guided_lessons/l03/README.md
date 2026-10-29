# l03 手把手教程

用三条任务练习“列表里装字典”，筛选未完成任务并统计数量。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe main.py
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

待学习： HTTP
待学习： JavaScript
完成： 1 总数： 3

## 逐段讲解

### tasks = [...]

方括号是一串有顺序的东西。每对花括号是一条任务，title 是标题，done 的 True/False 表示是否完成。

### for task in tasks

循环每次拿出一条，暂时叫 task。task["done"] 按字段名取状态，不是取第几个字。

### done_count += 1

每遇到完成项加一。len 得到列表长度；空列表根本不进入循环，计数仍为零。

## 改一次

将 tasks 整段改为 []，再恢复三条任务并给 HTTP 加 minutes: 30 字段。

参考答案：空列表写法是 tasks = []，结果“完成：0 总数：0”。HTTP 字典改为 {"title": "HTTP", "done": False, "minutes": 30}，现有循环仍能运行。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。
