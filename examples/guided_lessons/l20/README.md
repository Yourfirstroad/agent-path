# l20 手把手教程

把前面的技能拼成一个完整小作品：输入任务 → 提取草稿 → 人工修改 → 确认入库 → 刷新后读取。提供全部 React、Python 与配置文件。

先完成 l10、l12、l15、l16、l18。下载后保留本课全部文件，需要两个终端：一个跑 Python、一个跑 React。之前的 5176 / 8020 服务请先 Ctrl+C 停止，再启动本课；若端口占用，不要启动第二份。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe -m uvicorn app:app --host 127.0.0.1 --port 8020
# 保留 Python 窗口，在同一文件夹新开第二个终端
npm ci
npm run dev
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

打开 http://127.0.0.1:5176。提取“任务：学习 Python”，将标题改成“学习 HTTP”后确认保存；刷新点“读取已保存任务”仍看到 HTTP。勾选模拟失败显示错误，输入不带“任务：”会提示格式问题。

## 逐段讲解

### app.py / Input 与 Task

Input 是提取请求，Task 是保存请求，两条接口各自校验。提取不写数据库，用户确认后才调用 /api/tasks。

### src.jsx / draft

草稿与已保存列表分开。输入框的修改更新 draft，保存发送的是编辑后的值，不能重新发送原始模型结果。

### vite.config.js

浏览器向 5176 发 /api 请求，Vite 转发到 Python 的 8020。开发时解决两个服务联通问题，生产部署需自己的反向代理。

### SQLite 与失败状态

数据库保存在本课 data/tasks.db；服务重启可读回。失败时不会显示保存成功。默认规则适配器无真实模型调用，l17 教你模型适配入口。

## 改一次

先保存标题 A，再模拟失败，确认 A 没消失；把草稿改成全空格尝试保存。

参考答案：读取列表仍有 A；空白标题由 Python 拒绝，页面提示输入校验失败。不要只在 React 禁用按钮而忘记服务端校验。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

完整本地教学应用，默认规则模拟；无生产登录和多人权限，不要把此 Python 服务直接开放公网。真实模型质量与计费没有由离线测试证明。
