"""Authored beginner courses, backed by the exact runnable files in the download."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "examples/harness_labs"
REVIEWED = "2026-10-29"
SOURCES = [
    ("da-backends", "Deep Agents · 文件后端与记忆作用域", "backends"),
    ("da-skills", "Deep Agents · Skills 与按需加载", "skills"),
    ("da-subagents", "Deep Agents · 子代理委派", "subagents"),
    ("da-hitl", "Deep Agents · 人工审批", "human-in-the-loop"),
    ("da-context", "Deep Agents · 上下文工程", "context-engineering"),
    ("da-permissions", "Deep Agents · 文件权限", "permissions"),
]


def entry(
    id,
    title,
    file,
    intro,
    expected,
    explain,
    challenge,
    solution,
    checks,
    question,
    correct,
    *,
    commands=None,
    dependencies=(),
    prerequisites=(),
    refs=(),
    scope="",
    pitfalls=(),
):
    deep = id.startswith("da")
    files = [file, *dependencies]
    if deep:
        files += ["da_support.py", "requirements.txt", "requirements-lock.txt"]
    setup = "python --version\npython -m venv .venv\n"
    if deep:
        setup += ".venv/Scripts/python.exe -m pip install -r requirements-lock.txt\n"
    run = (
        setup
        + "\n"
        + "\n".join(".venv/Scripts/python.exe " + c for c in (commands or [file]))
    )
    guide = dict(
        intro=intro,
        before=(
            "先完整下载、解压 harness-labs.zip，进入 harness-labs 文件夹，在空白处右键打开终端。使用 Python 3.12。"
            "先看版本输出，再执行下面的命令。第一次创建 .venv；之后同一目录可跳过创建步骤。"
            + (
                "首次安装依赖需要联网；后续默认练习离线运行，不需要 API Key，也不会请求模型服务。已验证 Deep Agents 0.7.32 / LangChain 1.4.7 / LangGraph 1.2.18；不要混用旧框架包的环境。"
                if deep
                else "这节只用 Python 标准库，不需要安装 AI 框架。"
            )
        ),
        folder="harness-labs",
        files=[
            dict(name=name, code=(SOURCE / name).read_text(encoding="utf-8"))
            for name in dict.fromkeys(files)
        ],
        download="downloads/harness-labs.zip",
        run=run,
        expected=expected,
        explain=[dict(anchor=anchor, text=text) for anchor, text in explain],
        challenge=challenge,
        solution=solution,
        prerequisites=list(prerequisites),
        reviewed=REVIEWED,
        pitfalls=[
            "出现找不到文件：先确认终端在 harness-labs，且完整解压了下载包。",
            "命令里的 .venv/Scripts/python.exe 是本课解释器；不要把 Python 代码粘到 PowerShell。",
            *pitfalls,
        ],
        scope=(
            "默认程序是确定性的教学规则或脚本模型；框架、工具、权限检查与数据库真实执行，不证明真实模型推理质量。"
            "本课不会自动修改网站学习进度，完成后请亲自验收。" + scope
        ),
        sources=[
            dict(
                title="Deep Agents 官方文档" if deep else "Python 官方文档",
                url="https://docs.langchain.com/oss/python/deepagents/overview"
                if deep
                else "https://docs.python.org/3/",
            )
        ]
        + [
            dict(
                title=title,
                url="https://docs.langchain.com/oss/python/deepagents/" + path,
            )
            for rid, title, path in SOURCES
            if rid in refs
        ],
    )
    return dict(
        id=id,
        number=0,
        stage="s10" if deep else "s9",
        title=title,
        track="Python",
        minutes=180 if id == "da08" else (120 if deep else 90),
        summary=intro,
        concepts=[text for _, text in explain],
        code=guide["files"][0]["code"],
        exercise=[
            challenge,
            "对照参考答案运行；亲自验证三项完成标准，一课可以分多天。",
        ],
        checks=checks,
        resources=["deep" if deep else "python", *refs],
        quiz=dict(
            question=question,
            options=["只要最终输出看起来正确就可以", correct, "遇到问题把所有限制删除"],
            answer=1,
            explanation=correct,
        ),
        guide=guide,
    )


def courses():
    return [
        entry(
            "h01",
            "Harness 入门：把模型提议变成受控执行",
            "h01_loop.py",
            "运行一个只有查资料和回答两步的小程序，看清 Harness（执行配套系统）到底负责什么。",
            "第一段 status 是 done，events 只有一次 lookup，answer 是 Python 官方链接。最后一行：一直调用工具： step_limit。",
            [
                (
                    "run() 与 proposal",
                    "把 proposal 想成模型递来的一张申请单：要查什么，或准备回答什么。这里用 if 写死两种申请，目的是先学执行逻辑，不是假装有真实 AI。Harness 负责收到申请后检查、执行和保存结果。",
                ),
                (
                    "if proposal['tool'] != 'lookup'",
                    "工具必须出现在允许名单中。真正查目录发生在 result 那一行；模型说要查，不等于已经查过。每次真实执行后才把结果加进 messages。",
                ),
                (
                    "for step in range(limit)",
                    "循环最多执行 limit 轮。正常第二轮能回答；repeat=True 强制一直申请工具，走到上限返回 step_limit。停止状态与成功状态分开，不能把超限包装成完成。",
                ),
                (
                    "events 与 answer",
                    "事件记录给你核对执行证据，answer 给使用者看。复杂系统会把事件持久化并加入错误、审批和预算；本课故意只保留最小结构。",
                ),
            ],
            "把正常调用改为 run(limit=1)，说明为什么查到资料仍没有完成回答。",
            "参考修改：print(run(limit=1))。预期 status=step_limit，events 有一次查找；因为没有第二轮生成回答。改回 limit=2 后得到 done。",
            [
                "正常流程只查一次并返回来源",
                "重复工具请求在两轮后停止",
                "能指出提议与真正执行分别在哪行",
            ],
            "Harness 能否仅靠提示词保证执行不会无限循环？",
            "不能，执行层必须有明确停止条件。",
            prerequisites=["lg04", "l32", "l35"],
        ),
        entry(
            "h02",
            "Harness 工具边界：参数、路径和权限",
            "h02_tools.py",
            "做一个只能读取指定练习目录的文本工具，并亲眼看到越界访问被拒绝。",
            "允许： Python 函数可以重复使用。\n拒绝： 文件超出允许目录",
            [
                (
                    "TemporaryDirectory",
                    "代码先创建独立临时目录和两份演示文件；它们不是你的真实笔记。退出 with 后由 Python 清理，因此重复运行不会堆积练习文件。",
                ),
                (
                    "read_note() 的类型与后缀检查",
                    "先确认 name 是文本且以 .txt 结尾，这是参数规则。文件不存在会抛 FileNotFoundError；不应该凭空返回假内容。",
                ),
                (
                    "resolve() + is_relative_to()",
                    "../ 表示上一级。resolve 把路径变为真实绝对位置，再检查它是否仍在允许目录内。只检查字符串前缀不够，例如 workspace2 并不属于 workspace。",
                ),
                (
                    "文件大小与安全边界",
                    "4096 字节上限避免把大文件全部装入内存。这只演示静态路径检查，不是操作系统沙箱；有敌意的并发进程、网络和 shell 还需要真正的隔离环境。",
                ),
            ],
            "把 note.txt 内容改成自己的一句学习笔记，再尝试读取一个超过 4096 字节的文件。",
            '参考：把写入内容改为 "x" * 4097，重新运行会得到 ValueError: 文件过大，先切分。恢复短文本后正常；../private.txt 仍被拒绝。',
            [
                "短文本能读取且修改后输出变化",
                "越界路径被明确拒绝",
                "超大文件被拒绝，能说明路径校验不是沙箱",
            ],
            "工具参数是合法字符串，就能允许读取任意文件吗？",
            "不能，还要校验文件范围、大小和实际权限。",
            prerequisites=["h01"],
        ),
        entry(
            "h03",
            "Harness 上下文：来源、记忆与有限空间",
            "h03_context.py",
            "从两条资料里选出当前问题需要的一条，保留来源和核对日期，空间不足就不硬塞。",
            "正常：answerable 为 True，context 包含 Python 官方来源。\n空间不足与未知主题：context=[]，chars=0，answerable=False。",
            [
                (
                    "CATALOG",
                    "每条知识同时保存主题、内容、来源、核对日期。日期表示最后一次检查时间，不保证今后永远正确。这个目录是包内固定数据，不是联网搜索。",
                ),
                (
                    "topic.casefold()",
                    "先按主题过滤，防止把所有资料都传给模型。casefold 用于不区分字母大小写的比较；真实检索可以替换这一步，但输出仍应保留来源。",
                ),
                (
                    "used + len(text) <= max_chars",
                    "只有放得下的完整条目才加入上下文，来源也占空间。这里统计字符，是容易看懂的教学限制；生产模型的 token 计算和收费需要另行核对。",
                ),
                (
                    "answerable",
                    "有依据才允许进入后续回答。找不到资料与空间放不下都会返回 False；可以让用户缩小问题或增加预算，不能用猜测补满。",
                ),
            ],
            "把正常主题改为 Deep Agents，再把 max_chars 改为 5，观察有资料但放不下的情况。",
            '参考：print(context_for("Deep Agents")); print(context_for("Deep Agents", 5))。前者有官方链接，后者 answerable=False；不要只截掉来源来假装放得下。',
            [
                "上下文包含可核查来源及日期",
                "未知主题不会被编造答案",
                "能解释字符预算与 token 费用的区别",
            ],
            "资料存在但超过本次空间限制，应该怎么做？",
            "明确说明本次上下文不足，缩小问题或调整预算。",
            prerequisites=["h02"],
        ),
        entry(
            "h04",
            "Harness 持久化：暂停、审批与不重复交付",
            "h04_checkpoint.py",
            "关闭程序后仍能看到待审批任务，批准两次也只留下同一份本地交付记录。",
            "start/status：status=waiting，deliveries=0。\napprove 两次：status=done，deliveries 始终是 1。\n另一个任务 reject：status=rejected，deliveries=0。",
            [
                (
                    "jobs 与 deliveries",
                    "jobs 保存草稿和状态，deliveries 保存真正交付的结果。start 只写草稿，不交付；这两张表让等待审批与已经完成可以分别核对。",
                ),
                (
                    "with closing(...), db",
                    "closing 负责关闭连接，db 的上下文负责事务提交或失败回滚。这两个职责不同，尤其在 Windows 上不关闭连接可能导致文件仍被占用。",
                ),
                (
                    "PRIMARY KEY 与 INSERT OR IGNORE",
                    "任务 ID 是唯一键。同一个 ID 的重复批准不会生成第二份交付记录；插入交付和修改状态放在一个 SQLite 事务里。本地幂等不等于远端邮件或支付也自动幂等。",
                ),
                (
                    "--task 与 --db",
                    "每条终端命令启动一个新进程，却读取同一个磁盘数据库。换 --task 创建另一任务；不要删库来复位，已存在且内容不同的任务会拒绝覆盖。",
                ),
            ],
            "用 --task reject-demo 新建任务，先 reject 再 approve，确认被拒绝的任务不会交付。",
            "依次运行 h04_checkpoint.py start --task reject-demo、reject --task reject-demo、approve --task reject-demo（都加本课 Python 前缀）。最后仍是 rejected 和 0。要重新尝试用一个新任务 ID。",
            [
                "不同进程能查到 waiting 状态",
                "重复批准只产生一份交付",
                "拒绝后再批准也不会交付",
            ],
            "重复点击批准时，怎样避免重复交付？",
            "用任务唯一键、状态检查和事务保护实际写入。",
            prerequisites=["h03"],
            commands=[
                "h04_checkpoint.py start",
                "h04_checkpoint.py status",
                "h04_checkpoint.py approve",
                "h04_checkpoint.py approve",
            ],
            scope="数据库只在本地 work 文件夹，不是网站学习数据库。",
        ),
        entry(
            "h05",
            "Harness 执行保护：预算、重试、超时与取消",
            "h05_limits.py",
            "模拟一次超时后成功的读取，再分别触发次数上限、截止时间和取消。",
            "第二次读取成功 calls= 2\n停止： call_limit\n停止： deadline\n停止： cancelled",
            [
                (
                    "Budget 数据类",
                    "max_calls 是最多执行次数，seconds 是从创建预算开始计时的期限，cancelled 是取消开关。它们是执行预算，不是人民币或美元预算。",
                ),
                (
                    "reserve()",
                    "每次执行前按取消、时间、次数逐项检查，然后把次数加一。失败也消耗机会，否则无限失败重试可能绕过限制。monotonic 用于测量经过时间，不受修改系统时钟影响。",
                ),
                (
                    "retry_read()",
                    "只捕获 TimeoutError，最多 attempts 次。参数错误、权限拒绝不应当当作临时网络故障一直重试；该例只重试没有副作用的读取。",
                ),
                (
                    "调用间检查的限制",
                    "期限在开始下一次调用前检查，不能杀掉正在执行的慢函数。真实 HTTP 应设置连接/读取超时；需要强制终止时使用独立进程或沙箱，线程超时不等于底层操作停止。",
                ),
            ],
            "把 Budget(max_calls=2) 改成 1，观察重试为何停止，而不是成功。",
            "第二次执行前 reserve 会抛 RuntimeError: call_limit；第一次数虽然失败也已消耗预算。恢复 2 后成功。不要把 calls += 1 移到成功之后。",
            [
                "一次失败和一次成功总计两次调用",
                "取消、截止与次数上限分别生效",
                "能说明该示例不能强制中止正在运行的工具",
            ],
            "一次工具读取失败后，是否还应计入执行次数？",
            "应计入；失败和重试同样消耗资源。",
            prerequisites=["h04"],
        ),
        entry(
            "h06",
            "Harness 综合实战：带来源与审批的学习助手",
            "h06_research.py",
            "把资料选择、执行预算、磁盘状态和人工确认连接成一个终端应用。",
            "start：status=waiting，deliveries=0，calls=1，draft 有 Python 官方来源。\napprove：status=done，deliveries=1。\n未知主题：status=no_evidence，deliveries=0。",
            [
                (
                    "from h03 / h04 / h05 import",
                    "这一课复用前面已经跑通的函数，因此下载包中的三个文件必须留在同一个目录。应用不是一个超长提示词，而是可单独验证的小部件组合。",
                ),
                (
                    "start() 的 evidence",
                    "先通过受预算控制的只读调用选资料；answerable=False 立即返回，不创建可批准的草稿。先检查输入事实，再让后续流程继续。",
                ),
                (
                    "draft → act(..., 'start')",
                    "保留来源的草稿写进 jobs，等待明确批准。运行 start 只是准备工作；approved 之后才写入 deliveries，没有发送邮件或发布网页。",
                ),
                (
                    "同一 --task",
                    "status、approve、reject 都必须指向之前的任务。ID 相同但草稿不同会报错，避免后来请求把旧任务换成新内容却沿用旧审批。",
                ),
            ],
            "为不存在的主题运行 start，确认不会生成待批准记录，再用新 ID 对正常主题走一遍拒绝流程。",
            "参考命令：h06_research.py start --task unknown-demo --topic unknown。输出 no_evidence；再运行 status --task unknown-demo 会提示任务不存在，这是没有写入草稿的证据。",
            [
                "正常主题保留来源并等待确认",
                "未知主题不会创建交付",
                "批准与拒绝路径都亲自跑通",
            ],
            "完整应用什么时候可以提示已交付？",
            "只有批准后，实际交付记录成功写入，才可提示。",
            prerequisites=["h05"],
            dependencies=["h03_context.py", "h04_checkpoint.py", "h05_limits.py"],
            commands=[
                "h06_research.py start",
                "h06_research.py status",
                "h06_research.py approve",
                "h06_research.py start --task unknown-demo --topic unknown",
            ],
        ),
        entry(
            "da01",
            "Deep Agents 起步：第一个真正的工具调用",
            "da01_first.py",
            "用真实 Deep Agents SDK 执行一个资料查询工具；看清它和上一阶段手写 Harness 的关系。",
            "第一组工具 name=lookup，status=success，content 内 found=true 且 url 是官方地址。第二组 found=false、url=null；接口调用成功不等于找到了资料。",
            [
                (
                    "create_deep_agent",
                    "这是构建入口：传入模型、工具和提示词，返回可 invoke 的执行图。Deep Agents 把文件、子代理和上下文等常用配套能力接到 LangChain / LangGraph 上；它不是一种新模型。",
                ),
                (
                    "ScriptModel 与 steps",
                    "da_support.py 是完整公开的离线模型替身，只产生预定 tool_calls。它不懂自然语言，真正的 lookup 由 SDK 工具节点执行。这样先学接口和工程，不需要先购买模型服务。",
                ),
                (
                    "@tool lookup",
                    "函数说明描述工具用途，topic 是输入。目录只含 Python 与 Deep Agents 两条资料；unknown 返回 found=false，不伪造来源。工具成功状态描述函数执行情况，还要检查业务字段。",
                ),
                (
                    "recursion_limit 与 tool_results",
                    "执行步数有限，工具消息能证明真的调用过。步数上限不是模型费用上限。以后接真实模型时先从此课替换模型并重新评测，不能把本课绿色测试当作真实模型效果。",
                ),
            ],
            "把 run() 的主题改为 Python，核对返回的链接确实变成 Python 官方文档。",
            '参考：show(tool_results(run("Python")))，或在终端运行 .venv/Scripts/python.exe da01_first.py --topic Python。found=true，url=https://docs.python.org/3/tutorial/。未知主题仍应得到 null，不补造链接。可选真实调用：先按官方 Models 文档选择支持工具调用的提供商与模型，安装该提供商的 LangChain 适配包，在本机环境设置其 API Key；PowerShell 设置 $env:LAB_MODEL="提供商:模型名"（必须替换为自己的实际值），再运行 .venv/Scripts/python.exe da01_first.py --live。macOS/Linux 用 export LAB_MODEL="提供商:模型名"。默认不带 --live 永远使用离线模型，网页不会收集密钥。真实调用可能收费且输出不固定，本次没有付费实测；检查真实工具消息与来源，而不是只看最终一句话。',
            [
                "观察到真实 lookup 工具结果",
                "已知与未知主题结果不同",
                "能解释模型替身与实际 SDK 执行的区别",
            ],
            "离线示例运行成功能证明真实模型智能水平吗？",
            "不能；它验证接口和执行流程，真实模型要另行评测。",
            prerequisites=["h06"],
        ),
        entry(
            "da02",
            "Deep Agents 规划与文件：写计划，再读回",
            "da02_plan_files.py",
            "显式开启待办规划，写出虚拟 report.md，再用文件工具读回内容。",
            "todos 中“整理资料”状态为 completed；files 包含 /report.md；工具顺序 write_todos → write_file → read_file → write_todos，全部 status=success。",
            [
                (
                    "TodoListMiddleware()",
                    "当前锁定版本需要显式加入待办规划中间件，它提供 write_todos 工具。中间件是在执行前后插入的配套逻辑；不添加时不能假设该工具必然存在。",
                ),
                (
                    "write_todos 的 status",
                    "in_progress 表示正在做，completed 表示草稿步骤结束。Agent 的任务待办与网站个人学习进度是两套数据；运行例子不会把课程自动标完成。",
                ),
                (
                    "write_file 与 read_file",
                    "先写再读才能核对实际内容。路径 /report.md 属于默认 StateBackend 的虚拟文件系统，不是你电脑磁盘根目录。可以在返回值 files 中看到内容。",
                ),
                (
                    "默认文件生命周期",
                    "本课没有持久化检查点，退出进程文件就不保证保留。若想关闭程序再继续，需要后面审批课的磁盘检查点；跨会话共享则要理解下一课的 store。",
                ),
            ],
            "把 report.md 的标题改为自己的主题，重新运行并核对 read_file 的结果。",
            '修改 write_file 的 content，例如 "# Python 函数\n先运行 h01_loop.py"。输出 read_file 必须包含新标题；只改最终打印文字不能证明文件写入改变了。',
            [
                "规划状态从进行中变为完成",
                "文件写入后能真实读回",
                "能找到返回状态中的文件而非误找磁盘根目录",
            ],
            "默认 StateBackend 写文件，是否等于文件已经保存到电脑磁盘？",
            "不等于，它写入图状态；持久化取决于检查点配置。",
            prerequisites=["da01"],
            refs=["da-backends"],
        ),
        entry(
            "da03",
            "Deep Agents 记忆：跨会话共享与用户隔离",
            "da03_store.py",
            "让 Alice 的第二次会话读到偏好，同时确认 Bob 读不到这份偏好。",
            "alice 的 read_file status=success，内容“每天学习 60 分钟”；bob 的 status=error，提示 File not found。",
            [
                (
                    "InMemoryStore",
                    "store 提供跨线程数据容器。本课容器在内存里，所以能跨 thread，但不能跨进程重启；跨线程与持久化是两个不同维度。",
                ),
                (
                    "StoreBackend(namespace=...)",
                    "namespace 相当于资料柜上的分区标签，alice 和 bob 使用不同分区。这里用户由程序固定，生产环境应由已验证登录身份决定，不能相信请求随便提交的用户名。",
                ),
                (
                    "writer 与 reader",
                    "writer 用会话 one 保存，reader 用新会话 two 读取；模型也重新创建。共享来自同一 store 的同一 namespace，不是靠复制聊天历史。",
                ),
                (
                    "bob 的 error",
                    "没有这份文件就明确报不存在。不能为了让演示全部显示绿色而去读 Alice 的数据；错误结果正是隔离验证的一部分。真实多用户服务仍需认证和授权。",
                ),
            ],
            "把 Alice 保存的 60 改成 30，观察只有 Alice 的读回结果改变。",
            "修改 writer 的 content 后重跑：alice 看到 30，bob 仍提示不存在。不要把所有用户的 namespace 改成相同常量。",
            [
                "不同 thread 可共享 Alice 的偏好",
                "Bob 读不到 Alice 数据",
                "知道 InMemoryStore 重启会丢失且分区不代替登录鉴权",
            ],
            "跨会话 store 一定能在电脑重启后保留数据吗？",
            "不一定，耐久性取决于 store 的实际实现。",
            prerequisites=["da02"],
            refs=["da-backends"],
        ),
        entry(
            "da04",
            "Deep Agents 子代理：把一件明确任务交给资料员",
            "da04_subagents.py",
            "主 Agent 委派查询，子代理实际调用资料工具，再把结果返回主流程。",
            "主线程只有一条 name=task 的工具结果，内容含 found=true 和 Deep Agents 官方链接；不会把子线程的 lookup 消息原样全部追加到主线程。",
            [
                (
                    "researcher() 定义",
                    "一个子代理需要名字、用途、系统提示、模型和工具。名字用于选择，描述解释何时该交给它。本课只做一件可核对的查询，避免一开始让多个角色互相聊天。",
                ),
                (
                    "task 的 description",
                    "委派输入要说明主题、期望结果与边界。子代理的上下文主要来自这个明确任务和自身配置，不能假设它拥有主线程全部历史。",
                ),
                (
                    "两个 ScriptModel",
                    "主模型提出 task，子模型提出 lookup。两者都是离线脚本，但 SDK 的委派和工具执行是真的；此课不证明自然语言自动分工的质量。",
                ),
                (
                    "task 结果",
                    "主流程接收任务结果而非全部中间消息，减少上下文占用。上下文隔离不是操作系统安全隔离；子代理也不能因此得到额外权限。",
                ),
            ],
            "把 researcher 的查询主题改成 unknown，检查主流程是否收到明确的未找到结果。",
            '修改子模型 call("lookup", topic="unknown")。主线程 task 内容应包含 found=false、url=null；不能因为委派成功就声称资料存在。',
            [
                "实际经过 task 委派及子工具查询",
                "未知主题能传回失败事实",
                "能解释上下文隔离不等于权限沙箱",
            ],
            "子代理返回了文字，就能默认任务事实正确吗？",
            "不能，仍需核对工具结果和来源。",
            prerequisites=["da03"],
            refs=["da-subagents"],
        ),
        entry(
            "da05",
            "Deep Agents Skills：常驻偏好与按需说明",
            "da05_skills.py",
            "加载一份学习偏好，发现一个 Skill，再读取它的详细步骤；不把所有说明永久塞进提示词。",
            "memory_loaded=true；skill_listed=true；body_in_system=false；read_file 的内容包含 SKILL_BODY_MARKER。",
            [
                (
                    "AGENTS.md 与 memory",
                    "教学记忆文件保存固定偏好：每天 60 分钟。memory 参数让这部分进入系统消息。文件名本身没有魔法，是传入的参数指定了读取行为。",
                ),
                (
                    "skills/study/SKILL.md",
                    "开头 --- 包围的区域是元数据，name 和 description 帮助发现用途，正文才是详细工作步骤。Skill 是可复用说明，不是模型权重，也不会自动获得执行脚本的权限。",
                ),
                (
                    "seed_files()",
                    "从包内两个文本文件读内容，再转换为框架文件数据，传给默认 StateBackend。不是把你电脑上其他 AGENTS.md 或私人文件上传。",
                ),
                (
                    "read_file 与验证标记",
                    "启动时系统消息有 Skill 摘要而没有正文标记；模型提出 read_file 后，完整正文才作为工具结果进入消息。本课脚本固定发起读取，真实模型是否恰当选择 Skill 仍需评测。",
                ),
            ],
            "把教学 AGENTS.md 的每天 60 分钟改成每天 30 分钟，同时把 memory_loaded 的检测字符串改成 30 分钟。",
            "两处一起改后 memory_loaded 仍为 true；只改检测文字会得到 false。SKILL_BODY_MARKER 仍应只在工具读取结果中出现，body_in_system 仍为 false。",
            [
                "偏好确实进入系统消息",
                "能区分 Skill 摘要和完整正文",
                "手动修改偏好后验证重新加载",
            ],
            "Skills 的按需加载主要解决什么问题？",
            "先提供用途摘要，需要时再读正文，控制上下文体积。",
            prerequisites=["da04"],
            dependencies=["AGENTS.md", "skills/study/SKILL.md"],
            refs=["da-skills", "da-backends"],
        ),
        entry(
            "da06",
            "Deep Agents 人工审批：退出后继续并避免重复",
            "da06_approval.py",
            "真实框架在交付工具执行前暂停；另一次启动读取检查点，再由你的命令批准或拒绝。",
            "start/status：status=waiting_approval，deliveries=0，并显示待批准的 deliver 参数。\napprove：status=finished，deliveries=1；再次 approve 仍为 1。\nreject 分支结束但 deliveries=0。",
            [
                (
                    "interrupt_on",
                    "只拦截 deliver，允许 approve 或 reject。暂停时显示实际调用参数，你要看清准备保存的内容后再决定；不是只看到一句“是否继续”。",
                ),
                (
                    "SqliteSaver 与 thread_id",
                    "checkpoints.sqlite3 保存执行图状态，thread_id 指向同一任务。脚本退出后状态仍在；使用另一个任务 ID 不会恢复原任务。这个 ID 不是账号权限。",
                ),
                (
                    "Command(resume=...)",
                    "批准或拒绝通过 Command 继续暂停的图。已经结束的任务没有待执行节点，重复批准不会重新调用工具。没有 start 时直接批准会报错。",
                ),
                (
                    "delivery_tool 与唯一键",
                    "deliveries.sqlite3 是独立的业务记录，任务 ID 唯一。图的检查点和业务写入不是一个事务，因此工具本身仍要幂等。示例只保存到本地，不发邮件、不发布网站。",
                ),
                (
                    "finished 不等于已交付",
                    "拒绝也可以让流程结束，所以还要看 deliveries 是否为 1。生产应用通常增加 rejected 等业务状态，不能只根据图是否结束提示用户成功。",
                ),
            ],
            "换 --task denied，依次 start、reject、approve，证明拒绝后没有交付。",
            "三条命令共用 --task denied 和同一 --directory；最后 status=finished 但 deliveries=0。用新 ID 再做另一任务，不删除数据库或重用已结束任务。",
            [
                "能在新进程读到待审批状态",
                "拒绝不交付且重复批准不重复写入",
                "能区分流程结束与交付成功",
            ],
            "有了检查点，工具本身还需要防止重复副作用吗？",
            "需要，业务写入仍应使用幂等键或等效机制。",
            prerequisites=["da05", "h04"],
            refs=["da-hitl"],
            commands=[
                "da06_approval.py start --task approval-one",
                "da06_approval.py status --task approval-one",
                "da06_approval.py approve --task approval-one",
                "da06_approval.py approve --task approval-one",
            ],
            pitfalls=[
                "重复运行 start 看到 finished：该 ID 已完成，请换新的 --task。检查点不是每次运行自动清空的演示缓存。"
            ],
        ),
        entry(
            "da07",
            "Deep Agents 上下文与权限：大文件按需读、原始资料禁止改",
            "da07_context.py",
            "把 100 条资料存为虚拟文件，只读前三条，并验证禁止写入的资料目录确实拒绝修改。",
            "read_file 返回 lines 1-3 of 100 和前三条资料；write_file 返回 permission denied、status=error；blocked_file_absent=true。",
            [
                (
                    "create_file_data(content)",
                    "完整资料放在文件状态里，不直接放进 user 消息。模型可以用路径按需读取。这是显式文件外置，不是已经触发自动摘要或测得节省了多少 token。",
                ),
                (
                    "offset=0, limit=3",
                    "offset 从第 0 行开始数，limit 限制读取 3 行。返回文字提供行范围，下一次可从 offset=3 继续，避免每轮都重复塞 100 行。",
                ),
                (
                    "FilesystemPermission",
                    "operations=['write']、paths=['/sources/**']、mode='deny' 明确禁止通过内置文件工具写这个目录。read 仍可执行，所以访问规则可以按操作分别定义。",
                ),
                (
                    "blocked_file_absent",
                    "拒绝提示之外，还检查状态里确实没有新增文件，防止只显示错误但实际已经写入。权限在工具层执行，直接调用后端或自定义工具仍要自己保护；本课不是沙箱演示。",
                ),
            ],
            "把 offset 改为 3、limit 改为 2，读取第 4–5 条，确认写入仍被拒绝。",
            "预期 read_file 显示 lines 4-5 of 100，只出现第 4 条、第 5 条；write_file 仍 error，blocked_file_absent 仍 true。不需要删掉权限才能读取后续行。",
            [
                "只读取要求的行范围",
                "禁止写入返回明确错误",
                "状态证明被禁止文件没有产生",
            ],
            "模型答应不修改资料，是否可以省掉工具层权限？",
            "不可以，执行权限必须由工具或运行环境落实。",
            prerequisites=["da06"],
            refs=["da-context", "da-permissions"],
        ),
        entry(
            "da08",
            "Deep Agents 综合实战：可恢复的研究与学习助手",
            "da08_project.py",
            "完成一个可下载的终端作品：规划 → 读取 Skill → 委派查资料 → 写草稿 → 等待批准 → 本地交付。",
            "start：waiting_approval，deliveries=0，files 有 /report.md，todos 草稿步骤为 completed，approval_requests 含来源/动手/验证三段。\n新进程 approve：finished，deliveries=1；重复 approve 仍为 1。",
            [
                (
                    "build() 的执行顺序",
                    "先更新待办，再读取 Skill 和委派任务，然后写草稿。每个环节使用前面课程同一组真实接口；离线 report 是显式固定参考答案，不声称是模型自主研究所得。",
                ),
                (
                    "memory、skills、subagents",
                    "偏好告诉系统学习时间，Skill 给出计划结构，资料员返回依据，三者职责不同。共享的是有用信息，不是让所有代理拥有任意权限。",
                ),
                (
                    "execute(..., build=build)",
                    "复用 da06 的持久化、状态查询和幂等交付，让综合项目只描述新增业务步骤。源文件及 Skills 必须一起解压，不能仅复制这一页第一个文件。",
                ),
                (
                    "待办完成与审批等待",
                    "completed 标记的只是“查资料并准备草稿”；交付仍处于 waiting_approval。不同状态描述不同对象，不能把草稿完成当成已经交付。",
                ),
                (
                    "测试与真实模型接入边界",
                    "test_lessons.py 验证正常、缺资料、隔离、权限拒绝、重启、重复审批和拒绝。后续要接真实模型，需自行选择提供商并替换 ScriptModel，再测工具选择、证据一致性、费用和效果；本课没有调用付费模型。",
                ),
            ],
            "复制一个新任务 ID，先查看待审批正文，走拒绝流程，再运行整套行为测试。",
            "运行 da08_project.py start --task project-reject --directory work/deep-project，再 reject 同一任务。deliveries=0；运行 .venv/Scripts/python.exe -m unittest -v test_lessons，应显示 14 项通过。",
            [
                "能看到带来源的草稿和真实委派证据",
                "新进程批准或拒绝均符合预期",
                "14 项行为测试通过，能说出离线模型限制",
            ],
            "这个作品需要哪些证据才能说工程流程跑通？",
            "工具、来源、状态、恢复、权限和失败路径都要实际验证。",
            prerequisites=["da07"],
            dependencies=[
                "da04_subagents.py",
                "da05_skills.py",
                "da06_approval.py",
                "AGENTS.md",
                "skills/study/SKILL.md",
                "test_lessons.py",
                "h01_loop.py",
                "h02_tools.py",
                "h03_context.py",
                "h04_checkpoint.py",
                "h05_limits.py",
                "h06_research.py",
                "da01_first.py",
                "da02_plan_files.py",
                "da03_store.py",
                "da07_context.py",
            ],
            commands=[
                "da08_project.py start --task project-one --directory work/deep-project",
                "da08_project.py status --task project-one --directory work/deep-project",
                "da08_project.py approve --task project-one --directory work/deep-project",
                "da08_project.py approve --task project-one --directory work/deep-project",
                "-m unittest -v test_lessons",
            ],
            refs=["da-subagents", "da-skills", "da-hitl"],
            scope="完整是指本课程文件和执行链完整，不代表可直接作为多用户生产系统部署。",
        ),
    ]


def extend_harness(lessons, stages, resources):
    index = next(i for i, item in enumerate(lessons) if item["id"] == "l36")
    lessons[index:index] = courses()
    for number, lesson in enumerate(lessons, 1):
        lesson["number"] = number
    index = next(i for i, item in enumerate(stages) if item["id"] == "s8")
    stages[index:index] = [
        dict(
            id="s9",
            name="亲手构建 Agent Harness",
            short="Harness 基础",
            weeks="进阶 · 先理解执行层",
            outcome="有边界、预算和审批的最小执行系统",
            focus="循环 · 工具边界 · 上下文 · 持久化",
        ),
        dict(
            id="s10",
            name="用 Deep Agents 完成复杂任务",
            short="Deep Agents",
            weeks="进阶 · 再使用完整框架",
            outcome="带规划、Skills、子代理与恢复的终端作品",
            focus="文件 · 记忆 · Skills · 委派 · 人工审批",
        ),
    ]
    stages[-1]["weeks"] = "最后阶段 · 整理与交付作品"
    for rid, title, path in SOURCES:
        resources.append(
            dict(
                id=rid,
                title=title,
                url="https://docs.langchain.com/oss/python/deepagents/" + path,
                kind="文档",
                language="英文",
                level="工程",
                why="配合站内完整实验理解当前框架接口与边界。",
                caution="文档免费。默认实验不调用模型服务；托管服务和真实模型可能收费，需另行核对。",
                reviewed=REVIEWED,
            )
        )
