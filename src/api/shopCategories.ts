import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

import { get, post } from '../lib/request'
import type { ApiError } from '../lib/request'

/**
 * 行业分类（线上文档 tag「行业与标签」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 *
 * 覆盖接口（注意写操作都是 POST，不是 PUT）：
 * - GET  /admin/shop/taxonomy/categories             分类树（后台全量，含停用）
 * - POST /admin/shop/taxonomy/categories             建分类
 * - POST /admin/shop/taxonomy/categories/{id}        改分类（名称/图标/排序）
 * - POST /admin/shop/taxonomy/categories/{id}/status 启停分类（enabled）
 *
 * 业务口径（后端 ShopTaxonomyService，design D9）：
 * - 店铺与门店共用一棵两级行业树：pid=0 为一级，一级下挂二级，二级不可再挂；
 * - 分类「建改停」无删除：历史申请单/主表引用 id+name 快照，删行会变孤儿引用，
 *   不再使用的分类一律停用；
 * - 停用只影响新单可选范围，已有快照不受影响；
 * - 带子级的一级分类不可停用（须先停用其子分类）。
 *
 * 权限码：查询 admin:shop:category:list，建/改/启停共用 admin:shop:category:save。
 */

/** 分类树查询键：建/改/启停成功后按此键失效缓存 */
export const SHOP_CATEGORIES_QUERY_KEY = ['shop-categories'] as const

type ShopCategoriesQueryOptions = Omit<
  UseQueryOptions<ShopCategoryNode[]>,
  'queryKey' | 'queryFn'
>

/** 行业分类树（不分页，后台全量含停用）：GET /admin/shop/taxonomy/categories */
export function useGetShopCategoryTree(options?: ShopCategoriesQueryOptions) {
  return useQuery({
    // 基础数据：短时间复用，避免页面切换频繁重拉
    staleTime: 60_000,
    ...options,
    queryKey: SHOP_CATEGORIES_QUERY_KEY,
    queryFn: () => get<ShopCategoryNode[]>('/shop/taxonomy/categories'),
  })
}

/** 新建分类：POST /admin/shop/taxonomy/categories，成功后自动刷新分类树 */
export function useCreateShopCategory(
  options?: UseMutationOptions<ShopCategory, ApiError, ShopCategoryCreateParams>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: (params) => post<ShopCategory>('/shop/taxonomy/categories', params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: SHOP_CATEGORIES_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/** 修改分类入参：路径 id + 修改体（未传字段由后端保持原值） */
export interface UpdateShopCategoryVars {
  id: number
  params: ShopCategoryUpdateParams
}

/** 修改分类：POST /admin/shop/taxonomy/categories/{id}，成功后自动刷新分类树 */
export function useUpdateShopCategory(
  options?: UseMutationOptions<ShopCategory, ApiError, UpdateShopCategoryVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: ({ id, params }) =>
      post<ShopCategory>(`/shop/taxonomy/categories/${id}`, params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: SHOP_CATEGORIES_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/** 启停分类入参 */
export interface SetShopCategoryStatusVars {
  id: number
  enabled: boolean
}

/** 启停分类：POST /admin/shop/taxonomy/categories/{id}/status，成功后自动刷新分类树 */
export function useSetShopCategoryStatus(
  options?: UseMutationOptions<ShopCategory, ApiError, SetShopCategoryStatusVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: ({ id, enabled }) =>
      post<ShopCategory>(`/shop/taxonomy/categories/${id}/status`, { enabled }),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: SHOP_CATEGORIES_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}
