# l21 手把手教程

把“模型想调用工具”与“程序真的执行”分开。先用手写调用对象演示允许名单与参数检查，不需要模型密钥。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe main.py
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

依次为 {'ok': True, 'data': ['Python 函数']}、unknown_tool、invalid_input。未知工具不会被执行。

## 逐段讲解

### SearchInput

工具参数也是外部输入，需要自己的结构检查。min_length 和 max_length 限定查询长度，strict=True 不把数字悄悄变成文字。

### dispatch / name

dispatch 是调度入口，只认识 search_notes。不要把工具名拼成 eval、exec 或 shell 命令。

### 统一返回格式

ok 是成功标志，data 是结果，error 是可供上层判断的错误码。没找到资料可返回空列表，不等于工具崩溃。

## 改一次

增加查询 Rust 和空格的调用，猜测各自输出。

参考答案：Rust 返回 ok=True,data=[]；全空格返回 invalid_input。只把列表中的 call 改为 {"name":"search_notes","arguments":{"query":"Rust"}} 即可测试。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。
