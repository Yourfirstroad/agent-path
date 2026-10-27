# Agent Path · AI 开发学习工作台

一条面向零基础、Python 为主、JavaScript / React 为辅的 AI Agent 开发路线。可选深浅配色，中文引导，真实本地学习记录。

## 在线学习（无需安装）

打开 **https://yourfirstroad.github.io/agent-path/** 即可学习，也可以把这个网址直接发给朋友。在线版由 GitHub Pages 免费托管，使用默认域名，无需购买服务器。

在线版的课程、自测、收藏、笔记、配色、项目验收和备份恢复都在浏览器中使用。每位访问者有独立记录，不需要登录；记录不会上传到仓库或共享服务器。请定期在“学习设置”导出备份：清除网站数据、换浏览器或结束无痕浏览可能丢失记录。换设备可私下传输备份并恢复，不会自动云同步。

本机 Python 版与在线版的记录独立；若要迁移，先导出，再到另一版本恢复。恢复会替换目标版本的记录；在线版保留最近一次恢复前快照，可在设置页导出。在线学习网站无需安装，但课程中的编程练习仍需按课程准备自己的开发环境。

## 现在开始

以下是可选的本机 Python 版。**第一次下载或换电脑本机运行，请先完成下方“首次安装”。** `127.0.0.1` 仅指向当前电脑；直接在线学习请使用上方网址。

安装完成后，打开 http://127.0.0.1:8099 。Windows 用户后续可双击本目录的 **启动学习站.cmd**，保留启动窗口，再打开地址。停止服务：在启动窗口按 Ctrl+C。

1. 点“开始第一课”。一课可分多天，不用一天做完。
2. 先读概念，再在自己的电脑完成练习，对照验收项勾选，最后完成自测。
3. 笔记需点“保存笔记”。满足三项验收且自测答对，才计入完成进度。
4. 学习设置可选择每天 30 / 60 / 90 分钟，并导出备份。
5. 右上角“配色”或“学习设置 → 界面配色”可切换森林深色、石墨蓝、纸白。背景、文字、按钮一起切换，刷新后保留。此偏好只存在当前浏览器，不随学习备份导出，也不跨设备同步；浏览器禁止存储时会提示仅本次有效。

## 有什么

- 8 个阶段、40 节学习单元、4 个递进项目、22 个公开资料入口。
- 今日推荐、路线筛选、课程引导 / 代码 / 验收 / 自测、资料搜索收藏、项目验收、学习笔记。
- SQLite 持久化；备份导出、校验后恢复、恢复前自动快照。
- 建议每天 9:00 学习；提醒需在自己的日历或 Codex 中另行设置，仓库不自带日程或网页后台通知。
- 以每天 60 分钟、每周 5 天推进 + 2 天复习估算约 20 周。课时是规划值，不是完成保证。

## 内容原则与边界

资料于 **2026-10-27** 核对。中文主线包含 Datawhale Hello Agents；并参考 Hugging Face、Microsoft 官方课程，Python、React、FastAPI、MCP、LangGraph 官方资料和公开岗位样本。原文链接、适用阶段、费用与注意事项在资料库内。

不把旧 API 当成必修；不把基础知识因年代久就判为过时。先掌握 Python、HTTP、SQL、测试，再学习 Agent。Deep Agents 等变动较快的能力作为进阶选读。岗位样本仅作能力对照，非就业统计或薪资承诺。

本网站是学习工作台，不是自动执行练习的平台，也没有内置 AI 导师。课程验收依赖本人实践与勾选。第 17 课有默认离线的模型调用示例，真实调用需自行开通服务并承担费用；交付时未使用真实密钥验证付费调用。

## 数据在哪里

本机 Python 版的学习数据保存于 `data/learning.sqlite3`，不要删除这个文件。在线版则保存在当前浏览器，两者不会自动同步。
“导出全部记录”得到 `agent-path-backup.json`；恢复会替换当前学习记录，操作前有明确确认。原记录另存为 `data/before-import-*.json`，可在同一恢复入口导入。
备份含笔记，请勿公开上传。课程内容变更使用稳定 ID 保留学习记录。

本机 Python 服务仅绑定 127.0.0.1，**没有登录或多用户隔离**，不要直接把此服务开放到公网。在线版只发布公开课程和页面，各自记录留在访问者浏览器中。网页不自动抓取外站；更新课程前需要另行核对官方资料。

## 首次安装（新电脑必读）

