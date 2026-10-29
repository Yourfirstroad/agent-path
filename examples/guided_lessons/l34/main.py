from pathlib import Path

ROOT = Path(__file__).with_name("public_notes").resolve()


def read(relative):
    target = (ROOT / relative).resolve()
    if not target.is_relative_to(ROOT):
        raise ValueError("路径超出允许范围")
    if target.suffix != ".txt":
        raise ValueError("只允许 txt")
    return target.read_text(encoding="utf-8")


if __name__ == "__main__":
    print("外部资料（只当数据）：", read("attack.txt"))
    try:
        read("../private.txt")
    except ValueError as e:
        print("已阻止：", e)
    print("本程序没有 shell 和写入工具")
