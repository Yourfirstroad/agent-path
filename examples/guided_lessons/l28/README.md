# l28 手把手教程

用二十个固定问题比较两种切分方式。每个问题标好正确来源，程序实际检索后计算命中比例。

先完成前面的基础课。下载并完整解压教程包，在本课文件夹打开终端；不要在学习网站的安装目录练习。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe main.py
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

输出 dev/holdout 两组的 whole 与 short Recall@3，生成 40 条明细的 report.json。whole 为 1.0；short 较低。保留集只是大小写变化，难度很低，不能当真实应用质量证明。

## 逐段讲解

### cases / split

开发集用于观察和调整；保留集只做最后检查。真实评测应由独立问题构成，不能像教学样本一样过度相似。

### 两种切分

whole 保留整条，short 仅保留前两字符。这个故意很差的策略帮助理解“切丢证据”会降召回。

### Recall@3

每题只有一个正确来源，前三个命中包含它就为 1；平均得到本集合的召回率。报告同时保留问题、期望、实际来源以定位失败。

## 改一次

给保留集加一题 query="网络响应码", expected="http"，重新计算。

参考答案：在 cases 构造后追加该字典，split 写 holdout。关键词检索很可能未命中，使 whole 保留集指标下降；这是同义表达漏召回，不能把它删掉来提高分数。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。
