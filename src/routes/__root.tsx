import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootLayout,
})

/**
 * 根路由：只做兜底渲染，不带任何布局。
 * 主站布局在 _main.tsx（pathless layout），登录页等独立页面不套主布局。
 */
function RootLayout() {
  return <Outlet />
}
