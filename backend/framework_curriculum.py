"""Beginner framework lessons. Examples are original, executable project files."""
from pathlib import Path

REVIEWED = '2026-10-28'
LABS = Path(__file__).resolve().parent.parent / 'examples' / 'agent_labs'
PREPARE = '先下载并完整解压实战包，按 README 创建独立 Python 3.12 环境并安装 requirements-lock.txt；下面的 python 指该环境的 Python。'

def unit(id, stage, title, summary, concepts, exercises, checks, file, refs, question, options, answer=1, explanation=''):
    command = f'python {file}'
    if file == '07_checkpoints.py': command += ' start --thread checkpoint-1'
    if file == '08_approval.py': command += ' start --thread approve-1'
    if file == '09_research_assistant.py': command += ' start --thread research-1 --stream'
    return dict(id=id, number=0, stage=stage, title=title, track='Python', minutes=120,
        summary=summary, concepts=concepts, exercise=[PREPARE, *exercises], checks=checks,
        code=(LABS / file).read_text(encoding='utf-8'), resources=refs,
        quiz=dict(question=question, options=options, answer=answer, explanation=explanation),
        lab=dict(download='downloads/agent-labs.zip', file=file, command=command,
                 prerequisites='先完成 Python、虚拟环境、HTTP / JSON 与工具调用基础。完整包包含共用支持文件，勿只复制当前文件。'))

