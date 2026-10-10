import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'

import { get } from '../lib/request'

/**
 * 会员等级定义（线上文档 tag「会员等级定义」，列表只读部分）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 注意单复数：等级接口是 /admin/member/levels（单数 member），
 * 会员查询接口是 /admin/members（复数 members），不要混淆。
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 */

/** 会员等级查询键：会员列表页等级筛选项用 */
export const MEMBER_LEVELS_QUERY_KEY = ['member-levels'] as const

type MemberLevelsQueryOptions<T> = Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>

/** 等级列表，含停用与每档会员计数：GET /admin/member/levels */
export function fetchMemberLevels() {
  return get<MemberLevel[]>('/member/levels')
}

/** 等级列表（筛选项/展示用，短时间复用）：GET /admin/member/levels */
export function useGetMemberLevels(options?: MemberLevelsQueryOptions<MemberLevel[]>) {
  return useQuery({
    // 基础数据：短时间复用，避免每次渲染都重新拉取
    staleTime: 60_000,
    ...options,
    queryKey: MEMBER_LEVELS_QUERY_KEY,
    queryFn: fetchMemberLevels,
  })
}
