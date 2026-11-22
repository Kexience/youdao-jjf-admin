import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

import { get, post } from '../lib/request'
import type { ApiError } from '../lib/request'

/**
 * 店铺管理员终审工作台（线上文档 tag「审核工作台」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 *
 * 覆盖接口：
 * - GET  /admin/shop/audits/shop-applications             分页查店铺申请单
 * - GET  /admin/shop/audits/store-applications            分页查门店申请单
 * - POST /admin/shop/audits/shop-applications/{applyId}/audit   终审店铺申请单
 * - POST /admin/shop/audits/store-applications/{applyId}/audit  终审门店申请单
 * - GET  /admin/shop/deposits/apply/{applyId}/balance     门店保证金余额（通过前核对缴清）
 *
 * 口径：
 * - statuses 为空时后端默认查全部非 approved 单（pending_agent / pending_admin /
 *   rejected_agent / rejected_admin）；rejected_agent 与 pending_admin 同列展示。
 * - 终审通过（approved=true）开通店铺/门店；驳回（approved=false）置终态并要求 reason。
 * - rejected_agent 单可被终审「推翻」：直接提交 approved=true 即通过。
 * - 门店单通过前须保证金缴清（后端校验，前端展示余额提示）。
 *
 * 注意：该组接口分页字段是 page/pageSize（与全局 PageParams 的 page/size 不同）。
 */

/** 店铺申请单分页查询键（终审后据此失效刷新） */
export const SHOP_APPLY_AUDITS_QUERY_KEY = ['shop-apply-audits'] as const

/** 门店申请单分页查询键（终审后据此失效刷新） */
export const STORE_APPLY_AUDITS_QUERY_KEY = ['store-apply-audits'] as const

/** 全部已通过店铺申请单查询键（门店经营页据此取店铺清单） */
export const APPROVED_SHOP_APPLICATIONS_QUERY_KEY = [
  ...SHOP_APPLY_AUDITS_QUERY_KEY,
  'approved-all',
] as const

/** 门店申请单保证金余额查询键前缀（按申请单分片） */
export const STORE_DEPOSIT_BALANCE_QUERY_KEY = ['store-deposit-balance'] as const

type ShopAuditsQueryOptions<T> = Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>

/**
 * 店铺申请单分页：GET /admin/shop/audits/shop-applications。
 * 供 ProTable request 直接使用（PageResult 与全局分页结构对齐）。
 */
export function fetchShopApplyAudits(params: ShopApplyQueryParams) {
  return get<PageResult<ShopApplyVo>>('/shop/audits/shop-applications', params)
}

/** 店铺申请单分页查询 hook（状态过滤 + 分页） */
export function useGetShopApplyAudits(
  params: ShopApplyQueryParams,
  options?: ShopAuditsQueryOptions<PageResult<ShopApplyVo>>,
) {
  return useQuery({
    ...options,
    queryKey: [...SHOP_APPLY_AUDITS_QUERY_KEY, params],
    queryFn: () => fetchShopApplyAudits(params),
  })
}

/**
 * 拉取全部已通过店铺申请单：后台暂无「店铺列表」接口，门店经营页靠它拿到
 * shopId 清单，再用生命周期接口按店铺查门店。
 * 该接口单页上限 100，按 total 循环翻页取齐；循环上限做防御，避免异常 total 死循环。
 */
export async function fetchAllApprovedShopApplications(): Promise<ShopApplyVo[]> {
  const pageSize = 100
  const records: ShopApplyVo[] = []
  for (let page = 1; page <= 50; page += 1) {
    const data = await fetchShopApplyAudits({ statuses: 'approved', page, pageSize })
    records.push(...data.records)
    if (data.records.length < pageSize || records.length >= data.total) break
  }
  return records
}

/** 全部已通过店铺申请单查询 hook（门店经营页的店铺清单来源） */
export function useGetAllApprovedShopApplications(
  options?: ShopAuditsQueryOptions<ShopApplyVo[]>,
) {
  return useQuery({
    ...options,
    queryKey: APPROVED_SHOP_APPLICATIONS_QUERY_KEY,
    queryFn: fetchAllApprovedShopApplications,
  })
}

/**
 * 门店申请单分页：GET /admin/shop/audits/store-applications。
 * 供 ProTable request 直接使用（PageResult 与全局分页结构对齐）。
 */
export function fetchStoreApplyAudits(params: ShopApplyQueryParams) {
  return get<PageResult<StoreApplyVo>>('/shop/audits/store-applications', params)
}

/** 门店申请单分页查询 hook（状态过滤 + 分页） */
export function useGetStoreApplyAudits(
  params: ShopApplyQueryParams,
  options?: ShopAuditsQueryOptions<PageResult<StoreApplyVo>>,
) {
  return useQuery({
    ...options,
    queryKey: [...STORE_APPLY_AUDITS_QUERY_KEY, params],
    queryFn: () => fetchStoreApplyAudits(params),
  })
}

/** 终审入参：申请单 id + 审核体（两类单共用） */
export interface ShopAuditVars {
  applyId: number
  params: ShopAuditParams
}

/**
 * 终审店铺申请单：POST /admin/shop/audits/shop-applications/{applyId}/audit。
 * 通过即开通店铺；驳回为终态；rejected_agent 单直接 approved=true 即推翻通过。
 * 成功后刷新店铺 / 门店申请单两份缓存（推翻驳回可能影响后续门店单口径）。
 */
export function useAuditShopApply(
  options?: UseMutationOptions<ShopApplyVo, ApiError, ShopAuditVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: ({ applyId, params }) =>
      post<ShopApplyVo>(`/shop/audits/shop-applications/${applyId}/audit`, params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: SHOP_APPLY_AUDITS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: STORE_APPLY_AUDITS_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/**
 * 终审门店申请单：POST /admin/shop/audits/store-applications/{applyId}/audit。
 * 通过前后端校验保证金缴清，通过后同事务建门店并回填 storeId；驳回为终态。
 * 成功后刷新店铺 / 门店申请单两份缓存。
 */
export function useAuditStoreApply(
  options?: UseMutationOptions<StoreApplyVo, ApiError, ShopAuditVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: ({ applyId, params }) =>
      post<StoreApplyVo>(`/shop/audits/store-applications/${applyId}/audit`, params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: SHOP_APPLY_AUDITS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: STORE_APPLY_AUDITS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: STORE_DEPOSIT_BALANCE_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/** 门店保证金余额：GET /admin/shop/deposits/apply/{applyId}/balance */
export function fetchStoreDepositBalance(applyId: number) {
  return get<StoreDepositBalance>(`/shop/deposits/apply/${applyId}/balance`)
}

/** 门店保证金余额查询 hook：applyId 无效时不发请求 */
export function useGetStoreDepositBalance(
  applyId: number | undefined,
  options?: ShopAuditsQueryOptions<StoreDepositBalance>,
) {
  return useQuery({
    ...options,
    queryKey: [...STORE_DEPOSIT_BALANCE_QUERY_KEY, applyId],
    queryFn: () => fetchStoreDepositBalance(applyId as number),
    enabled: applyId !== undefined && applyId > 0 && (options?.enabled ?? true),
  })
}
