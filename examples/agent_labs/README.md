# 从零学习 LangChain 与 LangGraph：可运行实战包

核对与验证日期：2026-10-28。建议 Python 3.12；框架版本为 LangChain 1.4.7、LangGraph 1.2.18、SQLite 检查点 3.1.2。`requirements-lock.txt` 锁定本次实际运行的 42 项直接 / 间接依赖。不要在学习网站自身的 Python 环境里安装本包。

## 第一次运行

下载 ZIP、完整解压后，进入能看到本 README 和 `lab_support.py` 的文件夹，再打开终端。

Windows PowerShell：

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements-lock.txt
.venv/Scripts/python.exe 01_messages.py
```

如果电脑使用 `py`，第一行可以改成 `py -3.12 -m venv .venv`。

macOS / Linux：

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-lock.txt
.venv/bin/python 01_messages.py
```

下方为便于阅读写成 `python 文件名`；实际执行时，Windows 用 `.venv/Scripts/python.exe`，macOS / Linux 用 `.venv/bin/python` 替换 `python`。不必激活环境，也不用调整 PowerShell 执行策略。

安装依赖需要联网。安装后默认实验不需要密钥、登录、模型下载或远端 API。LangChain 与 LangGraph 都是真实安装并执行的库；`ScriptedStudyModel` 是按规则回应的教学替身，没有真实模型的理解和推理能力。`FakeListChatModel` 的答案也是预设文字。这些替身用于免费观察消息、工具、图和持久化，不能用来评测真实模型效果。

## 按顺序学，不必一天学完

| 网站课程             | 文件                       | 看什么结果                                                 |
| -------------------- | -------------------------- | ---------------------------------------------------------- |
| lc01 消息与提示词    | `01_messages.py`           | 实际消息里出现你填写的主题和分钟数                         |
| lc02 工具与输入校验  | `02_tools.py`              | 60 分钟拆成 15 / 30 / 15；非法分钟数被拒绝                 |
| lc03 单 Agent 与会话 | `03_agent_memory.py`       | 真正产生工具消息；同 thread 记得主题，新 thread 不知道主题 |
| lc04 结构化计划      | `04_structured_plan.py`    | 输出通过 Pydantic 校验的计划，含 actions 和 sources        |
| l31 图的第一步       | `05_graph_basics.py`       | prepare 节点写入的 task 被 summarize 节点读取              |
| lg01 条件分支        | `06_graph_routes.py`       | practice / review 进入不同节点                             |
| lg02 持久化与恢复    | `07_checkpoints.py`        | 关闭进程后仍可恢复；最终动作只记录一次                     |
| lg03 人工审批        | `08_approval.py`           | 未审批不写入；拒绝不写入；批准后写一次                     |
| lg04 综合研究助手    | `09_research_assistant.py` | 查资料 → 结构化计划 → 暂停 → 审批 → 幂等写入               |

`lab_support.py` 是以上程序共用的完整支持代码，包含公开资料目录、教学模型和幂等写入。不要只复制单个文件而漏掉它。初学时先运行程序，再按站内讲解逐段阅读，不必一开始理解模型适配器内部实现。

## 前四个实验

```sh
python 01_messages.py
python 02_tools.py
python 03_agent_memory.py
python 04_structured_plan.py --topic LangGraph
```

检查点：第 3 个实验的 `tool_messages` 为 2；`same_thread` 有 LangGraph 官方地址，`other_thread` 明确没有这个主题。内存会话在进程退出后消失，磁盘恢复请看实验 7。

第 4 个实验的 `minutes` 为 60，`sources` 是官方地址。试试 `--topic 不存在的主题`，它应失败并说明没有有效计划，而不是编造来源。工具只查询包内公开目录，不是在实时搜索互联网。

## 图与分支

```sh
python 05_graph_basics.py
python 06_graph_routes.py --mode practice
python 06_graph_routes.py --mode review
```

