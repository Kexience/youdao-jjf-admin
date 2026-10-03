import { DesktopOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { Segmented, theme } from 'antd'

import { useThemeStore } from '../stores/theme'

export const Route = createFileRoute('/_main')({
  component: MainLayout,
})

/**
 * 主站布局（pathless layout，URL 中不出现该段）：
 * 顶栏 + 导航 + 内容区，只包裹需要登录态/统一导航的页面。
 */
function MainLayout() {
  const { token } = theme.useToken()
  const mode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)

  return (
    <>
      <header
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          padding: '0 24px',
          height: 56,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer,
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
        <div style={{ marginLeft: 'auto' }}>
          <Segmented<ThemeMode>
            value={mode}
            onChange={(value) => setMode(value)}
            options={[
              { value: 'light', icon: <SunOutlined />, label: '浅色' },
              { value: 'dark', icon: <MoonOutlined />, label: '深色' },
              { value: 'system', icon: <DesktopOutlined />, label: '跟随系统' },
            ]}
          />
        </div>
      </header>
      <main
        style={{ padding: 24, background: token.colorBgLayout, minHeight: 'calc(100vh - 56px)' }}
      >
        <Outlet />
      </main>
    </>
  )
}
