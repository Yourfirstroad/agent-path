# l33 手把手教程

给每次运行编号，给每个工具计时，并在预算耗尽前停止。这里只用教学计费单位，不伪造真实人民币费用。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe main.py
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

两条工具日志使用同一 run_id，第二条耗时通常明显更长，随后 budget_exhausted、spent_units=2。currency_cost=null 表示没有真实账单。

## 逐段讲解

### uuid / run_id

每次运行一个编号，把同一次执行中的多条日志关联起来。编号每次不同，不要把固定 UUID 当预期值。

### perf_counter

适合计算经过时长；开始与结束相减得到秒，乘 1000 变毫秒。它不是日历时间。

### 先检查预算

执行前检查下一步会否超限；日志只列允许字段，不输出原始 headers、密钥或私人问题。真实计费按提供商 usage 和价格计算。

## 改一次

把 budget 改成 1，再改成 3。

参考答案：run(budget=1) 只有一次工具后停止；budget=3 有三次工具、没有耗尽日志。每次比较先核对 run_id，不把不同运行的时长混为一谈。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。
