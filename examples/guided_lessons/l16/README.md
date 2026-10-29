# l16 手把手教程

做一个能点“完成”的 React 页面。两个组件共用同一份任务，点击后列表和计数会一起更新。

先完成 JavaScript 两课。从 https://nodejs.org/en/download 安装受支持的 Node.js（需要 >=22.12），重开终端。下载解压后进入 l16，保留全部文件；不要把 JSX 粘贴进 Python。第一次 npm install 联网安装，安装后用 npm run dev 启动。

## 运行（Windows PowerShell）

```powershell
node --version
npm ci
npm run dev
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

Node 需 >=22.12。打开终端显示的 http://127.0.0.1:5176，初始 0 / 2；点 Python 的完成后 1 / 2，另一个按钮仍可用。清空后 0 / 0 和“还没有任务”。刷新恢复初始数据，本课尚未持久化。

## 逐段讲解

### useState

React 把 tasks 当作当前界面状态；setTasks 通知它用新数据重新画页面。

### map 与 {...t,done:true}

创建新数组，并只复制改动的任务对象。不直接写 tasks[0].done=true，避免界面与数据不同步。

### Summary tasks={tasks}

父组件把同一状态交给子组件显示统计。key 用稳定 id，而不是会变化的标题或位置。

## 改一次

增加 id:3、title:"HTTP"、done:false 的任务，再完成它。

参考答案：在 useState 初始数组追加 {id:3,title:"HTTP",done:false}，刷新后显示 0 / 3；点 HTTP 后 1 / 3。改代码时 Vite 会自动刷新。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。


## 官方核对来源（2026-10-29）

- [React 数组状态更新](https://react.dev/learn/updating-arrays-in-state)
