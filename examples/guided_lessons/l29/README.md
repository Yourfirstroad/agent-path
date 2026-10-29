# l29 手把手教程

把学习时长保存成可查看、修改、删除的长期偏好，同时拦住旧版本覆盖。这里练的是你自己的实验文件，不是网站账号。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe main.py set 60
.venv/Scripts/python.exe main.py set 30 --revision 1
.venv/Scripts/python.exe main.py set 90 --revision 1
.venv/Scripts/python.exe main.py delete --revision 2
.venv/Scripts/python.exe main.py show
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

新目录中 revision 依次 1、2；第三次提示旧版本冲突；删除后 revision=3、daily_minutes=null，表示以后上下文不再使用这个偏好。时间为真实当前 UTC 时间。

## 逐段讲解

### read / memory.json

退出程序后偏好还在文件里，所以是长期数据。对话 messages 不应全部塞进这个文件当成永久记忆。

### expected_revision

更新时带上刚读到的版本号。磁盘版本已变化就拒绝，避免旧输入盖掉用户最新改动。此文件实现仅适合单人串行实验。

### 删除为 None

保留版本号和来源，但清空具体偏好值，构造上下文时跳过 None。生产系统还需真正处理备份留存与删除政策。

## 改一次

删除后尝试用 revision=2 写 60，再用 revision=3 写。

参考答案：旧版本拒绝；--revision 3 成功得到 revision=4。若重复跟做，请先 show 读取实际版本，不要删除文件来规避冲突。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。
