# l10 手把手教程

完成第一个作品：在终端添加、查看、完成任务。完整代码已提供，先走通一遍，再阅读函数，不需要凭空从头写。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe tasks.py add "学习 HTTP"
.venv/Scripts/python.exe tasks.py list
.venv/Scripts/python.exe tasks.py done 1
.venv/Scripts/python.exe tasks.py list
.venv/Scripts/python.exe -m unittest -v
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

新目录中依次显示“已添加 #1”、[(1, '学习 HTTP', 0)]、“已完成 #1”、done 变为 1；测试显示 3 tests、OK。重复 add 会新增任务，这是正常行为。

## 逐段讲解

### argparse

把终端中的 add/list/done 变成 args.command。引号让含空格的标题作为一个参数传入。

### execute

统一处理三个命令，所有 SQL 使用参数。list 重新连接读取，因此每次退出程序后数据依然在。

### test_tasks.py

临时目录为每个测试准备新数据库，不接触你练习的 tasks.db。测试覆盖持久化、完成以及不存在/空输入。

## 改一次

运行 done 999 和 add " "，确认失败后原任务仍在。

参考答案：分别执行 .venv/Scripts/python.exe tasks.py done 999 与 .venv/Scripts/python.exe tasks.py add " "，应报任务不存在/标题不能为空，list 不增加空任务。损坏数据库请先复制备份，不要覆盖原文件。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。
