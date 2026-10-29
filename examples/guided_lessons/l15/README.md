# l15 手把手教程

让网页读取真实的本地 Python 接口。页面与接口由同一个服务提供，这次不用先学习跨域配置。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe -m uvicorn app:app --host 127.0.0.1 --port 8015
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

打开 http://127.0.0.1:8015，点“读取任务”，显示“读取成功”和学习 fetch。停止后端，再点按钮，应显示“读取失败，请检查服务是否启动”。

## 逐段讲解

### fetch("/api/tasks")

斜线开头表示当前网站的路径。所以本课要通过 8015 打开，不能双击 HTML，否则没有这个接口。

### response.ok

HTTP 404/500 不一定让 fetch 抛异常；先检查 ok，再解析 JSON。

### try / catch

成功、空数组和失败分别显示不同文字。只读任务不会保存修改；页面里没有模型密钥。

## 改一次

将后端返回列表改为 []，重启服务后再次点按钮。

参考答案：把 tasks 函数改为 return []，应显示“暂时没有任务”，不是失败。恢复原列表后重启，数据重新显示。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。
