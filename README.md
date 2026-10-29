# Agent Path · AI 开发学习工作台

一条面向零基础、Python 为主、JavaScript / React 为辅的 AI Agent 开发路线。可选深浅配色，中文引导，真实本地学习记录。

## 在线学习（无需安装）

打开 **https://yourfirstroad.github.io/agent-path/** 即可学习，也可以把这个网址直接发给朋友。在线版由 GitHub Pages 免费托管，使用默认域名，无需购买服务器。

在线版可直接以访客方式学习，也可在“学习设置 → 跨设备学习进度”登录学习账号。手机和电脑登录同一账号后，共享课程验收、自测、项目进度和每日时长。笔记、收藏和配色仍保存在各自浏览器，建议定期导出备份；清除网站数据或结束无痕浏览可能丢失这些本地记录。

第一次使用云同步，请自行创建学习账号并完成邮箱验证。这与 Supabase 管理账号用途不同。当前个人免费配置使用默认验证邮件服务，请使用 Supabase 组织成员的邮箱；更多访客仍可免登录学习，向其他邮箱开放注册需维护者另配邮件服务。登录后可明确选择“导入此浏览器原有进度”，保留原访客记录，并为被替换的云端进度留存快照。在线修改只有得到云端确认才提示保存成功。

每日提醒可通过“生成提醒连接文件”接入自己的助手，连接只读课程进度摘要，不能代替你完成课程或读取笔记。文件包含私人凭证，不要公开上传；可随时撤销。提醒不会因为下载仓库自动创建，实际连接状态以助手验证结果为准。部署说明见 [云端同步](docs/云端同步.md)。

本机 Python 版与在线版的记录独立；若要迁移，先导出，再到另一版本恢复。恢复会替换目标版本的记录；在线版保留最近一次恢复前快照，可在设置页导出。在线学习网站无需安装，但课程中的编程练习仍需按课程准备自己的开发环境。

## 现在开始

全站 62 节已补成手把手教程：每课按“准备文件 → 完整代码 → 运行命令与预期输出 → 逐段讲解 → 修改练习与参考答案”推进。Windows 命令为默认，可切换 macOS / Linux；手机可阅读，运行编程练习需要电脑。下载包不含个人进度。

