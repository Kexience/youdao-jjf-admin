import { get } from '../lib/request'

/**
 * 短信发送记录（线上文档 tag「短信发送记录」，只读）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 *
 * 后端分页结果与全局 PageResult{total, page(1 起), size, records} 对齐，
 * 供 ProTable request 直接使用。
 */

/** 发送记录分页查询：GET /admin/sms/records */
export function fetchSmsRecords(params: SmsSendRecordQueryParams) {
  return get<PageResult<SmsSendRecord>>('/sms/records', params)
}
