# l05 手把手教程

保存一条中文任务，再读回来。第一次创建文件，后续只读取；损坏内容必须保留供你检查。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe main.py
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

第一次与第二次都显示 [{'title': '练习', 'done': False}]，同目录出现 tasks.json。将文件内容暂时改为 { 后，显示“读取失败，原文件未覆盖”，文件仍为 {。

## 逐段讲解

### Path(__file__).with_name

__file__ 是脚本自身位置；with_name 指向同文件夹的 tasks.json，不会因为终端位置不同写到别处。

### json.dumps / json.loads

dumps 把 Python 数据变成 JSON 文字；loads 反向还原。JSON 使用双引号与小写 false，Python 使用 False。

### if not path.exists()

只在文件不存在时初始化。解析失败只提示，绝不把原数据替换为空列表。

## 改一次

复制 tasks.json 为 tasks-backup.json 后，破坏原文件试一次，然后用备份恢复。

参考答案：把原文件恢复为 [{"title":"练习","done":false}]。重新运行应再次读到“练习”。不要用删除数据库来解决所有读写错误。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。
