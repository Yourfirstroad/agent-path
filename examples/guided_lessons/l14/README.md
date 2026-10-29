# l14 手把手教程

第一次在浏览器运行 JavaScript。不用安装 Node，双击 HTML 文件就能看到任务筛选结果。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
# 不用终端。完整解压后，双击 index.html，用浏览器打开。
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

页面显示 titles 为 ["JS"]，done 为 1。

## 逐段讲解

### const tasks

const 让变量不能被重新赋给另一个数组，但数组里的对象仍可能被修改。JS 对象类似 Python 字典，布尔值写 true/false。

### filter 与 map

filter 按条件保留元素，map 把每个元素变成新值。task => ... 是箭头函数，类似一个很短的处理函数。

### textContent

把结果作为文字写进页面。JSON.stringify 方便把对象显示出来，不会执行字符串里的 HTML。

## 改一次

增加未完成的 HTTP 任务，再把 tasks 改为空数组。

参考答案：数组里追加 {title:"HTTP",done:false}，titles 变成 ["JS","HTTP"]；改成 [] 后 titles 是 []、done 是 0。保存后刷新浏览器。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。
