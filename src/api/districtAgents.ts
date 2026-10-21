import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

import { get, post, put } from '../lib/request'
import type { ApiError } from '../lib/request'

/**
 * 区代管理（线上文档 tag「区代管理」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 *
 * 覆盖接口：
 * - GET  /admin/agent/district-agents/pendings           分页查待审区代
 * - GET  /admin/agent/district-agents/active             查某区在任区代
 * - POST /admin/agent/district-agents/applications       建区代待审申请
 * - POST /admin/agent/district-agents/{agentId}/audit    审核（过审/驳回）
 * - POST /admin/agent/district-agents/{agentId}/revoke   撤销在任区代
 * - PUT  /admin/agent/district-agents/{agentId}/attachments 全量覆盖附件（仅待审）
 *
 * 注意：待审列表分页字段是 page/pageSize（与全局 PageParams 的 page/size 不同）。
 */

/** 待审区代列表查询键（审核 / 覆盖附件后据此失效刷新） */
export const DISTRICT_AGENT_PENDINGS_QUERY_KEY = ['district-agent-pendings'] as const

/** 在任区代查询键前缀（按区域维度分片） */
export const DISTRICT_AGENT_ACTIVE_QUERY_KEY = ['district-agent-active'] as const

type DistrictAgentOptions<T> = Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>

/**
 * 待审区代分页列表：GET /admin/agent/district-agents/pendings。
 * 供 ProTable request 直接使用（PageResult 与全局分页结构对齐）。
 */
export function fetchDistrictAgentPendings(params: DistrictAgentPendingQueryParams) {
  return get<PageResult<DistrictAgent>>('/agent/district-agents/pendings', params)
}

/** 待审区代列表查询 hook（区域过滤 + 分页） */
export function useGetDistrictAgentPendings(
  params: DistrictAgentPendingQueryParams,
  options?: DistrictAgentOptions<PageResult<DistrictAgent>>,
) {
  return useQuery({
    ...options,
    queryKey: [...DISTRICT_AGENT_PENDINGS_QUERY_KEY, params],
    queryFn: () => fetchDistrictAgentPendings(params),
  })
}

/** 某区在任区代：GET /admin/agent/district-agents/active?regionId={regionId} */
export function fetchActiveDistrictAgent(regionId: number) {
  return get<DistrictAgent | null>('/agent/district-agents/active', { regionId })
}

/** 某区在任区代查询 hook：regionId 无效时不发请求 */
export function useGetActiveDistrictAgent(
  regionId: number | undefined,
  options?: DistrictAgentOptions<DistrictAgent | null>,
) {
  return useQuery({
    ...options,
    queryKey: [...DISTRICT_AGENT_ACTIVE_QUERY_KEY, regionId],
    queryFn: () => fetchActiveDistrictAgent(regionId as number),
    enabled: regionId !== undefined && regionId > 0 && (options?.enabled ?? true),
  })
}

/** 审核区代入参：区代行 id + 审核体 */
export interface AuditDistrictAgentVars {
  agentId: number
  params: DistrictAgentAuditParams
}

/**
 * 审核区代申请：POST /admin/agent/district-agents/{agentId}/audit。
 * 过审后区代上任；驳回必须带原因。成功后刷新待审列表与在任区代缓存。
 */
export function useAuditDistrictAgent(
  options?: UseMutationOptions<DistrictAgent, ApiError, AuditDistrictAgentVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: ({ agentId, params }) =>
      post<DistrictAgent>(`/agent/district-agents/${agentId}/audit`, params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: DISTRICT_AGENT_PENDINGS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: DISTRICT_AGENT_ACTIVE_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/** 全量覆盖区代附件入参：区代行 id + 附件列表（空数组=清空） */
export interface UpdateDistrictAgentAttachmentsVars {
  agentId: number
  params: DistrictAgentAttachmentsParams
}

/**
 * 全量覆盖区代附件（仅待审）：PUT /admin/agent/district-agents/{agentId}/attachments。
 * 成功后返回最新附件列表，并刷新待审列表缓存。
 */
export function useUpdateDistrictAgentAttachments(
  options?: UseMutationOptions<
    DistrictAgentAttachment[],
    ApiError,
    UpdateDistrictAgentAttachmentsVars
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: ({ agentId, params }) =>
      put<DistrictAgentAttachment[]>(
        `/agent/district-agents/${agentId}/attachments`,
        params,
      ),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: DISTRICT_AGENT_PENDINGS_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/**
 * 撤销在任区代：POST /admin/agent/district-agents/{agentId}/revoke。
 * 成功后刷新待审列表与在任区代缓存。
 */
export function useRevokeDistrictAgent(
  options?: UseMutationOptions<DistrictAgent, ApiError, number>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: (agentId) =>
      post<DistrictAgent>(`/agent/district-agents/${agentId}/revoke`),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: DISTRICT_AGENT_PENDINGS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: DISTRICT_AGENT_ACTIVE_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/**
 * 建区代待审申请：POST /admin/agent/district-agents/applications。
 * 成功后刷新待审列表缓存。
 */
export function useCreateDistrictAgentApplication(
  options?: UseMutationOptions<DistrictAgent, ApiError, DistrictAgentApplicationParams>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: (params) =>
      post<DistrictAgent>('/agent/district-agents/applications', params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: DISTRICT_AGENT_PENDINGS_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}
