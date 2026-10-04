import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { AdminLayout } from '../components/AdminLayout'
import { useAuthStore } from '../stores/auth'

export const Route = createFileRoute('/_main')({
  beforeLoad: ({ location }) => {
    // 无 token 直接进业务页：踢回 /login 并记住原路径，登录成功后跳回
    if (!useAuthStore.getState().token) {
      throw redirect({
        to: '/login',
        search: location.pathname === '/' ? undefined : { redirect: location.href },
      })
    }
  },
  component: MainLayout,
})

/**
 * 主站布局（pathless layout，URL 中不出现该段）：
 * ProLayout 侧边栏 + 顶栏，只包裹需要登录态/统一导航的页面。
 */
function MainLayout() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}
