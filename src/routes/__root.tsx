import { Outlet, createRootRoute } from '@tanstack/react-router'
import { App, ConfigProvider, theme as antdTheme } from 'antd'
import zhCN from 'antd/locale/zh_CN'

import { useResolvedTheme } from '../stores/theme'

export const Route = createRootRoute({
  component: RootLayout,
})

/**
 * 根路由：ConfigProvider + App 全局只此一处，
 * 深色模式状态全部来自 zustand store（src/stores/theme.ts）。
 */
function RootLayout() {
  const resolved = useResolvedTheme()

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: resolved === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <App>
        <Outlet />
      </App>
    </ConfigProvider>
  )
}
