import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

import { get, post, put } from '../lib/request'
import type { ApiError } from '../lib/request'

/**
 * 会员等级（线上文档 tag「会员等级定义」+「会员等级调整」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 注意单复数：等级接口是 /admin/member/levels（单数 member），
 * 会员查询接口是 /admin/members（复数 members），不要混淆。
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 *
 * 本模块直接暴露 React Query hooks，调用方无需再手写 queryKey / invalidate：
 * 等级定义的增改会同步刷新等级列表；调整会员等级还会刷新会员详情。
 */

/** 会员等级查询键：等级管理页、会员列表页等级筛选项共用 */
export const MEMBER_LEVELS_QUERY_KEY = ['member-levels'] as const

/** 会员等级调整历史查询键前缀（按会员维度分片） */
export const MEMBER_LEVEL_HISTORY_QUERY_KEY = ['member-level-history'] as const

type MemberLevelsQueryOptions<T> = Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>

/** 等级列表，含停用与每档会员计数：GET /admin/member/levels */
export function fetchMemberLevels() {
  return get<MemberLevel[]>('/member/levels')
}

/** 等级列表（等级管理页 / 筛选项/展示用，短时间复用）：GET /admin/member/levels */
export function useGetMemberLevels(options?: MemberLevelsQueryOptions<MemberLevel[]>) {
  return useQuery({
    // 基础数据：短时间复用，避免每次渲染都重新拉取
    staleTime: 60_000,
    ...options,
    queryKey: MEMBER_LEVELS_QUERY_KEY,
    queryFn: fetchMemberLevels,
  })
}

/** 新建等级：POST /admin/member/levels，成功后自动刷新等级列表 */
export function useCreateMemberLevel(
  options?: UseMutationOptions<MemberLevel, ApiError, MemberLevelCreateParams>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: (params) => post<MemberLevel>('/member/levels', params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: MEMBER_LEVELS_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/** 编辑等级入参：路径 id + 编辑体（空字段=保留原值） */
export interface UpdateMemberLevelVars {
  id: number
  params: MemberLevelUpdateParams
}

/** 编辑等级：PUT /admin/member/levels/{id}，成功后自动刷新等级列表 */
export function useUpdateMemberLevel(
  options?: UseMutationOptions<MemberLevel, ApiError, UpdateMemberLevelVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: ({ id, params }) => put<MemberLevel>(`/member/levels/${id}`, params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: MEMBER_LEVELS_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/** 调整会员等级入参：目标会员 + 调整体（重复提交同等级后端幂等返回） */
export interface AssignMemberLevelVars {
  memberId: number
  params: MemberLevelAssignParams
}

/**
 * 调整会员等级：PUT /admin/member/{memberId}/level。
 * 成功后会改变「归属该档的会员数」，因此同步刷新等级列表与会员详情；
 * 会员列表走 ProTable request（无 queryKey 缓存），由调用方手动 reload。
 */
export function useAssignMemberLevel(
  options?: UseMutationOptions<void, ApiError, AssignMemberLevelVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: async ({ memberId, params }) => {
      await put<unknown>(`/member/${memberId}/level`, params)
    },
    ...rest,
    onSuccess: (...args) => {
      const [, variables] = args
      void queryClient.invalidateQueries({ queryKey: MEMBER_LEVELS_QUERY_KEY })
      void queryClient.invalidateQueries({
        queryKey: ['member-detail', variables.memberId],
      })
      void queryClient.invalidateQueries({
        queryKey: [...MEMBER_LEVEL_HISTORY_QUERY_KEY, variables.memberId],
      })
      onSuccess?.(...args)
    },
  })
}

/** 会员等级调整历史入参（分页，1 起） */
export interface MemberLevelHistoryParams extends PageParams {
  memberId: number
}

/** 会员等级调整历史（调整时间倒序）：GET /admin/member/{memberId}/level-history */
export function fetchMemberLevelHistory({
  memberId,
  page,
  size,
}: MemberLevelHistoryParams) {
  return get<PageResult<MemberLevelChangeLog>>(`/member/${memberId}/level-history`, {
    page,
    size,
  })
}

/** 会员等级调整历史查询：与调整 mutation 共用 queryKey 前缀，调整后自动失效 */
export function useGetMemberLevelHistory(
  memberId: number,
  params: PageParams,
  options?: MemberLevelsQueryOptions<PageResult<MemberLevelChangeLog>>,
) {
  return useQuery({
    ...options,
    queryKey: [...MEMBER_LEVEL_HISTORY_QUERY_KEY, memberId, params.page, params.size],
    queryFn: () => fetchMemberLevelHistory({ memberId, ...params }),
  })
}
