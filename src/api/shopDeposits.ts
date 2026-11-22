import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

import { get, post } from '../lib/request'
import type { ApiError } from '../lib/request'
import { STORE_DEPOSIT_BALANCE_QUERY_KEY } from './shopAudits'

/**
 * 门店保证金管理（线上文档 tag「保证金管理」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 *
 * 覆盖接口：
 * - GET  /admin/shop/deposits/apply/{applyId}/records   按申请单查保证金流水（不分页）
 * - POST /admin/shop/deposits/apply/{applyId}/records   登记保证金动作（pay/refund/deduct）
 * - GET  /admin/shop/deposits/apply/{applyId}/balance   查余额与缴纳累计
 *   余额接口在 ./shopAudits（终审弹窗共用），这里只做流水与登记。
 *
 * 口径：
 * - 账户主体是「门店申请单」（applyId），门店开通后仍沿用同一账户，
 *   因此后台没有独立保证金账号接口，页面需先从门店申请单拿 applyId；
 * - 动作金额均为正数，后端按动作方向核算余额；
 * - 登记成功后同时失效流水与余额缓存，页面直接回读最新台账。
 */

/** 保证金流水查询键前缀（按申请单分片；登记后据此失效刷新） */
export const STORE_DEPOSIT_RECORDS_QUERY_KEY = ['store-deposit-records'] as const

type ShopDepositsQueryOptions<T> = Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>

/** 按申请单查保证金流水：GET /admin/shop/deposits/apply/{applyId}/records */
export function fetchStoreDepositRecords(applyId: number) {
  return get<StoreDepositVo[]>(`/shop/deposits/apply/${applyId}/records`)
}

/** 保证金流水 hook：applyId 无效时不发请求 */
export function useGetStoreDepositRecords(
  applyId: number | undefined,
  options?: ShopDepositsQueryOptions<StoreDepositVo[]>,
) {
  return useQuery({
    ...options,
    queryKey: [...STORE_DEPOSIT_RECORDS_QUERY_KEY, applyId],
    queryFn: () => fetchStoreDepositRecords(applyId as number),
    enabled: applyId !== undefined && applyId > 0 && (options?.enabled ?? true),
  })
}

/** 登记保证金入参：申请单 id + 登记体 */
export interface RegisterStoreDepositVars {
  applyId: number
  params: StoreDepositRegisterParams
}

/**
 * 登记保证金动作：POST /admin/shop/deposits/apply/{applyId}/records。
 * 后端按 action 核算余额并落台账；失败（如退还超过余额）抛业务错误。
 */
export function useRegisterStoreDeposit(
  options?: UseMutationOptions<StoreDepositVo, ApiError, RegisterStoreDepositVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: ({ applyId, params }) =>
      post<StoreDepositVo>(`/shop/deposits/apply/${applyId}/records`, params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: STORE_DEPOSIT_RECORDS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: STORE_DEPOSIT_BALANCE_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}
