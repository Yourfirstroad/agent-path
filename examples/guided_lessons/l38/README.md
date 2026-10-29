# l38 手把手教程

最后一个完整作品：React 展示来源与审批，Python 用真实 LangGraph 暂停、保存检查点并恢复；重复批准只写一次。

先完成 lc01–lc04、l31、lg01–lg04 与 l20。保留本课全部文件，在独立 .venv 安装依赖。停止其他占用 5176/8020 的实验，再开两个终端。不要把学习网站数据库拷进这里。

## 运行（Windows PowerShell）

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe -m uvicorn app:app --host 127.0.0.1 --port 8020
# 保留 Python 窗口，在同一文件夹新开第二个终端
npm ci
npm run dev
# 测试使用临时目录
.venv/Scripts/python.exe -m unittest -v
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

开始 LangGraph 主题后显示等待确认、写入 0。批准后已保存、写入 1。保存任务编号，重启 Python 后读取仍存在。测试包含批准去重、拒绝、取消、预算与跨进程恢复，共 5 项。

## 逐段讲解

### research.py / StateGraph

节点处理研究、审批、提交，状态保存主题、预算、来源与轨迹。research 查询本地两个官方地址，计划是规则生成，非实时联网研究。

### interrupt / Command

审批节点暂停，把草稿留给人。批准、拒绝、取消作为恢复值传回，只有 approved 分支进入 commit。

### 两个 SQLite 文件

checkpoints.db 保存流程状态，actions.db 用任务 ID 唯一约束保护副作用。流程检查点不能代替保存操作自己的去重。

### app.py / lock

在这个单进程本地服务中串行处理请求，防止同时恢复一个任务。多进程、多用户生产部署需要更完整的权限与并发设计。

### 五种演示

正常批准、拒绝、取消、预算为 0、重启后批准。cancel 在等待审批时结束，不会撤销已保存内容；没有真实账单，预算只是演示单位。

## 改一次

做五种演示，分别保留任务编号；在 /docs 重复批准同一任务，检查 writes。

参考答案：重复批准返回相同已完成状态、writes=1；拒绝/取消为 0；预算 0 在检索前停止。将 topic 改成未知主题应 no_evidence。运行 unittest 的结果才是本机代码证据，不能写成真实 AI 质量报告。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

完整本地教学应用；真实框架/数据库/审批执行，研究答案为离线规则；无登录隔离，不是可直接公开的多人服务。
