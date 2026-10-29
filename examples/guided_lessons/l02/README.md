# l02 手把手教程

输入一个分钟数，让程序选轻量或标准任务，并让错误输入得到友好的回复。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe main.py
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

每次运行只问一次。输入 0 → 轻量任务；30 → 标准任务；abc → 请输入整数，例如 60；-1 → 分钟数不能为负数。

## 逐段讲解

### raw = input(...)

input 暂停等你打字并按回车。返回的是文字，所以 "30" 不能直接和数字 30 比大小。

### int(raw) 与 try/except

int 尝试把文字变成整数。abc 转换不了会抛 ValueError，except 接住它并显示提示。

### if / elif / else

从上到下只执行第一个满足条件的分支。四个空格代表语句属于哪个分支。

## 改一次

把分界线改成 45 分钟，分别输入 44 和 45。

参考答案：把 elif minutes >= 30: 改为 elif minutes >= 45:。44 为轻量，45 为标准；不要把 >= 换成 >，否则边界错一格。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。
