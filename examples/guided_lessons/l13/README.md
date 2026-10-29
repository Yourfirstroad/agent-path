# l13 手把手教程

用本地可控的慢任务学习超时与有限重试，不靠真实网络碰运气。只对“超时”重试，参数错误直接结束。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe main.py
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

先显示成功，随后第 1、2、3 次超时，最后“已停止，请稍后重试”。程序会自己结束。

## 逐段讲解

### async def / await

async 定义可以等待的函数，await 等结果时把执行机会交给事件循环。这不等于自动加速所有代码。

### asyncio.wait_for

最多等 0.05 秒；超出时取消等待的任务并抛出 TimeoutError。本课 sleep 可取消，真实远端写操作未必能撤销。

### range(1, attempts + 1)

显式限定重试次数，失败时稍等再试。扣费、下单等写操作要先设计请求 ID 去重，不能直接套重试。

## 改一次

把第二次调用改为最多两次尝试。

参考答案：改为 await fetch_with_retry(0.2, attempts=2)，应只出现第 1、2 次超时。实际 HTTP 可用 httpx.AsyncClient(timeout=...)，超时类别需捕获 httpx.TimeoutException。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。
