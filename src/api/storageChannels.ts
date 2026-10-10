import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

import { get, post, put } from '../lib/request'
import type { ApiError } from '../lib/request'

/**
 * 存储通道（线上文档 tag「存储通道」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 *
 * 本模块直接暴露 React Query hooks，调用方无需再手写 queryKey / invalidate。
 */

export const STORAGE_CHANNELS_QUERY_KEY = ['admin-storage-channels'] as const

type StorageChannelsQueryOptions = Omit<UseQueryOptions<StorageChannel[]>, 'queryKey' | 'queryFn'>

/** 通道列表，按优先级升序：GET /admin/storage/channels */
export function useGetStorageChannels(options?: StorageChannelsQueryOptions) {
  return useQuery({
    ...options,
    queryKey: STORAGE_CHANNELS_QUERY_KEY,
    queryFn: () => get<StorageChannel[]>('/storage/channels'),
  })
}

/** 新增通道：POST /admin/storage/channels，成功后自动刷新列表 */
export function useCreateStorageChannel(
  options?: UseMutationOptions<StorageChannel, ApiError, StorageChannelSaveParams>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: (params) => post<StorageChannel>('/storage/channels', params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: STORAGE_CHANNELS_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/** 修改通道入参：路径 id + 保存体（未填密钥保留原值） */
export interface UpdateStorageChannelVars {
  id: number
  params: StorageChannelSaveParams
}

/** 修改通道：PUT /admin/storage/channels/{id}，成功后自动刷新列表 */
export function useUpdateStorageChannel(
  options?: UseMutationOptions<StorageChannel, ApiError, UpdateStorageChannelVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: ({ id, params }) => put<StorageChannel>(`/storage/channels/${id}`, params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: STORAGE_CHANNELS_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/** 停用/启用通道入参 */
export interface SetStorageChannelEnabledVars {
  id: number
  enabled: boolean
}

/** 停用/启用通道：PUT /admin/storage/channels/{id}/enabled，成功后自动刷新列表 */
export function useSetStorageChannelEnabled(
  options?: UseMutationOptions<StorageChannel, ApiError, SetStorageChannelEnabledVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: ({ id, enabled }) =>
      put<StorageChannel>(`/storage/channels/${id}/enabled`, { enabled }),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: STORAGE_CHANNELS_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}
