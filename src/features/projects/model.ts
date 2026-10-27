import { z } from 'zod'

export const projectInputSchema = z.object({
  name: z.string().trim().min(2, '项目名称至少 2 个字').max(60, '项目名称最多 60 个字'),
  category: z.enum(['product', 'brand']),
  status: z.enum(['planned', 'active', 'done']),
  description: z.string().trim().max(500, '描述最多 500 个字'),
  progress: z.number().int().min(0).max(100),
})
export const projectSchema = projectInputSchema.extend({
  id: z.string().min(1),
  updatedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
})
export type ProjectInput = z.infer<typeof projectInputSchema>
export type Project = z.infer<typeof projectSchema>
export const statusLabels = { planned: '待开始', active: '进行中', done: '已完成' } as const
export const categoryLabels = { product: '后台工具', brand: '品牌展示' } as const
export const dateLabel = (iso: string) =>
  new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' }).format(new Date(iso))