技术：Python / FastAPI / SQLite 负责内容、校验、进度与备份；React + TypeScript（JavaScript 的类型扩展）负责界面。学习路线中先教 JavaScript，再引入 React。

准备 Python（建议 3.12，本项目已在此版本验证）、Node.js >=22.12 和 npm。安装依赖需要联网；课程阅读和本机进度记录不要求模型密钥或 ChatGPT 订阅。公开资料外链和可选真实模型调用需要联网。

在 GitHub 仓库页面选择 **Code → Download ZIP** 并解压，或使用 Git：

```sh
git clone https://github.com/Yourfirstroad/agent-path.git
cd agent-path
```

在解压后的项目目录打开终端（能看到 `requirements.txt` 和 `package.json`）。换电脑时重新创建环境，不要复制 `.venv`。

### Windows PowerShell

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
npm ci
npm run build
.venv/Scripts/python.exe -m uvicorn backend.app:app --host 127.0.0.1 --port 8099
```

如果电脑使用 `py` 启动 Python，可将第一行改为 `py -3.12 -m venv .venv`。安装后再次使用只需双击“启动学习站.cmd”。

### macOS / Linux

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
npm ci
npm run build
.venv/bin/python -m uvicorn backend.app:app --host 127.0.0.1 --port 8099
```

运行后打开 http://127.0.0.1:8099 。部分 Linux 发行版需先安装对应 Python 的 venv 支持包。macOS / Linux 命令按平台路径提供，尚未在这些系统实际验收。

### 换电脑与分享

- 分享项目：发送 [GitHub 仓库链接](https://github.com/Yourfirstroad/agent-path) 即可，其他人按本说明安装，各自保存自己的记录。
- 给 GPT / Codex 辅助安装：把仓库链接发给它，并说明“请先阅读 README，帮我在自己的电脑本地安装运行，不要公开我的学习记录”。普通聊天不会仅凭链接自动在你的电脑启动软件；需要可操作本机的工具或自行执行安装步骤。
- 迁移自己的进度：在旧电脑“学习设置”导出记录，私下传到新电脑，再在新电脑恢复。不要把备份提交到公开仓库。恢复会替换新电脑已有记录，不会自动合并。
- 主题颜色保存在当前浏览器，换电脑后重新选择；每天的提醒也需单独配置。

仓库只包含程序、课程和测试，不包含个人数据库、笔记备份、密钥或本机依赖。`main` 分支保存源码，`gh-pages` 分支保存公开网站构建产物；本项目没有账号或云同步。

## 在线版构建与发布（维护者）

```sh
npm ci
npm run build:pages
npm run test:pages
```

课程导出只读取 `backend/curriculum.py`，不导入后端应用或访问学习数据库。构建要求 Python 3 和 Node.js；生成的网页不运行 Python。产物为 `dist-pages/`，路由使用 `#/learn/l01`，支持直接分享课程及刷新。

审核并提交源码后，维护者运行 `npm run publish:pages` 将在线产物推送到本仓库的 `gh-pages` 分支。脚本会检查仓库地址、源码干净状态及发布文件，保留发布分支历史，不强制推送。需要有仓库写入权限；首次发布还需在 GitHub 的 Settings → Pages 中选择 `gh-pages`、根目录。发布不自动跟随 `main` 更新；每次修改后应重新构建、测试并运行发布命令。

在线版浏览器测试使用 8111 端口、新建浏览器环境和本地静态预览，不启动学习数据库。设置 `PAGES_TEST_URL` 可对已发布的网站执行同一套测试；测试记录只保存在测试浏览器。

## 前端开发

前端开发：另一窗口运行 `npm run dev`，打开 http://127.0.0.1:5189 （代理 API 到 8099）。正式本地使用只启动 Python 即可，它提供已构建的 dist 页面。

## 验证与维护

```powershell
npm run build
.venv/Scripts/python.exe -m unittest backend.test_app -v
npm run test:e2e
```

macOS / Linux 将上述 Python 路径改为 `.venv/bin/python`。浏览器测试默认使用已安装 Chrome，测试数据库在 `work/e2e/learning.sqlite3`，与学习记录分开。测试会重置该专用数据库。截图在 artifacts，失败证据在 test-results。

内容入口：backend/curriculum.py。界面入口：src/app/learning-app.tsx、src/features/learning。规范见 PRODUCT.md、design-model.yaml 和 docs。沿用 React Foundry 基础组件；旧模板演示页面不在当前路由中，也不读写本学习站记录。
