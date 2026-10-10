import { useMutation } from '@tanstack/react-query'
import type { UseMutationOptions } from '@tanstack/react-query'

import { get, put } from '../lib/request'
import type { ApiError } from '../lib/request'

/**
 * 会员后台查询（线上文档 tag「会员后台查询」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 *
 * 后端分页结果与全局 PageResult{total, page(1 起), size, records} 对齐，
 * 供 ProTable request 直接使用。
 */

/** 会员分页列表，注册时间倒序：GET /admin/members */
export function fetchMembers(params: MemberAdminQueryParams) {
  return get<PageResult<MemberAdmin>>('/members', params)
}

/** 会员详情：GET /admin/members/{id} */
export function fetchMemberDetail(id: number) {
  return get<MemberAdmin>(`/members/${id}`)
}

/** 禁用/解禁会员（禁用即踢在线，重复提交幂等）：PUT /admin/members/{id}/status */
export interface UpdateMemberStatusVars {
  id: number
  status: 0 | 1
}

export function useUpdateMemberStatus(
  options?: UseMutationOptions<void, ApiError, UpdateMemberStatusVars>,
) {
  // 列表页走 ProTable request（无 queryKey 缓存），由调用方手动 reload
  return useMutation({
    mutationFn: async ({ id, status }) => {
      await put<unknown>(`/members/${id}/status`, { status })
    },
    ...options,
  })
}
