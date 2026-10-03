import { Outlet, createRootRoute } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { App, ConfigProvider, theme as antdTheme } from 'antd'
import zhCN from 'antd/locale/zh_CN'

import { queryClient } from '../lib/queryClient'
import { useResolvedTheme } from '../stores/theme'

export const Route = createRootRoute({
  component: RootLayout,
})

/**
 * 根路由：QueryClientProvider + ConfigProvider + App 全局只此一处，
 * 深色模式状态全部来自 zustand store（src/stores/theme.ts）。
 */
function RootLayout() {
  const resolved = useResolvedTheme()

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  )
}
