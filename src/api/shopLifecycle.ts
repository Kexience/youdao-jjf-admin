import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

import { get, post } from '../lib/request'
import type { ApiError } from '../lib/request'

/**
 * 店铺/门店经营生命周期（线上文档 tag「经营生命周期」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 *
 * 覆盖接口：
 * - GET  /admin/shop                                      店铺列表分页（店铺列表页数据源）
 * - GET  /admin/shop/stores                               门店列表分页（支持按店铺 / 状态 / 关键词过滤）
 * - GET  /admin/shop/lifecycle/shops/{shopId}/stores      按店铺查门店列表（含已关店）
 * - POST /admin/shop/lifecycle/shops/{shopId}/freeze     冻结店铺
 * - POST /admin/shop/lifecycle/shops/{shopId}/suspend    停业店铺
 * - POST /admin/shop/lifecycle/shops/{shopId}/resume     恢复店铺营业
 * - POST /admin/shop/lifecycle/shops/{shopId}/close      店铺关店（终态）
 * - POST /admin/shop/lifecycle/stores/{storeId}/freeze   冻结门店
 * - POST /admin/shop/lifecycle/stores/{storeId}/suspend  停业门店
 * - POST /admin/shop/lifecycle/stores/{storeId}/resume   恢复门店营业
 * - POST /admin/shop/lifecycle/stores/{storeId}/close    门店关店（终态）
 *
 * 状态机（后端 ShopLifecycleService，design D10）：
 * - freeze：active/suspended → frozen（风控处置，停止订货与交易）；
 * - suspend：active/frozen → suspended；
 * - resume：frozen/suspended → active（清冻结/停业时间）；
 * - close：active/suspended → closed（终态；frozen 须先恢复，不可绕过风控结论）。
 *
 * 业务前置（后端校验，前端只需展示错误信息）：
 * - 店铺关店要求其下所有门店均已关店；
 * - 门店关店要求保证金已结清（余额归零）。
 *
 * 权限码：店铺 admin:shop:shop:{list,freeze,suspend,resume,close}，
 * 门店 admin:shop:store:{list,freeze,suspend,resume,close}。
 *
 * 页面取数说明：
 * - 店铺列表页（/shop/list）直接分页查店铺列表（GET /admin/shop），
 *   支持经营状态与名称/联系电话关键词过滤；
 * - 门店列表页（/shop/store）直接分页查门店列表（GET /admin/shop/stores），
 *   支持按归属店铺、经营状态与名称/联系电话关键词过滤（不传 shopId 即跨店铺）；
 * - 按店铺查门店（GET /admin/shop/lifecycle/shops/{shopId}/stores）返回全量列表不分页，
 *   供需要单店铺全量门店的场景使用。
 */

/** 店铺列表查询键前缀（生命周期动作后据此失效刷新） */
export const SHOP_LIFECYCLE_SHOPS_QUERY_KEY = ['shop-lifecycle-shops'] as const

/** 门店列表查询键前缀（按店铺 id 分片；生命周期动作后据此失效刷新） */
export const SHOP_LIFECYCLE_STORES_QUERY_KEY = ['shop-lifecycle-stores'] as const

/** 生命周期动作（店铺/门店共用，动作名即接口路径末段） */
export type ShopLifecycleAction = 'freeze' | 'suspend' | 'resume' | 'close'

type ShopLifecycleQueryOptions<T> = Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>

/**
 * 店铺列表分页：GET /admin/shop。
 * 供店铺列表页 ProTable request 直接使用（PageResult 与全局分页结构对齐）。
 * statuses 为逗号分隔串（axios 对数组会展开成 statuses[]=xxx，后端解析不到）。
 */
export function fetchShops(params: ShopListQueryParams) {
  return get<PageResult<ShopVo>>('/shop', params)
}

/**
 * 门店列表分页：GET /admin/shop/stores。
 * 不传 shopId 即跨店铺查询；statuses 同样用逗号分隔串。
 * 供门店列表页 ProTable request 直接使用。
 */
export function fetchStores(params: StoreListQueryParams) {
  return get<PageResult<StoreVo>>('/shop/stores', params)
}

/**
 * 按店铺查门店列表：GET /admin/shop/lifecycle/shops/{shopId}/stores。
 * 返回全量列表（不分页），含已关店门店；后端保证空集合而非 null。
 */
export function fetchStoresOfShop(shopId: number) {
  return get<StoreVo[]>(`/shop/lifecycle/shops/${shopId}/stores`)
}

/** 按店铺查门店列表 hook：shopId 无效时不发请求 */
export function useGetStoresOfShop(
  shopId: number | undefined,
  options?: ShopLifecycleQueryOptions<StoreVo[]>,
) {
  return useQuery({
    ...options,
    queryKey: [...SHOP_LIFECYCLE_STORES_QUERY_KEY, shopId],
    queryFn: () => fetchStoresOfShop(shopId as number),
    enabled: shopId !== undefined && shopId > 0 && (options?.enabled ?? true),
  })
}

/**
 * 店铺生命周期动作入参：店铺 id + 动作
 */
export interface ShopLifecycleVars {
  shopId: number
  action: ShopLifecycleAction
}

/** 门店生命周期动作入参：门店 id + 动作 */
export interface StoreLifecycleVars {
  storeId: number
  action: ShopLifecycleAction
}

/**
 * 执行店铺生命周期动作：POST /admin/shop/lifecycle/shops/{shopId}/{action}。
 * 成功返回变更后的店铺视图；非法流转/存在未关店门店时后端抛业务错误。
 */
export function changeShopLifecycle({ shopId, action }: ShopLifecycleVars) {
  return post<ShopVo>(`/shop/lifecycle/shops/${shopId}/${action}`)
}

/**
 * 执行门店生命周期动作：POST /admin/shop/lifecycle/stores/{storeId}/{action}。
 * 成功返回变更后的门店视图；未结清保证金时关店会被后端拒绝。
 */
export function changeStoreLifecycle({ storeId, action }: StoreLifecycleVars) {
  return post<StoreVo>(`/shop/lifecycle/stores/${storeId}/${action}`)
}

/**
 * 店铺生命周期动作 mutation。
 * 成功后刷新该店铺下的门店列表（店铺状态可能影响列表页展示与可操作项）。
 */
export function useChangeShopLifecycle(
  options?: UseMutationOptions<ShopVo, ApiError, ShopLifecycleVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: changeShopLifecycle,
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: SHOP_LIFECYCLE_SHOPS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: SHOP_LIFECYCLE_STORES_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/**
 * 门店生命周期动作 mutation。
 * 成功后刷新门店列表缓存，页面直接回读最新经营状态与时间列。
 */
export function useChangeStoreLifecycle(
  options?: UseMutationOptions<StoreVo, ApiError, StoreLifecycleVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: changeStoreLifecycle,
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: SHOP_LIFECYCLE_STORES_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}
