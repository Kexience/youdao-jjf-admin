import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/members')({
  component: MembersLayout,
})

/**
 * 会员布局路由（无自身 UI，只做嵌套容器）：
 * 列表（index）与详情（$memberId）为平级子路由，共用 /members 前缀。
 */
function MembersLayout() {
  return <Outlet />
}
