import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

import { get, post, put } from '../lib/request'
import type { ApiError } from '../lib/request'

/**
 * 存储 zone（线上文档 tag「存储 zone」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 *
 * 注意新增与修改用不同的 DTO：新增（prefix 必填，无 enabled），
 * 修改（无 prefix，带 enabled）。表单值统一后由调用方分别映射。
 */

export const STORAGE_ZONES_QUERY_KEY = ['admin-storage-zones'] as const

type StorageZonesQueryOptions = Omit<UseQueryOptions<StorageZone[]>, 'queryKey' | 'queryFn'>

/** zone 列表，含停用：GET /admin/storage/zones */
export function useGetStorageZones(options?: StorageZonesQueryOptions) {
  return useQuery({
    ...options,
    queryKey: STORAGE_ZONES_QUERY_KEY,
    queryFn: () => get<StorageZone[]>('/storage/zones'),
  })
}

/** 新增 zone：POST /admin/storage/zones，成功后自动刷新列表 */
export function useCreateStorageZone(
  options?: UseMutationOptions<StorageZone, ApiError, StorageZoneCreateParams>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: (params) => post<StorageZone>('/storage/zones', params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: STORAGE_ZONES_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/** 修改 zone 入参：路径 id + 修改体 */
export interface UpdateStorageZoneVars {
  id: number
  params: StorageZoneUpdateParams
}

/** 修改 zone：PUT /admin/storage/zones/{id}，成功后自动刷新列表 */
export function useUpdateStorageZone(
  options?: UseMutationOptions<StorageZone, ApiError, UpdateStorageZoneVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: ({ id, params }) => put<StorageZone>(`/storage/zones/${id}`, params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: STORAGE_ZONES_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}
