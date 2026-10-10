import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

import { del, get, post, put } from '../lib/request'
import type { ApiError } from '../lib/request'

/**
 * 后台菜单管理（线上文档 tag「后台菜单管理」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 *
 * 本模块直接暴露 React Query hooks，调用方无需再手写 queryKey / invalidate：
 * 查询用 useGetXxx，变更用 useCreate/Update/Save/DeleteMenu（成功后自动刷新全量树）。
 */

/** 全量树查询键：增删改成功后按此键失效缓存 */
export const MENUS_QUERY_KEY = ['admin-menus'] as const

/** 当前管理员可见菜单查询键（布局级数据） */
export const MY_MENUS_QUERY_KEY = ['admin-my-menus'] as const

type MenusQueryOptions<T> = Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>

/** 菜单全量树（含隐藏节点）：GET /admin/menus */
export function useGetListMenus(options?: MenusQueryOptions<AdminMenuTreeNode[]>) {
  return useQuery({
    ...options,
    queryKey: MENUS_QUERY_KEY,
    queryFn: () => get<AdminMenuTreeNode[]>('/menus'),
  })
}

/** 当前管理员可见菜单树与权限码集合：GET /admin/menus/mine */
export function useGetMyMenus(options?: MenusQueryOptions<AdminMenuMineResult>) {
  return useQuery({
    // 布局级数据：短时间复用，避免每次切换路由都重新拉菜单
    staleTime: 60_000,
    retry: false,
    ...options,
    queryKey: MY_MENUS_QUERY_KEY,
    queryFn: () => get<AdminMenuMineResult>('/menus/mine'),
  })
}

/** 变更成功后自动刷新全量树的 mutation 底座（内部用，不直接暴露） */
function useInvalidateMenus<TData, TVars>(
  options: UseMutationOptions<TData, ApiError, TVars> | undefined,
  mutationFn: (vars: TVars) => Promise<TData>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn,
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: MENUS_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/** 新建菜单节点：POST /admin/menus */
export function useCreateMenu(
  options?: UseMutationOptions<AdminMenuTreeNode, ApiError, AdminMenuSaveParams>,
) {
  return useInvalidateMenus(options, (params) => post<AdminMenuTreeNode>('/menus', params))
}

/** 编辑菜单节点：PUT /admin/menus/{id} */
export interface UpdateMenuVars {
  id: number
  params: AdminMenuSaveParams
}

export function useUpdateMenu(
  options?: UseMutationOptions<AdminMenuTreeNode, ApiError, UpdateMenuVars>,
) {
  return useInvalidateMenus(options, ({ id, params }) =>
    put<AdminMenuTreeNode>(`/menus/${id}`, params),
  )
}

/** 新建 / 编辑二合一：id 缺省走新建，否则走编辑（菜单页 Modal 提交用） */
export interface SaveMenuVars {
  id?: number
  params: AdminMenuSaveParams
}

export function useSaveMenu(
  options?: UseMutationOptions<AdminMenuTreeNode, ApiError, SaveMenuVars>,
) {
  return useInvalidateMenus(options, ({ id, params }) =>
    id === undefined
      ? post<AdminMenuTreeNode>('/menus', params)
      : put<AdminMenuTreeNode>(`/menus/${id}`, params),
  )
}

/**
 * 删除菜单节点（仅叶子）：DELETE /admin/menus/{id}。
 * 文档响应为 ResultVoid（data 为空对象），这里按 void 处理，调用方无需关心返回值。
 */
export function useDeleteMenu(options?: UseMutationOptions<void, ApiError, number>) {
  return useInvalidateMenus(options, async (id) => {
    await del<unknown>(`/menus/${id}`)
  })
}
