import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

import { get, post, put } from '../lib/request'
import type { ApiError } from '../lib/request'

/**
 * 短信通道（线上文档 tag「短信通道」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 *
 * 本模块直接暴露 React Query hooks，调用方无需再手写 queryKey / invalidate。
 */

export const SMS_CHANNELS_QUERY_KEY = ['admin-sms-channels'] as const

type SmsChannelsQueryOptions = Omit<UseQueryOptions<SmsChannel[]>, 'queryKey' | 'queryFn'>

/** 通道列表，按优先级升序：GET /admin/sms/channels */
export function useGetSmsChannels(options?: SmsChannelsQueryOptions) {
  return useQuery({
    ...options,
    queryKey: SMS_CHANNELS_QUERY_KEY,
    queryFn: () => get<SmsChannel[]>('/sms/channels'),
  })
}

/** 新增通道：POST /admin/sms/channels，成功后自动刷新列表 */
export function useCreateSmsChannel(
  options?: UseMutationOptions<SmsChannel, ApiError, SmsChannelSaveParams>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: (params) => post<SmsChannel>('/sms/channels', params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: SMS_CHANNELS_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/** 修改通道入参：路径 id + 保存体（未传 Secret 保留原值） */
export interface UpdateSmsChannelVars {
  id: number
  params: SmsChannelSaveParams
}

/** 修改通道：PUT /admin/sms/channels/{id}，成功后自动刷新列表 */
export function useUpdateSmsChannel(
  options?: UseMutationOptions<SmsChannel, ApiError, UpdateSmsChannelVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: ({ id, params }) => put<SmsChannel>(`/sms/channels/${id}`, params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: SMS_CHANNELS_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}
