import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

import { get, put } from '../lib/request'
import type { ApiError } from '../lib/request'

/**
 * 短信全局配置（线上文档 tag「短信配置」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 *
 * 本模块直接暴露 React Query hooks，调用方无需再手写 queryKey / invalidate。
 */

export const SMS_CONFIG_QUERY_KEY = ['admin-sms-config'] as const

type SmsConfigQueryOptions = Omit<UseQueryOptions<SmsConfig>, 'queryKey' | 'queryFn'>

/** 读取全局配置：GET /admin/sms/config */
export function useGetSmsConfig(options?: SmsConfigQueryOptions) {
  return useQuery({
    ...options,
    queryKey: SMS_CONFIG_QUERY_KEY,
    queryFn: () => get<SmsConfig>('/sms/config'),
  })
}

/**
 * 保存全局配置：PUT /admin/sms/config。
 * 文档响应为 ResultVoid（data 为空对象），这里按 void 处理。
 * 成功后自动刷新读取缓存。
 */
export function useUpdateSmsConfig(
  options?: UseMutationOptions<void, ApiError, SmsConfigSaveParams>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: async (params) => {
      await put<unknown>('/sms/config', params)
    },
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: SMS_CONFIG_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}
