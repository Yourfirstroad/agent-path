# l23 手把手教程

把提取、校验、确认、保存串成固定工作流。只有提取可能需要模型，其余步骤用确定代码更容易检查。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe main.py
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

先显示 preview，后显示 saved 并生成 confirmed.json。第三条输入提示“请人工修改”，不覆盖已保存的有效任务。

## 逐段讲解

### extract

只接受本课定义的固定输入。以后可换真实模型，但函数输出仍需满足同一约定。

### confirmed

预览与保存是两次明确动作。演示调用里的 True 是测试数据，不等于网页用户已经确认。

### 失败回退

解析失败直接交人工修改。不会为了显示成功而拼一个看似合理的标题写入文件。

## 改一次

将第二次调用的 confirmed=True 改为 False，使用新文件名 preview-only.json 测试。

参考答案：调用 workflow("任务：学习流程", confirmed=False, path=Path("preview-only.json")) 后不应出现该文件。旧 confirmed.json 不会自动删除。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。
