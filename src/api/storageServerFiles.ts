import { get, post } from '../lib/request'

/**
 * 服务端直传文件（线上文档 tag「存储服务端直传」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 上传走 multipart/form-data（axios 遇 FormData 自动处理，无需手设 Content-Type）。
 */

/** 服务端直传文件：POST /admin/storage/server-files，zone 为空不传 */
export function uploadServerFile(zone: string | undefined, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return post<ServerUploadResult>('/storage/server-files', formData, { params: { zone } })
}

/** 服务端直传文件读地址：GET /admin/storage/server-files/read-url */
export function fetchServerFileReadUrl(recordId: number, expireSeconds?: number) {
  return get<string>('/storage/server-files/read-url', { recordId, expireSeconds })
}
