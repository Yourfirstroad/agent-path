export const site = {
  name: 'Foundry',
  tagline: '你的前端，从这里开始。',
  description: '一套自己的积木，搭出下一次想法。',
}

export const workspaceNav = [
  { to: '/workspace', label: '工作台', icon: 'dashboard' },
  { to: '/workspace/projects', label: '项目管理', icon: 'projects' },
  { to: '/workspace/components', label: '组件实验室', icon: 'components' },
  { to: '/workspace/settings', label: '偏好设置', icon: 'settings' },
] as const
