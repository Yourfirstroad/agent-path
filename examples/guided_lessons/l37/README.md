# l37 手把手教程

将安装、测试、构建连成一次检查。提供可本地运行的检查脚本和 CI 配置，故意改坏函数就应停止在失败处。

需要 Python 与 Node.js >=22.12。完整下载本课目录（含 package-lock.json 和隐藏的 .github 文件夹）。检查只在自己的课程副本运行，安装依赖需要联网；没有模型调用或自动发布步骤。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
# 包内已提供 package-lock.json，npm ci 按锁文件安装
.venv/Scripts/python.exe check.py
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

Python 3 项测试通过，随后安装锁定前端依赖并生成 dist。最后提示“仍需浏览器验证主要用户流程”。改坏 completion 后脚本非零退出，不继续构建。

## 逐段讲解

### subprocess.run(check=True)

上一条命令失败会抛错并停止，不能失败后继续打印“全部成功”。

### npm ci / lock

ci 使用已经提交的 package-lock.json；依赖清单不一致会失败。不能每次检查都重新随机解析依赖。

### workflow 文件

只有把这一课作为仓库根目录并由你自己推送到 GitHub 后，.github/workflows/check.yml 才触发；下载课程不会自动上传或运行。免费额度及账号设置以 GitHub 为准。

## 改一次

将 completion 的计算改为 1，运行 check.py，随后恢复。

参考答案：第一项测试应显示 1 != 0.4，脚本退出码非零；恢复后检查通过。浏览器再打开 npm run dev 对应地址，确认页面可显示。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。


## 本次验证范围

本地 check.py、Python 测试与前端构建已实跑；GitHub Actions 模板按当前官方 v7 文档核对，未替你创建远端仓库或触发远端 CI。


## 官方核对来源（2026-10-29）

- [checkout 官方用法](https://github.com/actions/checkout)
- [setup-python 官方用法](https://github.com/actions/setup-python)
- [setup-node 官方用法](https://github.com/actions/setup-node)
