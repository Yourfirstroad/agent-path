"""第二课：参数正确不等于有权限。仅访问临时练习目录，不运行 shell。"""

from pathlib import Path
from tempfile import TemporaryDirectory


def read_note(root, name):
    if not isinstance(name, str) or not name.endswith(".txt"):
        raise ValueError("只能读取 .txt 文件")
    root = Path(root).resolve(strict=True)
    target = (root / name).resolve(strict=True)
    if not target.is_relative_to(root):
        raise PermissionError("文件超出允许目录")
    if target.stat().st_size > 4096:
        raise ValueError("文件过大，先切分")
    return target.read_text(encoding="utf-8")


if __name__ == "__main__":
    with TemporaryDirectory() as folder:
        parent = Path(folder)
        root = parent / "workspace"
        root.mkdir()
        (root / "note.txt").write_text("Python 函数可以重复使用。", encoding="utf-8")
        (parent / "private.txt").write_text("不应读取", encoding="utf-8")
        print("允许：", read_note(root, "note.txt"))
        try:
            read_note(root, "../private.txt")
        except PermissionError as error:
            print("拒绝：", error)
    # resolve 阻挡静态路径穿越；这不是对抗并发改链接的操作系统沙箱。
