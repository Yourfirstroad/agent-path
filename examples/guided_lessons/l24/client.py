import asyncio, sys
from pathlib import Path
from mcp import Client, StdioServerParameters


async def main():
    params = StdioServerParameters(
        command=sys.executable,
        args=[str(Path(__file__).with_name("server.py"))],
        env={"PYTHONIOENCODING": "utf-8", "PYTHONUTF8": "1"},
    )
    async with Client(params) as client:
        tools = await client.list_tools()
        print("发现工具：", [tool.name for tool in tools.tools])
        for name in ["python.txt", "../private.txt", "x" * 81]:
            result = await client.call_tool("read_note", {"name": name})
            print("输入：", name, "错误：", result.is_error)
            print(result.content)


if __name__ == "__main__":
    asyncio.run(main())
