# l18 手把手教程

把一句有固定格式的任务文字变成三个字段，再拦住不明确或不合法的结果。先跑通“提取 → 校验”这两步，再理解 AI 为什么也需要校验。

前置：列表/字典、函数、try/except 和安装依赖。如果 class、str | None 不熟，先看下方逐段解释，不必先背完整面向对象语法。完整解压后进入 l18，新建 main.py（包里已有完整版本）。终端执行下列三行：第 1 行建环境，第 2 行安装 Pydantic，第 3 行运行代码。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe main.py
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

前两条成功：
{"title":"学习 Python","due_date":"2026-11-01","confidence":0.0}
{"title":"复习函数","due_date":null,"confidence":0.0}
后面的“明天”、两个日期、2 月 30 日都提示“需要修改”。最后显示“校验拦截：confidence 不能大于 1”。

## 逐段讲解

### 先认识这三个英文名字

title = 任务标题；due_date = 截止日期；confidence = 分数。None 在 Python 中表示没有值，显示为 JSON 时写作 null。本例 confidence 固定 0.0，明确表示没有经过校准的信心估计，不代表正确概率。

### class ExtractedTask(BaseModel)

class 可以先理解为自定义一种“表格”。BaseModel 提供填表检查功能，Field(ge=0, le=1) 规定下界 0、上界 1。str 是文字，str | None 表示文字或空值。

### extract(text)：先拆输入

split("；") 按中文分号拆成最多两段，再去掉“任务：”“日期：”前缀。这里只支持写明的固定格式，任意自然语言必须交给真实模型或另写规则，不能把这段代码叫智能理解。

### model_validate：再检查结果

模型或规则给出的结果都要经过这一关。它检查字段和类型；额外 validator 检查标题非空、日期真实存在。校验失败会抛异常，try/except 负责显示可修改的提示。

### 提示词在真实 AI 中放在哪里

接真实模型时，可要求“提取 title、due_date、confidence；缺日期返回 null；不猜日期；只输出 JSON”。用模型输出替换 draft 后仍调用 model_validate。提示词不是验证器，模型自报分数也不是事实保证；先完成本课，再做 lc04 的框架结构化输出。

## 改一次

在 samples 加一条没有日期的“任务：阅读 HTTP”，再把最后测试的 confidence 改为 -0.2。先预测，再运行。

参考答案：缺日期会返回 {"title":"阅读 HTTP","due_date":null,"confidence":0.0}。-0.2 仍被 ValidationError 拦截；把异常提示改成“confidence 必须在 0 到 1”，就同时适合上下界。不要自行补上今天或明天。

## 排错

- No module named pydantic：用同一个 .venv/Scripts/python.exe 执行 pip install 和 main.py，不能一个用系统 Python、另一个用环境 Python。
- 提示没有 model_validate：你装的是 Pydantic 1 或用了别的环境。按 requirements.txt 安装本课 2.14.1；不要把代码改成旧教程的 parse_obj。
- 明天被拒绝是本课的预期规则，完整自然语言日期解析需要时区与基准日期，本课明确不猜。
- 本例只支持中文冒号和分号。先原样复制输入跑通；更换标点前先修改解析规则并补测试。

完整可运行的规则提取与 Pydantic 校验示例；不调用模型，不声称已实现任意自然语言理解。


## 官方核对来源（2026-10-29）

- [Pydantic 字段与验证](https://docs.pydantic.dev/latest/concepts/models/)
