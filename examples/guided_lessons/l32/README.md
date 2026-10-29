# l32 手把手教程

同时评测最终回答与执行轨迹：答对但越权调用工具，也算失败。提供二十个固定场景，输出真实逐题结果。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe main.py
.venv/Scripts/python.exe main.py --broken
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

正常：结果通过 20，轨迹通过 20；--broken：结果仍 20，轨迹 5。eval.json 是最后一次运行的明细。二十题包含重复用于教学，不代表二十种独立真实情境。

## 逐段讲解

### cases

固定题与期望答案独立于执行函数。真实项目应增加不同用户措辞、工具错误和恶意输入，扩大覆盖而不是复制重复题。

### answer_ok / trace_ok

结果正确和工具合规分开统计，不能仅看最终一句话。trace 中出现 delete_file 就失败，即便答案正确。

### model / max_steps

保存模型配置让比较有依据。本例标记 scripted-v1，不将脚本的高分宣传为大模型准确率。

## 改一次

把允许轨迹上限改为 0，正常模式重跑。

参考答案：将 len(result["trace"])<=3 改为 <=0，并同步 max_steps 元数据；只有空问题的 5 个案例能通过轨迹检查。失败来源应能在 eval.json 中找到。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。