状态是节点共享的数据，节点返回本次修改的字段，边决定下一步。固定流程不必使用 LLM；先把这三件事学清楚再组合 Agent。

## 亲手验证跨进程恢复

分别运行下面两条命令，中间可以关闭终端后重新打开：

```sh
python 07_checkpoints.py start --thread checkpoint-1
python 07_checkpoints.py resume --thread checkpoint-1
python 07_checkpoints.py resume --thread checkpoint-1
```

第一次 `pending` 为 `["finish"]` 且 `action_count` 为 0；第二次状态 `done`、计数 1；第三次仍是 1。此处静态断点用于教学调试，业务审批使用下一节的动态 `interrupt()`。

`thread_id` 是记录索引：恢复时必须使用相同 thread 和 workdir。重新 start 已存在的 thread 会被拒绝；想重新实验请换 `checkpoint-2`，不需要删除数据库。

## 审批与拒绝

```sh
python 08_approval.py start --thread approve-1
python 08_approval.py approve --thread approve-1
python 08_approval.py approve --thread approve-1
python 08_approval.py start --thread reject-1
python 08_approval.py reject --thread reject-1
```

批准任务最终写入次数始终为 1，拒绝任务始终为 0。`Command(resume=True)` 不是重新提交初始输入。恢复会重新进入中断节点，所以写入放在后面的独立节点，并以任务 ID 唯一约束去重。检查点不等于外部副作用自动去重。

## 综合实战：有审批的研究助手

```sh
python 09_research_assistant.py start --thread research-1 --topic LangGraph --stream
python 09_research_assistant.py show --thread research-1
python 09_research_assistant.py approve --thread research-1
python 09_research_assistant.py approve --thread research-1
```

start 输出节点更新，状态为 `waiting_approval`，写入计数 0；换一个进程 approve 后为 `done`、计数 1；重复 approve 不重复写。再用新 thread 走一遍 reject。实验产物只在本包 `work/`，不读写学习网站的数据库，也不会替你勾选课程。

SQLite 适合此处的单人实验。多个服务实例、并发请求、生产认证、网络重试与外部服务幂等需要额外设计，本包不冒充完整生产系统。

## 可选：换成真实模型

先把默认流程全部跑通，再自行选择支持工具调用和结构化输出的提供商，按它的官方文档安装 LangChain 适配包、配置密钥及模型 ID。在当前终端设置 `LAB_MODEL` 为 `提供商:模型名` 后，才对第 3 / 4 / 9 个实验显式添加 `--live`。例如设置变量的写法：

```powershell
$env:LAB_MODEL = "提供商:模型名"
.venv/Scripts/python.exe 03_agent_memory.py --live
```

占位文字必须替换为你开通的实际提供商和当前可用模型；密钥变量名以该提供商文档为准。不要把密钥写进代码、截图或公开仓库。默认没有调用真实模型；真实路径可能收费，需先设置提供商预算，并自行验证模型能力、超时和输出。这次交付未使用真实密钥验证付费请求。

## 运行本包测试

```sh
python -m unittest -v test_labs
```

测试实际运行九个程序，并在不同进程间验证 SQLite 恢复和审批；测试子进程禁止网络连接。没有用预填成功状态代替执行。

遇到 `ModuleNotFoundError`：确认使用本目录 `.venv` 的 Python，且已安装锁定依赖。看到找不到 thread：核对 thread 和 workdir，先 start。提示 thread 已存在：用 resume / approve / reject，或换新 thread。不要清空原记录来掩盖错误。

官方资料：[LangChain 快速开始](https://docs.langchain.com/oss/python/langchain/quickstart)、[工具](https://docs.langchain.com/oss/python/langchain/tools)、[结构化输出](https://docs.langchain.com/oss/python/langchain/structured-output)、[LangGraph 入门](https://docs.langchain.com/oss/python/langgraph/quickstart)、[持久化](https://docs.langchain.com/oss/python/langgraph/persistence)、[人工中断](https://docs.langchain.com/oss/python/langgraph/interrupts)。
