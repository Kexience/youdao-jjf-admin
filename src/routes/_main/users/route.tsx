import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/users')({
  component: UsersLayout,
})

/**
 * 管理员布局路由（无自身 UI，只做嵌套容器）：
 * 列表（index）与详情（$userId）为平级子路由，共用 /users 前缀。
 */
function UsersLayout() {
  return <Outlet />
}
