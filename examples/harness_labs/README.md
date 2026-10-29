# Harness 与 Deep Agents：从看懂执行到完成作品

配套网站：https://yourfirstroad.github.io/agent-path/#/learn/h01

先完成 Python、工具调用和 LangGraph 基础。**Harness 不是必须安装的某个库**，这里指模型周围的执行、工具、状态、权限、上下文与预算配套系统。Deep Agents 是具体的开源实现；本课程先手写最小版本，再使用真实 SDK。

每天约 60 分钟：先花 10 分钟阅读目标，30 分钟运行并对照结果，20 分钟看讲解或只改一个地方。一课可跨天。完整教程在网站；下载 ZIP 的 `guides/h01.md` 至 `guides/da08.md` 提供相同的离线说明。

## 准备与首次运行

需要 Python 3.12。下载并完整解压到 `harness-labs`，打开该目录的终端。命令在终端输入，代码保存到文件里。手机可以阅读，实操使用电脑。

Windows PowerShell：

```powershell
python --version
python -m venv .venv
.venv/Scripts/python.exe h01_loop.py
```

macOS / Linux：

```sh
python3 --version
python3 -m venv .venv
.venv/bin/python h01_loop.py
```

看到 `done` 和最后的 `step_limit`，表示正常与超限两条路径都跑到了。h01–h06 只用标准库。

到 da01 再安装锁定依赖；安装需要网络，默认练习运行不需要网络、密钥或付费账号：

```powershell
.venv/Scripts/python.exe -m pip install -r requirements-lock.txt
.venv/Scripts/python.exe da01_first.py
```

macOS / Linux 将解释器路径换为 `.venv/bin/python`。同一目录不必每次重新建环境。不要与旧 `agent-labs` 环境混用。

## 运行顺序

以下每行都在前面加 `.venv/Scripts/python.exe `（macOS / Linux 用 `.venv/bin/python `）。每课具体预期结果和逐段解释见网站或 ZIP 的 guides 文件夹。

| 课 | 文件 / 命令 | 你应该看到 |
|---|---|---|
| h01 | h01_loop.py | 正常完成，死循环提议在上限停止 |
| h02 | h02_tools.py | 正常读取，越界拒绝 |
| h03 | h03_context.py | 资料有来源；空间不足和未知主题拒答 |
| h04 | h04_checkpoint.py start / status / approve | 等待审批、跨进程查询、批准后仅一份记录 |
| h05 | h05_limits.py | 两次调用、call_limit / deadline / cancelled |
| h06 | h06_research.py start / approve | 带来源草稿，经批准后本地交付 |
| da01 | da01_first.py | 实际工具结果中 found=true 和 false |
| da02 | da02_plan_files.py | 待办、虚拟文件写入和读回 |
| da03 | da03_store.py | Alice 跨会话读到偏好，Bob 读不到 |
| da04 | da04_subagents.py | task 委派结果带实际查询来源 |
| da05 | da05_skills.py | 偏好与摘要载入、正文按需读取 |
| da06 | da06_approval.py start / status / approve | 真正的框架暂停和磁盘恢复 |
| da07 | da07_context.py | 只读三行，禁止写入的文件没有产生 |
| da08 | da08_project.py start / status / approve --directory work/deep-project | 规划、Skill、委派、草稿、批准后交付 |

表中 `/` 代表依次执行不同命令，不要把 `/` 输入终端。完整审批例子：

```powershell
.venv/Scripts/python.exe da08_project.py start --task project-one --directory work/deep-project
.venv/Scripts/python.exe da08_project.py status --task project-one --directory work/deep-project
.venv/Scripts/python.exe da08_project.py approve --task project-one --directory work/deep-project
.venv/Scripts/python.exe da08_project.py approve --task project-one --directory work/deep-project
```

先看到 `waiting_approval`、`deliveries=0` 和待批准正文；确认后再运行 approve。最后两次均为 `finished`、`deliveries=1`。拒绝实验使用新 `--task` 并把 approve 换成 reject，交付数保持 0。程序结束不等于交付成功。数据在此包的 work 内，不触碰网站个人学习记录。不要删数据库来重试，请换任务 ID。

## 验证

```powershell
.venv/Scripts/python.exe -m unittest -v test_lessons
```

14 项行为测试使用独立临时目录，阻止网络连接；实际验证 SDK 工具、文件、规划、子代理、Skills、隔离、拒绝、磁盘恢复及幂等。

## 版本与专业边界

2026-10-29 核实并实测：Python 3.12.15、Deep Agents 0.7.32、LangChain 1.4.7、LangGraph 1.2.18、SQLite 检查点 3.1.2。完整依赖在 requirements-lock.txt，不需要为网站后端安装这些包。规划显式使用 TodoListMiddleware；StateBackend 和 StoreBackend 采用当前构造接口。

`ScriptModel` 只按预设步骤提出调用，不会推理。SDK 与工具真实执行，参考报告是固定文案。测试通过不代表真实模型准确率、费用或生产可用性；默认不调用付费模型，也不含可用密钥。

da01 已提供显式可选的真实调用入口：先按 [官方 Models 文档](https://docs.langchain.com/oss/python/deepagents/models) 选择支持工具调用的提供商/模型，安装对应 LangChain 适配包，在自己的本机环境设置提供商要求的 API Key。PowerShell 用 `$env:LAB_MODEL="提供商:模型名"`，macOS/Linux 用 `export LAB_MODEL="提供商:模型名"`，必须替换为实际选择。随后执行 `.venv/Scripts/python.exe da01_first.py --live`（Unix 换解释器路径）。不带 --live 时，即使环境里存在密钥也只运行离线例子。真实分支可能收费、输出不固定，本次只验证开关与参数接线，没有进行付费调用或声称效果达标。密钥不要粘到网页、源码或提交到 GitHub。

接入后核对实际工具消息、事实引用、工具选择、权限、用量和失败恢复；没有调用工具就不能声称查询过来源。综合课的固定 report 仍是参考答案，不能拿它冒充真实模型生成结果。

文件权限不等于操作系统沙箱；InMemoryStore 不跨进程持久化；字符数不是 token；调用间截止检查不能强制终止正在执行的工具。只有本地 SQLite 交付，没有邮件或网络发布。网站的验收需要本人操作，程序不会替你完成学习。

官方资料：

- https://docs.langchain.com/oss/python/deepagents/overview
- https://docs.langchain.com/oss/python/deepagents/backends
- https://docs.langchain.com/oss/python/deepagents/skills
- https://docs.langchain.com/oss/python/deepagents/subagents
- https://docs.langchain.com/oss/python/deepagents/human-in-the-loop
- https://docs.langchain.com/oss/python/deepagents/context-engineering
- https://docs.langchain.com/oss/python/deepagents/permissions
- https://github.com/langchain-ai/deepagents

示例与中文讲解为本项目原创；第三方框架通过依赖安装，遵循各自许可证。
