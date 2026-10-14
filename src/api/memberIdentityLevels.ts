import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

import { get, post, put } from '../lib/request'
import type { ApiError } from '../lib/request'

/**
 * 会员身份档位（线上文档 tag「会员身份档位定义」+「会员身份档位调整」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 注意单复数：档位接口是 /admin/member/identity-levels（单数 member），
 * 会员查询接口是 /admin/members（复数 members），不要混淆。
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 *
 * 本模块直接暴露 React Query hooks，调用方无需再手写 queryKey / invalidate：
 * 档位定义的增改会同步刷新档位列表；调整会员身份档位还会刷新会员详情。
 */

/** 身份档位查询键：档位管理页、会员列表页筛选项共用 */
export const MEMBER_IDENTITY_LEVELS_QUERY_KEY = ['member-identity-levels'] as const

/** 会员身份档位调整历史查询键前缀（按会员维度分片） */
export const MEMBER_IDENTITY_LEVEL_HISTORY_QUERY_KEY = [
  'member-identity-level-history',
] as const

type MemberIdentityLevelsQueryOptions<T> = Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>

/** 身份档位列表，含停用与每档会员计数：GET /admin/member/identity-levels */
export function fetchMemberIdentityLevels() {
  return get<MemberIdentityLevel[]>('/member/identity-levels')
}

/** 身份档位列表（档位管理页 / 筛选项/展示用，短时间复用）：GET /admin/member/identity-levels */
export function useGetMemberIdentityLevels(
  options?: MemberIdentityLevelsQueryOptions<MemberIdentityLevel[]>,
) {
  return useQuery({
    // 基础数据：短时间复用，避免每次渲染都重新拉取
    staleTime: 60_000,
    ...options,
    queryKey: MEMBER_IDENTITY_LEVELS_QUERY_KEY,
    queryFn: fetchMemberIdentityLevels,
  })
}

/**
 * 新建身份档位：POST /admin/member/identity-levels，成功后自动刷新档位列表。
 * 入参可能嵌套 upgrade 升级配置组（MemberIdentityLevelUpgradeConfigParams，缺省=仅后台手动），
 * 编辑时该组「空=保持原值、非空整体替换」。
 */
export function useCreateMemberIdentityLevel(
  options?: UseMutationOptions<
    MemberIdentityLevel,
    ApiError,
    MemberIdentityLevelCreateParams
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: (params) => post<MemberIdentityLevel>('/member/identity-levels', params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: MEMBER_IDENTITY_LEVELS_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/** 编辑身份档位入参：路径 id + 编辑体（空字段=保留原值） */
export interface UpdateMemberIdentityLevelVars {
  id: number
  params: MemberIdentityLevelUpdateParams
}

/** 编辑身份档位：PUT /admin/member/identity-levels/{id}，成功后自动刷新档位列表 */
export function useUpdateMemberIdentityLevel(
  options?: UseMutationOptions<
    MemberIdentityLevel,
    ApiError,
    UpdateMemberIdentityLevelVars
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: ({ id, params }) =>
      put<MemberIdentityLevel>(`/member/identity-levels/${id}`, params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: MEMBER_IDENTITY_LEVELS_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/** 调整会员身份档位入参：目标会员 + 调整体（重复提交同档位后端幂等返回） */
export interface AssignMemberIdentityLevelVars {
  memberId: number
  params: MemberIdentityLevelAssignParams
}

/**
 * 调整会员身份档位：PUT /admin/member/{memberId}/identity-level。
 * 成功后会改变「归属该档的会员数」，因此同步刷新档位列表与会员详情；
 * 会员列表走 ProTable request（无 queryKey 缓存），由调用方手动 reload。
 */
export function useAssignMemberIdentityLevel(
  options?: UseMutationOptions<void, ApiError, AssignMemberIdentityLevelVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: async ({ memberId, params }) => {
      await put<unknown>(`/member/${memberId}/identity-level`, params)
    },
    ...rest,
    onSuccess: (...args) => {
      const [, variables] = args
      void queryClient.invalidateQueries({ queryKey: MEMBER_IDENTITY_LEVELS_QUERY_KEY })
      void queryClient.invalidateQueries({
        queryKey: ['member-detail', variables.memberId],
      })
      void queryClient.invalidateQueries({
        queryKey: [...MEMBER_IDENTITY_LEVEL_HISTORY_QUERY_KEY, variables.memberId],
      })
      onSuccess?.(...args)
    },
  })
}

/** 会员身份档位调整历史入参（分页，1 起） */
export interface MemberIdentityLevelHistoryParams extends PageParams {
  memberId: number
}

/** 会员身份档位调整历史（调整时间倒序）：GET /admin/member/{memberId}/identity-level-history */
export function fetchMemberIdentityLevelHistory({
  memberId,
  page,
  size,
}: MemberIdentityLevelHistoryParams) {
  return get<PageResult<MemberIdentityLevelChangeLog>>(
    `/member/${memberId}/identity-level-history`,
    { page, size },
  )
}

/** 会员身份档位调整历史查询：与调整 mutation 共用 queryKey 前缀，调整后自动失效 */
export function useGetMemberIdentityLevelHistory(
  memberId: number,
  params: PageParams,
  options?: MemberIdentityLevelsQueryOptions<PageResult<MemberIdentityLevelChangeLog>>,
) {
  return useQuery({
    ...options,
    queryKey: [
      ...MEMBER_IDENTITY_LEVEL_HISTORY_QUERY_KEY,
      memberId,
      params.page,
      params.size,
    ],
    queryFn: () => fetchMemberIdentityLevelHistory({ memberId, ...params }),
  })
}
