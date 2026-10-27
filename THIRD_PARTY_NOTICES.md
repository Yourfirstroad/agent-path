# 第三方来源与许可证

检索日期：2026-10-26。Stars 为检索时页面近似显示值，仅说明关注度，不表示质量或兼容性保证。

| 项目                                          | 近似 Stars | 用途                         | 引入方式                                                                                     |
| --------------------------------------------- | ---------- | ---------------------------- | -------------------------------------------------------------------------------------------- |
| https://github.com/shadcn-ui/ui               | 127k       | 可访问基础组件               | 官方 CLI 生成 Button/Input/Badge/Dialog/Tabs/Switch 源码；改为本地 cn 工具函数与中文关闭文案 |
| https://github.com/satnaing/shadcn-admin      | 15.9k      | 后台导航、主题与页面分类参考 | 阅读 README，未复制其页面或业务代码                                                          |
| https://github.com/alan2207/bulletproof-react | 36k        | 按 features 组织及单向依赖   | 阅读 project-structure 文档，采用结构思路，未复制业务代码                                    |
| https://github.com/magicuidesign/magicui      | 22.9k      | 可复用官网动效方向           | 阅读项目说明；本工程几何图形与动画为独立 CSS 实现，未引入其组件源码                          |

上述仓库检索时标注 MIT。只核查了公开项目说明、相关结构文档与许可证信息，没有做完整的维护活跃度或安全审计。并未将任何完整开源后台克隆为本工程。

官网和后台页面、共享业务组件及项目管理示例是本次独立实现。所有运行依赖的版本由 package-lock.json 固定，各自许可证随 npm 包分发。系统字体由访问设备提供。没有外部照片或生成图像。

## shadcn/ui 源码许可

以下许可适用于 `src/components/ui/` 内由官方 CLI 生成并做本地适配的组件。原始来源：https://github.com/shadcn-ui/ui/blob/main/LICENSE.md

MIT License

Copyright (c) 2023 shadcn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
