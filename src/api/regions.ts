import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

import { download, get, patch, post } from '../lib/request'
import type { ApiError } from '../lib/request'

/**
 * 行政区划管理（线上文档 tag「行政区划管理」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 *
 * 覆盖接口：
 * - GET  /admin/region/children            后台按父码懒加载子级（含街道）
 * - GET  /admin/region/sync-jobs           最近同步任务列表（无分页）
 * - POST /admin/region/sync-jobs           触发行政区划同步
 * - GET  /admin/region/sync-jobs/{id}      同步任务详情
 * - GET  /admin/region/sync-changes        分页查询市辖区变动清单
 * - PATCH /admin/region/sync-changes/{id}  审批市辖区变动
 * - GET  /admin/region/exports/latest      下载最新省市区树 JSON
 *
 * 注意：sync-changes 的分页字段是 page/pageSize（其余模块为 page/size）。
 */

/** 同步任务列表查询键（触发同步 / 审批后据此失效刷新） */
export const REGION_SYNC_JOBS_QUERY_KEY = ['admin-region-sync-jobs'] as const

/** 变动清单查询键 */
export const REGION_SYNC_CHANGES_QUERY_KEY = ['admin-region-sync-changes'] as const

/** 行政区子级查询键（按父码缓存） */
export const REGION_CHILDREN_QUERY_KEY = ['admin-region-children'] as const

/**
 * 行政区子级懒加载：GET /admin/region/children?code={code}。
 * 根码 000000 返回省级，之后逐级按父码往下查，供级联 / 树形懒加载按需取子级。
 */
export function fetchRegionChildren(code: string) {
  return get<RegionChild[]>('/region/children', { code })
}

type RegionChildrenQueryOptions = Omit<UseQueryOptions<RegionChild[]>, 'queryKey' | 'queryFn'>

/** 行政区子级懒加载 hook：code=000000 返回省级 */
export function useGetRegionChildren(code: string, options?: RegionChildrenQueryOptions) {
  return useQuery({
    ...options,
    queryKey: [...REGION_CHILDREN_QUERY_KEY, code],
    queryFn: () => fetchRegionChildren(code),
  })
}

/** 同步任务列表：GET /admin/region/sync-jobs（返回最近任务，无分页） */
export function fetchRegionSyncJobs() {
  return get<RegionSyncJob[]>('/region/sync-jobs')
}

type RegionSyncJobsQueryOptions = Omit<UseQueryOptions<RegionSyncJob[]>, 'queryKey' | 'queryFn'>

/** 同步任务列表查询 hook */
export function useGetRegionSyncJobs(options?: RegionSyncJobsQueryOptions) {
  return useQuery({
    ...options,
    queryKey: REGION_SYNC_JOBS_QUERY_KEY,
    queryFn: () => fetchRegionSyncJobs(),
  })
}

type RegionSyncJobQueryOptions = Omit<UseQueryOptions<RegionSyncJob>, 'queryKey' | 'queryFn'>

/** 同步任务详情：GET /admin/region/sync-jobs/{id} */
export function useGetRegionSyncJob(id: number | undefined, options?: RegionSyncJobQueryOptions) {
  return useQuery({
    ...options,
    queryKey: [...REGION_SYNC_JOBS_QUERY_KEY, id],
    queryFn: () => get<RegionSyncJob>(`/region/sync-jobs/${id}`),
    enabled: id !== undefined && (options?.enabled ?? true),
  })
}

/** 触发同步：POST /admin/region/sync-jobs，成功后自动刷新任务列表 */
export function useTriggerRegionSync(
  options?: UseMutationOptions<RegionSyncJob, ApiError, RegionSyncJobCreateParams>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: (params) => post<RegionSyncJob>('/region/sync-jobs', params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: REGION_SYNC_JOBS_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/**
 * 变动清单分页查询：GET /admin/region/sync-changes。
 * 分页字段为 page / pageSize，状态过滤取值 pending/approved/rejected。
 */
export function fetchRegionSyncChanges(params: RegionSyncChangeQueryParams) {
  return get<PageResult<RegionSyncChange>>('/region/sync-changes', params)
}

/** 审批变动入参：路径 id + 审批体 */
export interface ReviewRegionSyncChangeVars {
  id: number
  params: RegionSyncChangeReviewParams
}

/**
 * 审批市辖区变动：PATCH /admin/region/sync-changes/{id}。
 * 文档响应为 ResultVoid，成功后自动刷新变动清单。
 */
export function useReviewRegionSyncChange(
  options?: UseMutationOptions<void, ApiError, ReviewRegionSyncChangeVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: async ({ id, params }) => {
      await patch<unknown>(`/region/sync-changes/${id}`, params)
    },
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: REGION_SYNC_CHANGES_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/** 下载最新省市区树 JSON：GET /admin/region/exports/latest（返回 binary） */
export function downloadLatestRegionExport() {
  return download('/region/exports/latest')
}
