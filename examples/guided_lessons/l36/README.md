# l36 手把手教程

把 l20 的 Python 服务装进容器，数据放进命名卷。删除容器后重建，任务仍应存在。只练本机容器，不部署公网。

先完成 l20。按 https://docs.docker.com/get-started/ 安装并启动 Docker Desktop，docker version 必须同时显示 Client 与 Server。若已有同名练习容器，先确认是本课的容器再停止。第一次拉取镜像与装依赖需联网，企业使用核对许可。

## 运行（Windows PowerShell）

```powershell
docker version
docker build -t agent-path-lab36 .
docker run -d --name agent-path-lab36 -p 127.0.0.1:8036:8020 -v agent-path-lab36-data:/data agent-path-lab36
# 浏览器打开 http://127.0.0.1:8036/docs，POST /api/tasks 保存一条任务
docker stop agent-path-lab36
docker rm agent-path-lab36
docker run -d --name agent-path-lab36 -p 127.0.0.1:8036:8020 -v agent-path-lab36-data:/data agent-path-lab36
# 在 /docs 中 GET /api/tasks，应仍能看到保存的任务
```

macOS / Linux 创建环境用 python3；后续将 .venv/Scripts/python.exe 换成 .venv/bin/python。

## 预期结果

健康接口 /api/health 返回 {"ok":true}；重建同名容器后 GET /api/tasks 仍有之前任务。清理本次练习容器用 docker stop / docker rm，不删除命名卷。

## 逐段讲解

### Dockerfile

镜像是安装好的运行环境模板；COPY 只复制必要源码和依赖。本例固定 Python 次版本，正式生产还应固定基础镜像 digest 并安排安全更新。

### -p 127.0.0.1:8036:8020

把容器 8020 映射到当前电脑 8036，并限定本机访问。EXPOSE 只是说明，不等于真正开放端口。

### -v 命名卷:/data

数据库位于卷中，不跟随容器删除。不要用删除卷的操作来“重启”服务，否则会丢数据。

## 改一次

用 /docs 添加标题“容器重建测试”，再重建一遍并查询。

参考答案：POST /api/tasks 请求体 {"title":"容器重建测试"}；重建必须继续使用 agent-path-lab36-data 卷。若换了卷名会看不到旧数据，不代表数据库自动迁移。

## 排错

- 提示找不到文件：终端应位于上方列出的本课文件夹；输入 dir 确认文件存在。
- 改了代码却没变化：先 Ctrl+S 保存，再重新运行；.py 文件不能带隐藏的 .txt 后缀。

本课在你的电脑运行，不会修改学习网站的进度。


## 本次验证范围

完整 Dockerfile 与 API 已提供；API 已通过本机行为验证。本次 Docker Hub 镜像授权请求网络超时，未完成容器构建和卷持久化实测，不能算容器验收通过。请网络可用时按上方步骤亲自核对。
