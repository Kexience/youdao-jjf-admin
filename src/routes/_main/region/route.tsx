import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/region')({
  component: RegionsLayout,
})

/**
 * 行政区划布局路由（无自身 UI，只做嵌套容器）：
 * 管理首页（index：同步任务 + 变动清单）与区域查询（query）为平级子路由。
 */
function RegionsLayout() {
  return <Outlet />
}
