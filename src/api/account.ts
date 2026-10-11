import { useMutation, useQuery } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

import type { ApiError } from '../lib/request'
import { get, put } from '../lib/request'

/**
 * 个人中心接口（线上文档 tag「后台管理员账号管理」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * - GET /admin/users/me：获取自己的信息
 * - PUT /admin/users/{id}：编辑资料（复用 adminUsers 的 mutation，id 取 me.id）
 * - PUT /admin/users/me/password：自助改密（验旧口令）
 *
 * 路径写法与其它 api 一致：VITE_API_PROXY_TARGET 已含 /admin 前缀，
 * 这里只写 /admin 之后的路径。
 */

/** 获取自己的信息：GET /admin/users/me */
export function fetchMyProfile() {
  return get<AdminUser>('/users/me')
}

/** 当前登录管理员画像 query，个人中心与顶栏头像共用同一 key */
export function useMyProfile(options?: Omit<UseQueryOptions<AdminUser, ApiError>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: ['admin-my-profile'],
    queryFn: fetchMyProfile,
    ...options,
  })
}

/**
 * 自助改密：PUT /admin/users/me/password。
 * 文档响应为 ResultVoid（data 为空对象），这里按 void 处理。
 */
export function useChangeMyPassword(
  options?: UseMutationOptions<void, ApiError, AdminUserSelfPasswordParams>,
) {
  return useMutation({
    mutationFn: async (params) => {
      await put<unknown>('/users/me/password', params)
    },
    ...options,
  })
}
