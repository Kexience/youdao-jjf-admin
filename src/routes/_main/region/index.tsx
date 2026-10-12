import { createFileRoute, redirect } from '@tanstack/react-router'

/**
 * /region 无独立页面，直接跳到同步管理首页（同步任务 + 变动清单）。
 */
export const Route = createFileRoute('/_main/region/')({
  beforeLoad: () => {
    throw redirect({ to: '/region/sync' })
  },
})
