import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query'

import { del, get, post, put } from '../lib/request'
import type { ApiError } from '../lib/request'

/**
 * 短信模板（线上文档 tag「短信模板」，场景×厂商）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 *
 * 本模块直接暴露 React Query hooks，调用方无需再手写 queryKey / invalidate。
 */

export const SMS_TEMPLATES_QUERY_KEY = ['admin-sms-templates'] as const

type SmsTemplatesQueryOptions = Omit<UseQueryOptions<SmsTemplate[]>, 'queryKey' | 'queryFn'>

/**
 * 模板列表：GET /admin/sms/templates。
 * 文档 scene 必填但描述空=全部场景，不传按空字符串查询全部。
 */
export function useGetSmsTemplates(scene?: string, options?: SmsTemplatesQueryOptions) {
  return useQuery({
    ...options,
    queryKey: [...SMS_TEMPLATES_QUERY_KEY, scene ?? ''],
    queryFn: () => get<SmsTemplate[]>('/sms/templates', { scene: scene ?? '' }),
  })
}

/** 新增模板：POST /admin/sms/templates，成功后自动刷新列表 */
export function useCreateSmsTemplate(
  options?: UseMutationOptions<SmsTemplate, ApiError, SmsTemplateSaveParams>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: (params) => post<SmsTemplate>('/sms/templates', params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: SMS_TEMPLATES_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/** 修改模板入参：路径 id + 保存体 */
export interface UpdateSmsTemplateVars {
  id: number
  params: SmsTemplateSaveParams
}

/** 修改模板：PUT /admin/sms/templates/{id}，成功后自动刷新列表 */
export function useUpdateSmsTemplate(
  options?: UseMutationOptions<SmsTemplate, ApiError, UpdateSmsTemplateVars>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: ({ id, params }) => put<SmsTemplate>(`/sms/templates/${id}`, params),
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: SMS_TEMPLATES_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}

/**
 * 删除模板：DELETE /admin/sms/templates/{id}。
 * 文档响应为 ResultVoid（data 为空对象），这里按 void 处理。
 */
export function useDeleteSmsTemplate(options?: UseMutationOptions<void, ApiError, number>) {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options ?? {}
  return useMutation({
    mutationFn: async (id) => {
      await del<unknown>(`/sms/templates/${id}`)
    },
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: SMS_TEMPLATES_QUERY_KEY })
      onSuccess?.(...args)
    },
  })
}
