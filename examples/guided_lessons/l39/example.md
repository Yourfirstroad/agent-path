# 任务 CLI（教学示范，不是你的验收报告）

问题：用三个终端命令维护个人学习任务。
启动：python tasks.py add "HTTP"，python tasks.py list，python tasks.py done 1。
架构：argparse 解析命令，SQLite 保存任务，unittest 检查行为。
取舍：SQLite 便于单机携带，不需要数据库服务器；命令行便于先集中学 Python，但不适合只用手机的朋友。
证据：必须由自己补充真实运行日期与输出；本文件不代替你运行。
限制：单用户本地工具，无登录、云同步和 AI 理解；不能宣传为多用户生产系统。
三分钟演示：30 秒问题，60 秒添加/完成，60 秒错误输入与恢复，30 秒限制与改进。
