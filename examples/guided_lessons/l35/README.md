# l35 手把手教程

每次只推进一个研究步骤，把状态保存后退出，下次从下一步继续。先看到持久化的好处，再决定是否需要进阶框架。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe main.py
.venv/Scripts/python.exe main.py
.venv/Scripts/python.exe main.py
.venv/Scripts/python.exe main.py
.venv/Scripts/python.exe main.py
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

依次检索、整理证据、写草稿、核对；第五次显示已完成、不重复执行。中间关闭终端后重开，仍从 run.json 的下一步继续。

## 逐段讲解

### next_step

这是要执行的位置，不是完成百分比。每次只追加一个产物，再推进索引。

### 临时文件替换

先完整写 .tmp，再替换正式文件，降低写到一半破坏 JSON 的风险。仍是单进程示例，不处理多进程竞争。

### 框架取舍

本例产物是预设文字，演示任务恢复。Deep Agents 的规划/文件系统/子任务可能适合复杂工作，但会增加模型调用、依赖和调试成本；先比较你的真实需求。

## 改一次

执行两步后打开 run.json，核对 artifacts 长度与 next_step；写下是否需要模型自主规划。

参考答案：两步后 next_step=2、artifacts 两项。固定四步无需模型决定流程；开放研究主题可能需要规划，但应先用 lg04 的可测流程评估，再考虑引入 Deep Agents。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。
