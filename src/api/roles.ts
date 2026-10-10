import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

import { get, post, put } from '../lib/request'
import type { ApiError } from '../lib/request'

/**
 * 后台角色（线上文档 tag「后台角色管理」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 *
 * 本模块直接暴露 React Query hooks，调用方无需再手写 queryKey / invalidate。
 */

export const ROLES_QUERY_KEY = ['admin-roles'] as const

type RolesQueryOptions = Omit<UseQueryOptions<AdminRole[]>, 'queryKey' | 'queryFn'>

/** 角色列表，含内置与停用角色：GET /admin/roles */
export function useGetRoles(options?: RolesQueryOptions) {
  return useQuery({
    ...options,
    queryKey: ROLES_QUERY_KEY,
    queryFn: () => get<AdminRole[]>('/roles'),
  })
}

/** 新建角色：POST /admin/roles，成功后自动刷新列表 */
export function useCreateRole(options?: UseMutationOptions<AdminRole, ApiError, AdminRoleSaveParams>) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: (params) => post<AdminRole>('/roles', params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/** 角色详情，含已授予权限码：GET /admin/roles/{id} */
export function useGetRoleDetail(
  id: number,
  options?: Omit<UseQueryOptions<AdminRoleDetail>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    ...options,
    queryKey: [...ROLES_QUERY_KEY, id],
    queryFn: () => get<AdminRoleDetail>(`/roles/${id}`),
  })
}

/** 修改角色入参：路径 id + 保存体（改名/启停） */
export interface UpdateRoleVars {
  id: number
  params: AdminRoleSaveParams
}

/**
 * 编辑角色（改名/启停）：PUT /admin/roles/{id}，成功后自动刷新列表与详情
 *（详情 queryKey 以 ROLES_QUERY_KEY 为前缀，一并失效）。
 */
export function useUpdateRole(options?: UseMutationOptions<AdminRole, ApiError, UpdateRoleVars>) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: ({ id, params }) => put<AdminRole>(`/roles/${id}`, params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/** 编辑角色授权入参：路径 id + 权限码集合（整体重写） */
export interface GrantRolePermissionsVars {
  id: number
  params: AdminRoleGrantParams
}

/**
 * 编辑角色授权：PUT /admin/roles/{id}/permissions，整体重写，
 * 空数组=清空授权。文档响应为 ResultVoid（data 为空对象），这里按 void 处理。
 * 成功后自动刷新详情（permissionCodes 展示用）。
 */
export function useGrantRolePermissions(
  options?: UseMutationOptions<void, ApiError, GrantRolePermissionsVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: async ({ id, params }) => {
      await put<unknown>(`/roles/${id}/permissions`, params)
    },
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}
