# l22 手把手教程

亲眼看到 Agent 的骨架：提议 → 校验执行工具 → 记录结果 → 再决定下一步。默认提议由固定脚本提供，方便看清循环。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe main.py
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

第一轮调用 Python、HTTP 两次工具，再输出“最终：Python 函数；HTTP 请求”。第二轮连续三次工具后显示“达到最大步数，停止”。

## 逐段讲解

### messages

每次把工具结果加入记录。真实模型下一次请求必须看到这些结果，才能在新信息上继续判断。

### for step in range(limit)

循环最多 limit 次；即使提议永远是调用工具，也有结束边界。

### return / 循环之后

正常最终回答时提前 return；循环耗尽后返回 limit。不能把达到上限伪装为任务完成。

## 改一次

把 run(always_tool=True) 改为 limit=2，记录工具实际调用数。

参考答案：写成 run(always_tool=True, limit=2)，第二轮恰好两条工具步骤并以 limit 结束。本课的最终回答由工具结果拼接，仍不是模型生成。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。
