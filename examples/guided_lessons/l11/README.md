# l11 手把手教程

先亲眼看一问一答：浏览器向你电脑上的小服务请求 /health，服务返回 JSON。无需先完成下一课。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe server.py
# 保留上面窗口，在同一文件夹打开第二个终端
.venv/Scripts/python.exe client.py
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

/health 200 application/json {'ok': True}
/missing 404 application/json {'error': 'not_found'}
停止服务后再运行 client.py 显示连接失败。

## 逐段讲解

### server.py / do_GET

这个函数处理 GET 请求，/health 是路径；127.0.0.1 指当前电脑，8011 是本实验端口。

### response.status_code

200 是服务处理成功，404 是已经连上服务但找不到路径。连接失败时连 HTTP 响应都没有。

### response.json()

HTTP 响应体是文字，json() 把 JSON 解析为字典。浏览器 F12 → 网络也能看请求与响应。

## 改一次

在浏览器打开 /missing，再停止服务刷新 /health，描述两个错误的不同。

参考答案：/missing 显示 {"error":"not_found"} 且网络面板 404；停止服务后浏览器拒绝连接。前者改路径，后者先启动服务。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。
