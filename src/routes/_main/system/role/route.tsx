import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/system/role')({
  component: RolesLayout,
})

/**
 * 角色布局路由（无自身 UI，只做嵌套容器）：
 * 列表（index）与详情（$roleId）为平级子路由，共用 /system/role 前缀。
 */
function RolesLayout() {
  return <Outlet />
}
