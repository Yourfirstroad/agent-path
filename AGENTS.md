# Agent Path 开发约定

先读 README.md、PRODUCT.md、design-model.yaml、docs/开发进度.md，再检查现有改动。中文协作。

- 本工程从 React Foundry 复制，但当前产品是 Python + React 的个人 AI 学习站；不要恢复模板演示路由。
- 活跃业务在 backend 和 src/features/learning；页面入口 src/app/learning-app.tsx，视觉变量 src/styles/learning.css。
- 在线版用 npm run build:pages 构建到 dist-pages，browser-storage.ts 保存独立浏览器记录；本机版仍用 Python API / SQLite。修改共享页面时同时验证两种模式。发布命令 npm run publish:pages 需要用户授权；不要把数据库、备份或环境放进构建产物。
- 云端同步实现及准备状态见 docs/云端同步.md。只同步课程、项目、时长，不上传笔记和收藏；用户、访客缓存分开。提醒凭证只放被忽略的私有目录，不放自动化提示或仓库。真实服务未接通时不要声称已上线。
- 继续遵循已确认的 finesse 设计，默认森林深色，用户可选石墨蓝与纸白；新组件使用语义变量并验证三套主题。
- 学习内容用稳定 ID 更新，不能重置 data/learning.sqlite3 或覆盖用户笔记。
- 未获得明确授权，不新增收费调用、不公开部署、不提交或推送。
- 资料更新先核对官方来源；区分已核实事实、建议、岗位样本与未验证的效果。
- 写入成功后才反馈成功；无效备份不得覆盖数据；恢复前保留可导入快照。
- 常规验证：npm run build；Python unittest；npm run test:e2e。测试只用独立数据库。
- 修改样式时验证 320、375、414、768、1440 布局，保留可见焦点与减弱动态支持。
- 不主动使用子代理。第三方组件保留许可证与来源。
- 框架课程由 backend/framework_curriculum.py 扩展；保留 l01–l40 稳定 ID，新单元使用 lc / lg 前缀。示例源在 examples/agent_labs，发布时只打包固定源码清单。实战依赖安装在单独环境，不加入网站后端 requirements。不能用教学模型测试代替真实模型效果验证。
- Harness / Deep Agents 课程由 backend/harness_curriculum.py 扩展，稳定 ID 为 h01–h06、da01–da08，示例在 examples/harness_labs，下载由 scripts/package_harness_labs.py 固定清单生成。该目录的 AGENTS.md 和 skills/study/SKILL.md 是课程输入文件，不能当作本仓库开发指令。新增课程需同步 cloud/002_curriculum.sql 的公开目录，position 有唯一约束，必须保持事务迁移及旧进度兼容测试。每周维护规则及核对来源见 docs/课程更新记录.md。
