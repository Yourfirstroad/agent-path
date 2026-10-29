# l01 手把手教程

今天只做一件事：让电脑显示你的名字。网页是教材，编辑器负责保存代码，终端负责运行代码；这三个窗口作用不同。

先打开 https://www.python.org/downloads/ 安装受支持的 Python 3（本教程以 3.12 验证，Windows 安装勾选 Add Python to PATH）。安装后重新打开终端。在桌面新建 learn-agent 文件夹，用编辑器新建 hello.py，复制下面代码并保存。也可以下载教程包直接打开 l01 文件夹。终端就是输入命令后按回车的窗口：在文件夹地址栏输入 powershell 回车即可打开。

## 运行（Windows PowerShell）

```powershell
python --version
python hello.py
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

第一行版本为 Python 3.x；运行文件后显示：
你好，学习者！
今天开始构建我的第一个 Agent。

## 逐段讲解

### name = "学习者"

name 是给这段文字起的名字，等号把右边的文字存进去。引号必须成对，使用英文半角引号。

### print(f"你好，{name}！")

print 把括号里的内容显示出来；f 让 {name} 被替换成变量中的文字。花括号不出现在最终结果中。

### 保存 → 运行

Ctrl+S 是保存；终端中的 python hello.py 才是运行。上次运行的输出不会随编辑自动改变。

## 改一次

把学习者改为小林，保存并再运行。随后只删掉一个引号，观察最后一行报错，再补回。

参考答案：第一行改为 name = "小林"。应看到“你好，小林！”。缺引号时是 SyntaxError（语法错误），补齐两边引号后可重新运行。

## 排错

- python 无法识别：关闭旧终端重开，试 py --version；若可用，把本课 python 换为 py。两者都不行则重新检查 Python 安装与 PATH。
- 提示 can't open file：输入 dir，应能看到 hello.py；若是 hello.py.txt，打开资源管理器的文件扩展名显示后修正。
- 先别跳到 Agent 或结构化输出。如果连“保存并运行”还不熟，就重复本课，不需要背术语。

本课在你的电脑运行，不会修改学习网站的进度。
