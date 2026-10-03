import { Link, Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main')({
  component: MainLayout,
})

/**
 * 主站布局（pathless layout，URL 中不出现该段）：
 * 顶栏 + 导航 + 内容区，只包裹需要登录态/统一导航的页面。
 */
function MainLayout() {
  return (
    <>
      <header
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          padding: '0 24px',
          height: 56,
          borderBottom: '1px solid #e5e5e5',
        }}
      >
        <strong>优道 · 管理端</strong>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link to="/" activeOptions={{ exact: true }}>
            首页
          </Link>
          <Link to="/about">关于</Link>
          <Link to="/login">登录</Link>
        </nav>
      </header>
      <main style={{ padding: 24 }}>
        <Outlet />
      </main>
    </>
  )
}
