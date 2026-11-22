import { createFileRoute, redirect } from '@tanstack/react-router'

/**
 * /agent/district 无独立页面，默认进入待审区代列表
 * （待审 / 全部在任 / 区域查询通过页内链接切换）。
 */
export const Route = createFileRoute('/_main/agent/district/')({
  beforeLoad: () => {
    throw redirect({ to: '/agent/district/pendings' })
  },
})
