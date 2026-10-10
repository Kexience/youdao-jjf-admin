import { useMutation } from '@tanstack/react-query'
import type { UseMutationOptions } from '@tanstack/react-query'

import { del, get } from '../lib/request'
import type { ApiError } from '../lib/request'

/**
 * 存储上传记录（线上文档 tag「存储上传记录」，列表只读 + 逻辑删除）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 后端分页结果与全局 PageResult{total, page(1 起), size, records} 对齐，
 * 供 ProTable request 直接使用。
 */

/** 上传记录分页检索：GET /admin/storage/records */
export function fetchStorageRecords(params: StorageUploadRecordQueryParams) {
  return get<PageResult<StorageUploadRecord>>('/storage/records', params)
}

/**
 * 逻辑删除上传记录：DELETE /admin/storage/records/{id}。
 * 文档响应为 ResultVoid（data 为空对象），这里按 void 处理。
 */
export function useDeleteStorageRecord(options?: UseMutationOptions<void, ApiError, number>) {
  // records 页走 ProTable request（无 queryKey 缓存），由调用方手动 reload
  return useMutation({
    mutationFn: async (id) => {
      await del<unknown>(`/storage/records/${id}`)
    },
    ...options,
  })
}
