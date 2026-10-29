tasks = [
    {"title": "Python", "done": True},
    {"title": "HTTP", "done": False},
    {"title": "JavaScript", "done": False},
]
done_count = 0
for task in tasks:
    if task["done"]:
        done_count += 1
    else:
        print("待学习：", task["title"])
print("完成：", done_count, "总数：", len(tasks))
