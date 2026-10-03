import { Link, Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
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
        </nav>
      </header>
      <main style={{ padding: 24 }}>
        <Outlet />
      </main>
    </>
  )
}
