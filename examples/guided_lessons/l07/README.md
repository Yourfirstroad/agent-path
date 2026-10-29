# l07 手把手教程

为一个小项目创建独立依赖环境。uv.lock 是本次安装版本的清单，换电脑时按它重建。

先按 https://docs.astral.sh/uv/getting-started/installation/ 安装 uv。新开终端验证 uv --version。进入 l07 目录，安装时需联网；这节不用手动创建 .venv，uv 会创建。

## 运行（Windows PowerShell）

```powershell
uv --version
uv init --bare
uv add httpx==0.28.1
uv run python main.py
uv sync --locked
uv run python main.py
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

两次都显示 httpx 已安装：0.28.1 和“没有发出网络请求”。文件夹新增 pyproject.toml、uv.lock、.venv。

## 逐段讲解

### uv init --bare

在当前课的空项目骨架中生成项目配置；--bare 不创建额外示例文件。请只执行一次，已存在配置时直接下一步。

### uv add

下载依赖并写入配置与锁文件。依赖是别人发布的功能包；这里 httpx 负责发送网络请求。

### uv sync --locked

严格按锁文件同步，配置与锁不匹配时失败，不会偷偷更新。换电脑应重新创建 .venv，不能复制旧环境。

## 改一次

打开 pyproject.toml 与 uv.lock 找到 httpx，再执行 uv run python -c "import sys; print(sys.executable)"。

参考答案：输出路径应在本课 .venv 中。Git 只加入 pyproject.toml、uv.lock、main.py，.gitignore 写 .venv/；不要把环境上传。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。


## 官方核对来源（2026-10-29）

- [uv 项目与锁文件](https://docs.astral.sh/uv/guides/projects/)
