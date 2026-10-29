from pathlib import Path
from mcp.server.mcpserver import MCPServer

server = MCPServer("公开笔记")
ROOT = Path(__file__).with_name("public_notes").resolve()


@server.tool()
def read_note(name: str) -> str:
    """按文件名读取 public_notes 中的公开笔记，最长 80 字符。"""
    if not name or len(name) > 80:
        raise ValueError("文件名长度不合法")
    path = (ROOT / name).resolve()
    if not path.is_relative_to(ROOT) or path.suffix != ".txt":
        raise ValueError("只允许公开目录内的 txt")
    return path.read_text(encoding="utf-8")


if __name__ == "__main__":
    server.run()
