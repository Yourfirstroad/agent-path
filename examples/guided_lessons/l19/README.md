# l19 手把手教程

让文字一点点出现，并能停止。用真实本地 HTTP 流传输预设文字，观察网络分块与“完整消息”不是同一回事。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe -m uvicorn app:app --host 127.0.0.1 --port 8019
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

打开 http://127.0.0.1:8019，开始后逐段出现“这是本地预设文字流。”并显示已完成。中途停止显示已取消；勾选模拟中断只显示“这是本地”，并提示内容未完成。

## 逐段讲解

### StreamingResponse

后端每 0.4 秒送出一条 JSON 行，最后单独送 done:true 作为完成信号，不靠连接结束猜成功。

### TextDecoder / buffer

网络可能把一个字或一条 JSON 拆开。decoder 保留字节状态，buffer 保留未凑齐换行的一段，凑齐再 JSON.parse。

### AbortController

停止按钮取消本次浏览器请求，保留已收到的文字。真实模型远端是否停止和停止计费，要看提供商支持，不由前端按钮保证。

## 改一次

将服务端 fail 的 index 从 2 改为 1，重启后再次模拟中断。

参考答案：勾选后只收到“这是”，没有 done:true，仍应显示内容未完成。若页面显示完成，就说明错误地把连接结束当成任务完成。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

文字内容是预设，HTTP 流和取消实际运行；不是模型流式质量或远端计费验证。
