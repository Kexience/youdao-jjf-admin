import { useMutation } from '@tanstack/react-query'
import type { UseMutationOptions } from '@tanstack/react-query'

import { get, put } from '../lib/request'
import type { ApiError } from '../lib/request'

/**
 * 后台管理员账号分页（线上文档 tag「后台管理员账号管理」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 *
 * 后端分页结果与全局 PageResult{total, page(1 起), size, records} 对齐，
 * 供 ProTable request 直接使用。
 */

/** 管理员分页列表，创建时间倒序：GET /admin/users */
export function fetchAdminUsers(params: AdminUserQueryParams) {
  return get<PageResult<AdminUser>>('/users', params)
}

/** 管理员详情：GET /admin/users/{id} */
export function fetchAdminUserDetail(id: number) {
  return get<AdminUser>(`/users/${id}`)
}

/** 编辑管理员资料入参：路径 id + 资料体（不动用户名/密码/状态/角色） */
export interface UpdateAdminUserVars {
  id: number
  params: AdminUserUpdateParams
}

/** 编辑管理员资料：PUT /admin/users/{id}，成功后由调用方手动 refetch 详情 */
export function useUpdateAdminUser(
  options?: UseMutationOptions<AdminUser, ApiError, UpdateAdminUserVars>,
) {
  return useMutation({
    mutationFn: ({ id, params }) => put<AdminUser>(`/users/${id}`, params),
    ...options,
  })
}

/** 启停管理员入参：路径 id + 目标状态（不许停自己/超管，后端拦截） */
export interface UpdateAdminUserStatusVars {
  id: number
  status: 0 | 1
}

/** 启停管理员：PUT /admin/users/{id}/status，成功后由调用方手动 reload/refetch */
export function useUpdateAdminUserStatus(
  options?: UseMutationOptions<void, ApiError, UpdateAdminUserStatusVars>,
) {
  // 列表页走 ProTable request（无 queryKey 缓存），详情页手动 refetch，均由调用方负责刷新
  return useMutation({
    mutationFn: async ({ id, status }) => {
      await put<unknown>(`/users/${id}/status`, { status })
    },
    ...options,
  })
}

/** 重置他人密码入参：路径 id + 新口令（不许重置自己/超管，后端拦截） */
export interface ResetAdminUserPasswordVars {
  id: number
  params: {
    newPassword: string
  }
}

/**
 * 重置他人密码：PUT /admin/users/{id}/password。
 * 文档响应为 ResultVoid（data 为空对象），这里按 void 处理。
 * 口令变更不影响列表/详情展示，调用方无需刷新。
 */
export function useResetAdminUserPassword(
  options?: UseMutationOptions<void, ApiError, ResetAdminUserPasswordVars>,
) {
  return useMutation({
    mutationFn: async ({ id, params }) => {
      await put<unknown>(`/users/${id}/password`, params)
    },
    ...options,
  })
}
