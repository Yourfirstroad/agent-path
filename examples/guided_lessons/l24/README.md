# l24 手把手教程

用真实 MCP SDK 启动一个只读工具，再用客户端发现并调用它。客户端会自动启动服务子进程，不需要你开两个终端。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe client.py
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

工具列表包含 read_note；python.txt 返回笔记且错误标志为 False；../private.txt 和 81 字符名称返回工具错误。内容对象的排版可能随 SDK 变化。

## 逐段讲解

### MCPServer / @server.tool

把普通 Python 函数登记为可发现的工具。MCP 约定消息格式，权限仍由函数本身校验。此处使用官方 SDK 2.3.0 的 MCPServer，未复制旧版 FastMCP 导入。

### Client(StdioServerParameters)

客户端通过标准输入输出与独立服务进程交换协议消息。此 client.py 充当简单 Host 的连接部分，没有模型或聊天 UI。

### resolve / is_relative_to

先解析真实路径再检查是否位于允许目录内，阻止 ../ 跳出目录。示例目录必须由你控制，不允许攻击者并发改符号链接；这不是多租户沙箱。

## 改一次

在 public_notes 新建 http.txt 写“HTTP 是请求与响应的约定”，将客户端第一项改成 http.txt。

参考答案：客户端输入列表第一项改为 "http.txt"，重新运行应读取新内容。不要在 server.py 的 stdout 打调试日志，它用于协议；调试信息应写 stderr。

## 排错

- No module named mcp：安装本课 requirements.txt 并用本课 .venv 启动 client.py。
- 如果报 FastMCP 导入错误，检查是否复制了其他旧版教程。本课官方 SDK 2.x 使用 from mcp.server.mcpserver import MCPServer。
- 直接运行 server.py 看起来不动，是它在等协议消息。正常跟做只运行 client.py，由它启动并关闭服务。

本课在你的电脑运行，不会修改学习网站的进度。


## 官方核对来源（2026-10-29）

- [MCP 官方 SDK 2.3.0 迁移说明](https://github.com/modelcontextprotocol/python-sdk/blob/v2.3.0/docs/migration.md)
- [MCP Client 传输](https://github.com/modelcontextprotocol/python-sdk/blob/v2.3.0/docs/client/transports.md)
