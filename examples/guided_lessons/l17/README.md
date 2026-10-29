# l17 手把手教程

先用明确标记的离线适配器练习请求、配置与失败日志。真实模型调用单独显式开启，绝不把预设回答当作 AI 的能力。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe main.py
.venv/Scripts/python.exe main.py --fail
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

第一次 mode=offline、usage=null，文本以“离线预设”开头；--fail 显示 TimeoutError；两次都有耗时，数值随机器变化。未加 --live 不发请求、不收费。

## 逐段讲解

### ask / live

函数把界面与模型服务隔开：默认返回预设数据。真正请求需 --live 并配置环境变量，模型名称不在代码中猜测。

### messages / max_tokens

messages 是对话列表；role=user 是用户问题。max_tokens 限制本次输出长度，但不是账户总预算。

### try / 日志

日志记录模式、耗时和错误类型，不打印密钥。离线 usage=null 表示没有真实 token 统计，不是零成本实测报告。

## 改一次

先跑 --fail，然后在不加 --live 的情况下改变问题文字，观察回答是否变化。

参考答案：离线答复仍相同，因为是固定返回；不要把它用于模型效果比较。需要真实调用时，先读 https://api-docs.deepseek.com/zh-cn/，自行设置 MODEL_API_KEY 和 MODEL_NAME，并加 --live；先在服务后台设置预算。这条收费路径未由本次测试调用。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

默认离线免费；--live 是用户自行选择的真实网络调用，可能收费。没有在前端或源码存储密钥。
