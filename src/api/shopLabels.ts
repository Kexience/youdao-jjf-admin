import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

import { get, post } from '../lib/request'
import type { ApiError } from '../lib/request'

/**
 * 店铺标签（线上文档 tag「行业与标签」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 *
 * 覆盖接口：
 * - GET  /admin/shop/taxonomy/labels            标签列表（不分页）
 * - POST /admin/shop/taxonomy/labels            建标签
 * - POST /admin/shop/taxonomy/labels/{id}       改标签（注意是 POST，不是 PUT）
 * - POST /admin/shop/taxonomy/labels/{id}/status 启停标签（enabled）
 */

/** 标签列表查询键：增改与启停成功后按此键失效缓存 */
export const SHOP_LABELS_QUERY_KEY = ['shop-labels'] as const

type ShopLabelsQueryOptions = Omit<UseQueryOptions<ShopLabel[]>, 'queryKey' | 'queryFn'>

/** 标签列表（不分页）：GET /admin/shop/taxonomy/labels */
export function useGetShopLabels(options?: ShopLabelsQueryOptions) {
  return useQuery({
    ...options,
    queryKey: SHOP_LABELS_QUERY_KEY,
    queryFn: () => get<ShopLabel[]>('/shop/taxonomy/labels'),
  })
}

/** 新建标签：POST /admin/shop/taxonomy/labels，成功后自动刷新列表 */
export function useCreateShopLabel(
  options?: UseMutationOptions<ShopLabel, ApiError, ShopLabelCreateParams>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: (params) => post<ShopLabel>('/shop/taxonomy/labels', params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: SHOP_LABELS_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/** 修改标签入参：路径 id + 修改体（未传字段保持原值） */
export interface UpdateShopLabelVars {
  id: number
  params: ShopLabelUpdateParams
}

/** 修改标签：POST /admin/shop/taxonomy/labels/{id}，成功后自动刷新列表 */
export function useUpdateShopLabel(
  options?: UseMutationOptions<ShopLabel, ApiError, UpdateShopLabelVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: ({ id, params }) => post<ShopLabel>(`/shop/taxonomy/labels/${id}`, params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: SHOP_LABELS_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/** 启停标签入参 */
export interface SetShopLabelStatusVars {
  id: number
  enabled: boolean
}

/** 启停标签：POST /admin/shop/taxonomy/labels/{id}/status，成功后自动刷新列表 */
export function useSetShopLabelStatus(
  options?: UseMutationOptions<ShopLabel, ApiError, SetShopLabelStatusVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: ({ id, enabled }) =>
      post<ShopLabel>(`/shop/taxonomy/labels/${id}/status`, { enabled }),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: SHOP_LABELS_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}
