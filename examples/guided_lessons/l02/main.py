raw = input("今天学几分钟？")
try:
    minutes = int(raw)
    if minutes < 0:
        print("分钟数不能为负数")
    elif minutes >= 30:
        print("标准任务")
    else:
        print("轻量任务")
except ValueError:
    print("请输入整数，例如 60")
