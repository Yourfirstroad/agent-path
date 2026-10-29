# l26 手把手教程

让回答带上能查到的原文。先用十条自编公开教学笔记练习检索与拒答，不下载私人资料。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe main.py
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

HTTP 返回 [http] 开头的原文与 sources；火星天气返回“资料不足，无法回答”，sources 是 []。这是摘录式回答，没有调用生成模型。

## 逐段讲解

### docs.json

每条笔记都有稳定 id、标题和原文。真正资料应另加原始网址、作者及使用许可；本包十条是自编教学文字。

### retrieve

先去空格再做不区分大小写的关键词匹配。没有相同关键词就找不到，不具备语义理解。

### answer / sources

回答和引用一起返回，id 可以回查原文。只有检索到了才摘录；没有资料就拒答。

## 改一次

依次测试十个标题作为查询，再测试未知问题。

参考答案：查询 Python、HTTP、JSON、SQL、React、工具、RAG、MCP、LangGraph、测试，应各自包含同 id 的原文；火星天气应拒答。可在 main 的列表中替换这十个查询循环运行。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。
