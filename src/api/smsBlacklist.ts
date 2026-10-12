import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions } from '@tanstack/react-query'

import { del, get, post } from '../lib/request'
import type { ApiError } from '../lib/request'

/**
 * 短信黑名单（线上文档 tag「短信黑名单」，MOBILE/IP/DEVICE 维度）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 *
 * 后端分页结果与全局 PageResult{total, page(1 起), size, records} 对齐，
 * 供 ProTable request 直接使用；新增 / 移出走 React Query mutation，
 * 成功后自动失效查询缓存刷新列表。
 */

/**
 * 黑名单分页查询：GET /admin/sms/blacklist。
 * 文档标记 type 必填，但描述「空=全部」，这里空字符串表示查全部维度。
 */
export function fetchSmsBlacklist(params: SmsBlacklistQueryParams) {
  return get<PageResult<SmsBlacklist>>('/sms/blacklist', params)
}

/** 新增黑名单项：POST /admin/sms/blacklist，成功后自动刷新列表 */
export function useCreateSmsBlacklist(
  options?: UseMutationOptions<SmsBlacklist, ApiError, SmsBlacklistAddParams>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: (params) => post<SmsBlacklist>('/sms/blacklist', params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: ['admin-sms-blacklist'] })
      onSuccess?.(...args)
    },
  })
}

/**
 * 移出黑名单：DELETE /admin/sms/blacklist/{id}。
 * 文档响应为 ResultVoid（data 为空对象），这里按 void 处理。
 */
export function useDeleteSmsBlacklist(options?: UseMutationOptions<void, ApiError, number>) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: async (id) => {
      await del<unknown>(`/sms/blacklist/${id}`)
    },
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: ['admin-sms-blacklist'] })
      onSuccess?.(...args)
    },
  })
}
