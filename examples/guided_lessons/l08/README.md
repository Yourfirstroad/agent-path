# l08 手把手教程

用三条自动检查保护第 4 课的函数。测试失败是有用的反馈，不能为了变绿删掉断言。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe -m pytest -q
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

显示 3 passed。故意把函数中的 done / total 改为 1 后，test_normal 失败；恢复后再次 3 passed。

## 逐段讲解

### from main import completion

测试文件导入真正的被测函数。不能在测试里再写一遍计算逻辑代替实际函数。

### assert

断言左右应相等。不相等时 pytest 报告文件、行号以及实际值与预期值。

### pytest.raises

这段代码必须抛出指定异常才通过；测试的是非法输入被拒绝，而不是所有调用都成功。

## 改一次

增加全部完成场景。

参考答案：在 test_main.py 加：
def test_all_done():
    assert completion(3, 3) == 1
重新运行应是 4 passed。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。
