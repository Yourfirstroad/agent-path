# l30 手把手教程

给检索程序装一个真正的 React 页面。点引用能看到原文，未知问题明确拒答，并保留可重跑的评测结果。

先完成 l26–l28 与 React 基础。停止之前使用 5176/8020 的课程服务，再进入 l30 按下面两个终端启动。第一次依赖安装需联网。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe -m uvicorn app:app --host 127.0.0.1 --port 8020
# 保留 Python 窗口，在同一文件夹新开第二个终端
npm ci
npm run dev
# 第三个终端（或停止服务后）
.venv/Scripts/python.exe evaluate.py
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

查询 HTTP 后得到带 [http] 的回答；点击“http · HTTP”展开原文。查询火星天气显示资料不足。evaluate.py 生成 report.json，包含实际检索来源与分数。

## 逐段讲解

### rag.py / docs.json

复用 l26 的检索逻辑，数据仍为十条自编教学笔记。它是关键词摘录，不是向量数据库，也不是生成式回答。

### app.py / Query

服务端约束输入长度，避免只靠前端检查。API 返回答案与完整来源片段，引用不是随意拼一个链接。

### details / summary

浏览器自带可键盘操作的展开组件。引用标题和实际片段一起返回，用户可以自己检查回答是否有依据。

### evaluate.py

复用 l28 的开发/保留集与报告。真实资料要扩大评测范围；pgvector 是后续可选存储升级，不是跑通本课的必要条件。

## 改一次

将 docs.json 中 HTTP 的原文末尾加“本条已修订”，重启 Python 服务后查询。

参考答案：答案与展开引用都应出现“本条已修订”；如果只有页面静态文案变化，说明没有真正读到后端数据。重新跑 evaluate.py，来源 id 不变。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。