def extend(lessons, stages, resources, projects):
    sources = [
        ('chain', 'LangChain · 当前框架定位', 'langchain/overview', '分清模型、工具、Agent 与编排；从当前 create_agent 入口学习。'),
        ('lcquick', 'LangChain · 单 Agent 快速开始', 'langchain/quickstart', '跟随模型、工具、结构化输出和会话的基础流程。'),
        ('lcmessages', 'LangChain · 消息与角色', 'langchain/messages', '区分 HumanMessage、AIMessage、ToolMessage 与对话历史。'),
        ('lctools', 'LangChain · 工具与输入结构', 'langchain/tools', '学习工具描述、参数校验和执行边界。'),
        ('lcstructured', 'LangChain · 结构化结果', 'langchain/structured-output', '使用受校验的结果结构，区分格式正确和事实正确。'),
        ('lgquick', 'LangGraph · 图的快速开始', 'langgraph/quickstart', '从状态、节点与边开始，而不是上来就堆多 Agent。'),
        ('lgpersist', 'LangGraph · 持久化与线程', 'langgraph/persistence', '检查点用于任务恢复，store 用于跨线程信息；理解不同作用域。'),
        ('lgapprove', 'LangGraph · 人工中断与恢复', 'langgraph/interrupts', '通过 interrupt 与 Command 恢复，理解节点重入及幂等。'),
    ]
    for id, title, path, why in sources:
        resources.append(dict(id=id, title=title, url='https://docs.langchain.com/oss/python/'+path,
            kind='文档', language='英文', level='工程', why=why,
            caution='官方文档免费阅读。站内实战默认用离线教学模型；真实模型与托管服务费用需自行核对。', reviewed=REVIEWED))

    chain = [
        unit('lc01','s5','LangChain 起步：消息、提示词与模型',
            '看清传给模型的消息，先理解输入输出，再组装 Agent。', [
            '模型只负责根据输入生成输出；Agent 还需要工具选择、执行循环和停止规则。LangChain 提供组装这些部分的接口，LangGraph 提供更底层的流程控制。',
            'system 消息约束任务，human 是本次输入，ai 是回复，tool 是工具执行结果。消息是一组有角色的数据，不是把所有文字拼成一个长字符串。',
            'ChatPromptTemplate 中的花括号是待填写变量；invoke 填入主题和时长后生成消息，再把消息交给模型的 invoke。先打印输入，能避免把提示词错误误判成模型问题。',
            '本课 FakeListChatModel 只返回预设文字。修改主题会改变输入消息，不会让预设回复变聪明；这是验证接口的方法，不能代表真实模型能力。',
            '运行环境与网站环境分开。安装包是一次准备工作，不等于每次运行都安装；遇到导入错误先核对当前 Python 和 requirements-lock.txt。',
        ], ['运行 python 01_messages.py，找到输出中的 messages 与 reply。',
            '把 topic 从 Python 函数改为列表，把 minutes 改为 45；保存并重新运行。',
            '记录哪部分变了、哪部分仍是预设回答，用自己的话解释模型与 Agent 的区别。'],
            ['输入消息确实包含修改后的主题和时长','能分清消息角色和提示词变量','明确指出预设回复不是真实模型推理'],
            '01_messages.py',['chain','lcquick','lcmessages'], '修改提示词后，离线预设模型会自动理解新问题吗？',
            ['一定会','不会，它只按预设回复演示接口','需要重装 Python'], explanation='预设模型用于验证消息接口；真实推理需要另行配置实际模型。'),
        unit('lc02','s5','LangChain 工具：函数、参数和边界',
            '把普通 Python 函数变成有名称、说明和输入约束的工具。', [
            '@tool 把 Python 函数包装成工具：名称帮助选择，docstring 描述用途，参数类型形成输入结构。包装不会自动给函数增加业务权限。',
            '工具的 invoke 接收字典并执行真实 Python。模型提出调用和程序实际执行是两件事；这一课先直接调用工具，把输入输出弄明白。',
            'Pydantic 模型把分钟数限制为 15–120；错误应在执行前被拒绝。校验输入结构不等于获得权限，路径、账号归属和高风险操作仍要另外检查。',
            '本课资料工具只查询包内三条公开官方地址，不会实时联网搜索。没有条目就返回空列表；不要补造一个看起来像真的来源。',
        ], ['运行 python 02_tools.py，对照 reading / practice / review 的 15 / 30 / 15。',
            '把合法输入改为 90，再把非法输入改为 0，观察校验行为。',
            '为一个自己熟悉的小函数写准确 docstring，解释为什么不能让模型任意执行 shell。'],
            ['时长分配之和等于输入分钟数','不合法的分钟数被真实校验拒绝','能说明工具描述与授权检查各自负责什么'],
            '02_tools.py',['lctools','lcquick'], '工具通过参数校验后，就自动拥有任意文件访问权限吗？',
            ['拥有','没有，权限边界需要执行层另外检查','只要函数名含 safe 就拥有'], explanation='Schema 检查形状和范围，不能代替账号与资源授权。'),
        unit('lc03','s5','LangChain 单 Agent：工具循环与会话记忆',
            '用 create_agent 跑真实工具循环，验证同线程记忆与不同线程隔离。', [
            'create_agent 接收模型、工具和系统提示，组织模型提出调用 → 工具执行 → 结果返回模型的循环。你仍需检查日志、停止条件与失败路径。',
            'AIMessage 中 tool_calls 是提议，ToolMessage 是程序执行后的结果。观察工具消息比只看最终一句话更能判断流程有没有真的执行。',
            'InMemorySaver 保存进程内的会话状态；相同 thread_id 可继续上下文，换 thread_id 不应继承另一个会话的主题。它不会跨进程保存。',
            'thread_id 是状态索引，不是登录凭证。真实多用户服务还需在服务端验证任务归属；不能只靠别人不知道这个 ID。',
            '本课的 ScriptedStudyModel 按规则产生真实工具消息，不调用远端模型；--live 是显式可选路径，费用和适配包由使用者自己确认。',
        ], ['运行 python 03_agent_memory.py，检查 tool_messages 为 2。',
            '对比 same_thread 与 other_thread：前者有 LangGraph 来源，后者明确不知道主题。',
            '找到 recursion_limit，把它理解为控制执行步数的保护，而不是准确的货币预算。'],
            ['能观察到实际工具结果消息','同 thread 延续主题，新 thread 不继承','能解释内存会话与磁盘持久化的差别'],
            '03_agent_memory.py',['lcquick','lcmessages','lctools','lgpersist'], '退出进程后，InMemorySaver 能保证恢复之前的状态吗？',
            ['能','不能，它只在当前进程内保存','只要 thread_id 很长就能'], explanation='跨进程恢复需要持久化检查点；后面的 SQLite 实验会亲手验证。'),
        unit('lc04','s5','LangChain 结构化输出：计划与失败验收',
            '得到可校验的学习计划，再用失败样例验证边界。', [
            '前端和后续程序需要 topic、minutes、actions、sources 等明确字段，而不只是自然语言。Pydantic StudyPlan 是输出契约，限制分钟数和列表长度。',
            'ToolStrategy 把结构要求接入 Agent 的工具调用流程，结果从 structured_response 读取。不要把格式不稳定的文字硬当 JSON，也不把错误结果当成功。',
            '结构正确只说明字段与类型符合要求，不证明资料真实或建议有效。需要核对 sources、检查实际工具轨迹，并用未知主题测试拒绝行为。',
            '先固定测试场景再改提示词，分别记录接口流程、真实模型效果和业务正确性。离线替身只能验证前一类，不能提供模型准确率。',
        ], ['运行 python 04_structured_plan.py --topic LangGraph，核对 60 分钟、三项行动与来源。',
            '运行 python 04_structured_plan.py --topic 不存在的主题，确认它拒绝生成有效计划。',
            '运行 python -m unittest -v test_labs；阅读结构化输出相关断言，而不只看绿色通过。'],
            ['得到通过 StudyPlan 校验的结构化结果','未知主题被拒绝且不编造来源','能说明格式正确与事实正确不是同一件事'],
            '04_structured_plan.py',['lcstructured','lcquick'], '计划通过 Schema 校验，能证明内容一定真实吗？',
            ['能','不能，还要核查来源和实际行为','字段越多越真实'], explanation='Schema 验证结构，事实与业务结果需要另外验收。'),
    ]
    intro = unit('l31','s7','LangGraph 起步：状态、节点与边',
        '用两个普通 Python 节点跑通第一张图，再逐步增加复杂度。', [
        '先把流程说清楚：准备任务 → 整理结果。图是步骤和连接方式的描述，不是必须有很多 Agent，也不要求每个节点都调用模型。',
        'State 是节点共享的数据结构；节点读取当前状态，返回这次修改的字段。不要依赖原地修改共享对象来表达状态更新。',
        'START 表示入口，END 表示结束，边决定下一步。compile 得到可执行图，invoke 执行一次输入；这与定义图结构是两个阶段。',
        '本课每次从头运行。后续分别加入条件路由、SQLite 检查点、人工 interrupt。检查点负责恢复，外部动作的去重仍由业务唯一键保障。',
    ], ['运行 python 05_graph_basics.py，对照 prepare / summarize 两个节点。',
        '把初始 topic 改成 Python，验证 task 与 result 都随输入改变。',
        '画出 START → prepare → summarize → END，说明每一步读取和返回的字段。'],
        ['能画出状态如何流经两个节点','改变输入后结果确实变化','能解释节点应返回本次状态更新'],
        '05_graph_basics.py',['lgquick','graph'], 'LangGraph 节点通常应返回什么？',
        ['任意 shell 命令','本次需要更新的状态字段','固定网页地址'], explanation='图根据节点返回的更新维护状态，再沿边继续执行。')
    graph = [
        unit('lg01','s7','LangGraph 条件路由：练习还是复习',
            '让状态决定分支，并测试所有路径。', [
            '固定边表示始终进入同一个下一步；条件边根据状态选择目标。把业务条件写清楚，往往比让模型猜测更稳定。',
            '本课的 mode 只允许 practice 或 review，路由函数返回分支名，映射表把这个值连接到对应节点。每个分支都必须能结束。',
            '确定性步骤可以与 Agent 节点放在同一张图。是否使用模型取决于任务，简单规则不必额外产生费用与随机性。',
            '验证分支需要不同输入；只看一次成功输出不能证明另一条路能运行，也不能发现走错分支。',
        ], ['分别运行 python 06_graph_routes.py --mode practice 和 --mode review。',
            '对照两个 task 输出，画出分叉与结束节点。', '试一个不允许的 mode，确认命令行先拒绝错误输入。'],
            ['两条分支都实际运行','相同输入得到相同分支','能解释何时用普通条件而不调用模型'],
            '06_graph_routes.py',['lgquick'], '验证条件路由最少需要做什么？',
            ['只运行默认输入一次','覆盖每条预期分支和非法输入','只看图画得是否漂亮'], explanation='分支正确性需要不同输入与可观察结果。'),
        unit('lg02','s7','LangGraph 持久化：关闭进程后继续',
            '用 SQLite 检查点恢复任务，并观察外部写入是否重复。', [
            '内存 saver 随进程退出消失；SqliteSaver 把检查点写到磁盘。恢复使用相同 workdir 和 thread_id，换 ID 相当于另一条任务。',
            '本课在 plan 后设置教学静态断点，第一次程序正常退出而任务尚未结束；resume 用 None 延续已有状态，不是重新发送初始输入。',
            '检查点数据库和业务动作数据库分开：前者记流程位置，后者用 task_id 主键保证一项任务只记录一次动作。恢复能力不自动等于外部幂等。',
            '数据库只属于下载包的 work 目录，不接触学习站记录。不要导入陌生检查点数据库；代码启用严格反序列化模式，并锁定依赖版本。',
        ], ['运行 python 07_checkpoints.py start --thread checkpoint-1，核对 pending 为 finish、动作计数 0。',
            '关闭终端，重新进入同一目录，运行 python 07_checkpoints.py resume --thread checkpoint-1。',
            '再次 resume，确认计数仍是 1；使用新的 thread 开始另一项实验，不删除旧数据库。'],
            ['在不同进程之间恢复成功','相同任务重复恢复仍只有一次动作','能解释 thread、目录、检查点和幂等的关系'],
            '07_checkpoints.py',['lgpersist','graph'], '保存检查点后，外部写入就一定不会重复吗？',
            ['一定不会','仍需业务幂等键和写入约束','只要重新 start 就不会'], explanation='流程恢复与外部动作去重需要分别设计和验证。'),
        unit('lg03','s7','LangGraph 人工审批：暂停、批准与拒绝',
            '真正等待人的决定，确认之前不执行写入。', [
            'interrupt 把需要确认的问题暂停并保存状态；调用者之后使用 Command(resume=决定) 继续。审批需要 checkpointer 和固定 thread_id。',
            '恢复会从中断节点的开头重新执行，所以 interrupt 前不要写文件、发消息或扣费。把需要确认的动作放到后面的独立节点。',
            '批准和拒绝是两条完整业务路径。明确验证布尔值，不能把字符串 false 当作真值；拒绝也应正常结束并留下可解释状态。',
            '最终写入继续使用唯一任务键，重复批准不会制造重复动作。真实发送邮件、支付等仍需各服务自己的幂等与权限检查。',
        ], ['运行 python 08_approval.py start --thread approve-1，核对动作计数 0。',
            '在新进程运行 python 08_approval.py approve --thread approve-1，再重复一次批准。',
            '换 reject-1，先 start 再 reject，确认拒绝任务计数始终为 0。'],
            ['暂停时没有提前写入','批准写一次，重复批准不重复','拒绝路径结束且没有动作'],
            '08_approval.py',['lgapprove','lgpersist'], '为什么不应在 interrupt 前放不可重复的外部动作？',
            ['因为变量名太长','恢复可能从中断节点开头重新执行','因为不能使用 Python 函数'], explanation='节点重入会重复前置代码，副作用应放在审批之后并实现幂等。'),
        unit('lg04','s7','综合实战：有审批、可恢复的研究助手',
            '把 LangChain 单 Agent 嵌入 LangGraph，交付可重跑的完整流程。', [
            'research 节点使用 create_agent 查询包内官方资料目录，并通过 ToolStrategy 产生 StudyPlan。Agent 是图中的一个执行步骤，不等于整张业务流程。',
            'approve 节点把计划交给人；commit 节点才记录批准后的计划，reject 分支不写入。SQLite 保存图状态与业务动作，两种记录各有责任。',
            'stream 模式逐步输出节点更新，帮助定位停在哪一步；show 只查看已有状态。没有实际执行证据时，不提前写成功率或完成记录。',
            '默认教学模型按规则工作，验证的是框架接口和控制流。换真实模型时要选择工具调用能力、设置预算并另外验证效果；本包不声称已通过生产或付费模型验收。',
            '本实验是 Python 核心流程。完成后可在部署阶段用 FastAPI 暴露启动 / 查看 / 审批接口，再连接 React；多用户权限和并发存储需要另行实现。',
        ], ['运行 python 09_research_assistant.py start --thread research-1 --topic LangGraph --stream。',
            '核对来源与计划，关闭进程，再运行 python 09_research_assistant.py approve --thread research-1。',
            '重复 approve，并换新 thread 测试 reject；最后运行本包全部 unittest，把真实输出与限制写进作品 README。'],
            ['工具查询、结构化计划、审批和写入完整贯通','跨进程继续且重复批准不重复写入','能展示拒绝路径、测试证据和离线模式限制'],
            '09_research_assistant.py',['lcquick','lcstructured','lgpersist','lgapprove'], '这个实验的离线成功能直接证明真实模型和生产系统都可靠了吗？',
            ['能，框架一样就行','不能，还需真实模型、权限、并发和部署验证','只要有截图就能'], explanation='离线实验证明已运行的流程；外部模型和生产边界需要独立验收。'),
    ]
    order = []
    for item in lessons:
        order.append(intro if item['id'] == 'l31' else item)
        if item['id'] == 'l25': order.extend(chain)
        if item['id'] == 'l31': order.extend(graph)
    for position, item in enumerate(order, 1): item['number'] = position
    lessons[:] = order
    for stage in stages:
        if stage['id'] == 's5': stage.update(focus='LangChain · 工具 · 会话 · 结构化结果', weeks='第 11–14 周')
        if stage['id'] == 's6': stage['weeks'] = '第 15–17 周'
        if stage['id'] == 's7': stage.update(focus='LangGraph · 持久化 · 审批 · 评测', weeks='第 18–22 周')
        if stage['id'] == 's8': stage['weeks'] = '第 23–25 周'
    projects[-1]['stack'] = 'React · LangChain · LangGraph · Docker'
