import { QueryClient } from '@tanstack/react-query'

import { ApiError } from './request'

/**
 * 全局 QueryClient（在 __root.tsx 经 QueryClientProvider 注入）。
 * - 中后台页不跟随窗口聚焦自动 refetch，避免切回页面时抖动
 * - 只对网络异常 / 5xx 重试 1 次，业务错误与 401/403/4xx 不重试
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1) return false
  if (error instanceof ApiError) {
    if (error.httpStatus === undefined) return true
    return error.httpStatus >= 500
  }
  return false
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
