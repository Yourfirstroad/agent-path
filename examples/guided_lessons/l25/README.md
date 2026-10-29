# l25 手把手教程

同一个请求重试两次，只保存一条；同一个编号携带不同内容时拒绝。先理解这层保护，再学习 LangGraph 的审批暂停。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe main.py
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

依次 approval_required、count:1、count:1、request_id_conflict、timeout、not_found。重新运行计数仍为 1。

## 逐段讲解

### confirmed

先确认具体 payload，再允许写。真实产品要把审批人与动作内容绑定；本课布尔参数只是演示调用边界。

### PRIMARY KEY / INSERT OR IGNORE

数据库唯一键让相同请求编号只占一行；重试不会创建第二条。随后核对内容，避免编号相同但动作已变。

### error

超时、找不到、参数错误是不同原因。调用者按错误类型选择稍后重试、改输入或停止，而不是一律重试。

## 改一次

将请求编号改为 demo-2 并使用新标题，连跑两次；再试空标题。

参考答案：同一 demo-2 两次 count 均为 1；空标题返回 invalid_input。只改 payload 不换编号会冲突，这是防止偷换已确认动作的保护。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。