- [从第一课开始](https://yourfirstroad.github.io/agent-path/#/learn/l01)
- [结构化输出：提取与校验完整教程](https://yourfirstroad.github.io/agent-path/#/learn/l18)
- [下载基础课与四个项目的完整参考代码](https://yourfirstroad.github.io/agent-path/downloads/guided-lessons.zip)

无需先独立写出一个项目。先原样跑通，对照输出，再看讲解，最后只改一处。复杂课程可分多天；阅读、复制和下载不会自动勾选验收。参考程序默认使用免费离线规则或教学模型，真实框架、接口、数据库与浏览器实际执行。Docker 课的容器实测受镜像仓库网络超时阻碍，页面已明确注明；远端 CI 和付费模型调用未作为通过项。验证范围见 [手把手课程验收](docs/手把手课程验收.md)。

以下是可选的本机 Python 版。**第一次下载或换电脑本机运行，请先完成下方“首次安装”。** `127.0.0.1` 仅指向当前电脑；直接在线学习请使用上方网址。

安装完成后，打开 http://127.0.0.1:8099 。Windows 用户后续可双击本目录的 **启动学习站.cmd**，保留启动窗口，再打开地址。停止服务：在启动窗口按 Ctrl+C。

1. 点“开始第一课”。一课可分多天，不用一天做完。
2. 打开课程，下载并解压参考代码，按本课命令先运行成功，再读逐段讲解、完成一个修改练习；亲自验证后才勾选验收。
3. 笔记需点“保存笔记”。满足三项验收且自测答对，才计入完成进度。
4. 学习设置可选择每天 30 / 60 / 90 分钟，并导出备份。
5. 右上角“配色”或“学习设置 → 界面配色”可切换森林深色、石墨蓝、纸白。背景、文字、按钮一起切换，刷新后保留。此偏好只存在当前浏览器，不随学习备份导出，也不跨设备同步；浏览器禁止存储时会提示仅本次有效。

## LangChain 与 LangGraph 实战

新增 8 节递进课程，并把原 LangGraph 草案升级为完整程序。顺序：Python / HTTP / 工具基础 → 消息与提示词 → 工具校验 → LangChain 单 Agent 与会话 → 结构化输出 → LangGraph 状态、分支、持久化、人工审批 → 综合研究助手。

- [LangChain 第一课](https://yourfirstroad.github.io/agent-path/#/learn/lc01)
- [LangGraph 起步课](https://yourfirstroad.github.io/agent-path/#/learn/l31)
- [下载完整实战 ZIP](https://yourfirstroad.github.io/agent-path/downloads/agent-labs.zip)
- [安装、运行步骤与预期输出](examples/agent_labs/README.md)

实战包包含 9 个可运行程序、公共支持模块、锁定依赖和行为测试。框架版本核对日期为 2026-10-28：LangChain 1.4.7、LangGraph 1.2.18、SQLite 检查点 3.1.2。默认使用明确标记的离线教学模型，不需要密钥；框架接口、工具、SQLite、审批和恢复实际执行。离线替身不具备真实模型推理能力，真实模型接入是显式可选路径，可能收费且本次未做付费调用验收。网站阅读无需安装，运行 Python 实战仍需自己的开发环境。

原有 l01–l40 ID、笔记和备份格式兼容，新课程用 lc01–lc04、lg01–lg04。显示序号、阶段进度和规划时长按实际课程计算；新增课程不会自动计为完成。其他资料保留各自原核验日期。

## Harness 与 Deep Agents 完整进阶

在 LangGraph 与可靠性基础后，新增 6 节 Harness 和 8 节 Deep Agents 课程。按执行循环、工具边界、上下文、审批持久化、预算、综合应用 → Deep Agents 工具、规划/文件、记忆隔离、子代理、Skills、审批恢复、上下文权限、综合作品推进。

- [从 Harness 第一课开始](https://yourfirstroad.github.io/agent-path/#/learn/h01)
- [Deep Agents 第一课](https://yourfirstroad.github.io/agent-path/#/learn/da01)
- [综合作品](https://yourfirstroad.github.io/agent-path/#/learn/da08)
- [完整代码及 14 课离线教程 ZIP](https://yourfirstroad.github.io/agent-path/downloads/harness-labs.zip)

每课都有运行步骤、预期结果、逐段讲解、修改练习及参考答案。新增 ID 为 h01–h06、da01–da08，原有 48 课 ID 和笔记保持兼容。实战目录与网站进度数据库分开。当前实测 Deep Agents 0.7.32，核对日期 2026-10-29；运行使用明确标记的离线脚本模型，SDK 和工具实际执行，不调用付费模型。

用户已安排每周一北京时间 08:00 核查并按需更新课程，重点跟进官方 Agent/Harness/MCP/Skills/评测变化；稳定基础保留，确认影响示例的变更经验证后发布。定时任务属于维护者的 Codex，需要执行环境在线，下载仓库不会自动创建相同日程。记录见 [课程更新记录](docs/课程更新记录.md)。

## 有什么

- 10 个阶段、62 节学习单元、4 个递进项目、36 个公开资料入口。
- 今日推荐、路线筛选、课程引导 / 代码 / 验收 / 自测、资料搜索收藏、项目验收、学习笔记。
- SQLite 持久化；备份导出、校验后恢复、恢复前自动快照。
- 建议每天 9:00 学习；提醒需在自己的日历或 Codex 中另行设置，仓库不自带日程或网页后台通知。
- 以每天 60 分钟、每周 5 天推进 + 2 天复习估算约 29 周，网站按实际课程分钟数动态计算；不是完成保证。

## 内容原则与边界

资料于 **2026-10-27** 核对。中文主线包含 Datawhale Hello Agents；并参考 Hugging Face、Microsoft 官方课程，Python、React、FastAPI、MCP、LangGraph 官方资料和公开岗位样本。原文链接、适用阶段、费用与注意事项在资料库内。

不把旧 API 当成必修；不把基础知识因年代久就判为过时。先掌握 Python、HTTP、SQL、测试，再学习 Agent。Deep Agents 与 Harness 已提供从基础到综合作品的独立进阶课程，接口核验日期为 2026-10-29。岗位样本仅作能力对照，非就业统计或薪资承诺。

本网站是学习工作台，不是自动执行练习的平台，也没有内置 AI 导师。课程验收依赖本人实践与勾选。第 17 课有默认离线的模型调用示例，真实调用需自行开通服务并承担费用；交付时未使用真实密钥验证付费调用。

## 数据在哪里

本机 Python 版的学习数据保存于 `data/learning.sqlite3`，不要删除这个文件。在线访客记录保存在当前浏览器；登录账号的课程、项目和每日时长存入配置的 Supabase 云端。Python 本机版与在线账号不会自动同步，可通过备份和明确的进度导入迁移。
“导出全部记录”得到 `agent-path-backup.json`；恢复会替换当前学习记录，操作前有明确确认。原记录另存为 `data/before-import-*.json`，可在同一恢复入口导入。
备份含笔记，请勿公开上传。课程内容变更使用稳定 ID 保留学习记录。

本机 Python 服务仅绑定 127.0.0.1，**没有登录或多用户隔离**，不要直接把此服务开放到公网。在线版发布公开课程和页面，云端学习进度按账号隔离；笔记与收藏保留在本机。网页不自动抓取外站；更新课程前需要另行核对官方资料。

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
- 跨设备学习：手机和电脑登录同一个学习账号即可同步进度。笔记与收藏仍需用备份私下迁移；恢复会替换目标记录，不会自动合并，不要把备份提交到公开仓库。
- 主题颜色保存在当前浏览器，换电脑后重新选择；每天的提醒也需单独配置。

仓库只包含程序、课程和测试，不包含个人数据库、笔记备份、密码、提醒凭证或本机依赖。`main` 分支保存源码，`gh-pages` 分支保存公开网站构建产物。复制源码到自己的站点后，需要配置自己的云端项目；未配置时可继续使用浏览器访客模式。

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
