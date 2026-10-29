# l06 手把手教程

在独立练习目录保存两次版本，看见具体改动。Git 是本地版本历史，运行本课不会发布到网上。

先从 https://git-scm.com/downloads 安装 Git，重开 PowerShell 后输入 git --version。只在新解压的 l06 文件夹操作，下面代码文件中的 commands.ps1 是命令清单：逐行复制到终端，注释行可跳过。macOS / Linux 用编辑器手工创建相同 .gitignore、修改 hello.py，Git 命令相同。

## 运行（Windows PowerShell）

```powershell
git --version
# 在本课新解压的 l06 文件夹中，逐行执行 commands.ps1 的命令，不要在已有工作项目执行。
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

git diff 中 -print("版本一") 为删去的旧行，+print("版本二") 为新行。最后 log 有两次提交，编号每台电脑不同。

## 逐段讲解

### git init / git config

init 在当前目录创建版本库；不写 --global 的 config 只设置这个练习库的提交署名。示例邮箱是无效示例，不是你的登录凭据。

### git add / git commit

add 选中要记录的文件，commit 真正保存一次快照。未 add 的改动不会进入这次提交。

### git diff / git log

diff 看还没加入暂存区的变化，log 看已经保存的版本。没有 remote 和 push，所以没有上传。

## 改一次

把 hello.py 改为版本三，先 diff 再提交；临时创建 .env 文件，用 git status --short --ignored 检查。

参考答案：git add hello.py 然后 git commit -m "增加第三版"；git log --oneline -3 应有三条。.env 应显示 !!（被忽略），不要把真实密码用于练习。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。
