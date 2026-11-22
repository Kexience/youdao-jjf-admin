import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

import { get, put } from '../lib/request'
import type { ApiError } from '../lib/request'

/**
 * 设置项（线上文档 tag「设置项」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 接口为登记项驱动：只提供列表 / 单查 / 写入，没有新增与删除；
 * 写入需携带预期版本号做乐观并发控制（首次写入不传）。
 *
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 */

export const SYS_OPTIONS_QUERY_KEY = ['admin-options'] as const

type SysOptionsQueryOptions = Omit<UseQueryOptions<SysOption>, 'queryKey' | 'queryFn'>

/** 设置项分页列表：GET /admin/options（可按 scope 过滤） */
export function fetchSysOptions(params: SysOptionQueryParams) {
  return get<PageResult<SysOption>>('/options', params)
}

/** 单个设置项：GET /admin/options/{scope}/{optionKey} */
export function useGetSysOption(
  scope: string | undefined,
  optionKey: string | undefined,
  options?: SysOptionsQueryOptions,
) {
  return useQuery({
    ...options,
    queryKey: [...SYS_OPTIONS_QUERY_KEY, scope, optionKey],
    queryFn: () =>
      get<SysOption>(
        `/options/${encodeURIComponent(scope!)}/${encodeURIComponent(optionKey!)}`,
      ),
    enabled: (options?.enabled ?? true) && !!scope && !!optionKey,
  })
}

/** 写入设置项入参：路径 scope / optionKey + 保存体 */
export interface SaveSysOptionVars {
  scope: string
  optionKey: string
  params: SysOptionSaveParams
}

/** 写入设置项：PUT /admin/options/{scope}/{optionKey}，成功后刷新列表与详情缓存 */
export function useSaveSysOption(
  options?: UseMutationOptions<SysOption, ApiError, SaveSysOptionVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: ({ scope, optionKey, params }) =>
      put<SysOption>(
        `/options/${encodeURIComponent(scope)}/${encodeURIComponent(optionKey)}`,
        params,
      ),
    ...rest,
    onSuccess: (...args) => {
      // 前缀失效会一并刷新所有单查缓存，保证下次打开拿到新版本号
      void queryClient.invalidateQueries({ queryKey: SYS_OPTIONS_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}
