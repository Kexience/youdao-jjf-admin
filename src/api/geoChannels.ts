import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

import { get, post, put } from '../lib/request'
import type { ApiError } from '../lib/request'

/**
 * 地图通道（线上文档 tag「地图通道」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 *
 * 本模块直接暴露 React Query hooks，调用方无需再手写 queryKey / invalidate。
 */

export const GEO_CHANNELS_QUERY_KEY = ['admin-geo-channels'] as const

type GeoChannelsQueryOptions = Omit<UseQueryOptions<GeoChannel[]>, 'queryKey' | 'queryFn'>

/** 通道列表，按优先级升序：GET /admin/geo/channels */
export function useGetGeoChannels(options?: GeoChannelsQueryOptions) {
  return useQuery({
    ...options,
    queryKey: GEO_CHANNELS_QUERY_KEY,
    queryFn: () => get<GeoChannel[]>('/geo/channels'),
  })
}

/** 新增通道：POST /admin/geo/channels，成功后自动刷新列表 */
export function useCreateGeoChannel(
  options?: UseMutationOptions<GeoChannel, ApiError, GeoChannelSaveParams>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: (params) => post<GeoChannel>('/geo/channels', params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: GEO_CHANNELS_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/** 修改通道入参：路径 id + 保存体（未传 Secret 保留原值） */
export interface UpdateGeoChannelVars {
  id: number
  params: GeoChannelSaveParams
}

/** 修改通道：PUT /admin/geo/channels/{id}，成功后自动刷新列表 */
export function useUpdateGeoChannel(
  options?: UseMutationOptions<GeoChannel, ApiError, UpdateGeoChannelVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: ({ id, params }) => put<GeoChannel>(`/geo/channels/${id}`, params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: GEO_CHANNELS_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/** 停用/启用通道入参 */
export interface SetGeoChannelEnabledVars {
  id: number
  enabled: boolean
}

/** 停用/启用通道：PUT /admin/geo/channels/{id}/enabled，成功后自动刷新列表 */
export function useSetGeoChannelEnabled(
  options?: UseMutationOptions<GeoChannel, ApiError, SetGeoChannelEnabledVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: ({ id, enabled }) => put<GeoChannel>(`/geo/channels/${id}/enabled`, { enabled }),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: GEO_CHANNELS_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/** 连通性测试：POST /admin/geo/channels/{id}/test（不改动列表，无需 invalidate） */
export function useTestGeoChannel(
  options?: UseMutationOptions<GeoChannelTestResult, ApiError, { id: number }>,
) {
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: ({ id }) => post<GeoChannelTestResult>(`/geo/channels/${id}/test`),
    ...rest,
    onSuccess: (...args) => {
      onSuccess?.(...args)
    },
  })
}
