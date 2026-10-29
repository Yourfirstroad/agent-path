# l12 手把手教程

把标题和分钟数交给 Python 校验。FastAPI 自动给你一个可以点按钮试接口的 /docs 页面；本课只校验和返回，还没有保存数据库。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe -m uvicorn app:app --host 127.0.0.1 --port 8012
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

浏览器打开 http://127.0.0.1:8012/docs。展开 POST /tasks → Try it out，填 {"title":"Python","minutes":30} → Execute，得到 200 和相同数据。minutes:-1、空标题、仅空格标题应为 422。

## 逐段讲解

### app = FastAPI()

创建服务对象；uvicorn app:app 的前一个 app 是 app.py 文件名，后一个是对象变量名。

### class Task(BaseModel)

把输入的字段和规则写成一张表：title 是文字，minutes 是 1 到 180 的整数。Field 描述约束，validator 拦住纯空格。

### @app.post / create_task

装饰器把一个 URL 与函数连接。校验失败时函数根本不会执行；返回校验后的对象会转成 JSON。

## 改一次

将最大时长改为 90，保存后停止并重启服务，提交 91。

参考答案：minutes 的 Field 改为 le=90。重启后 POST 91 得到 422，90 得到 200。运行命令没有 --reload，改代码不会自动重启。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。


## 官方核对来源（2026-10-29）

- [FastAPI 请求体](https://fastapi.tiangolo.com/tutorial/body/)
