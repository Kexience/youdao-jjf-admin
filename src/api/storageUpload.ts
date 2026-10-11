import { ApiError, get, post } from '../lib/request'

/**
 * 前端直传 OSS（线上文档 tag「文件存储（后台端）」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 流程：申请上传凭证 → 文件 POST 到凭证 host → 确认上传完成 → 拿 viewUrl。
 * 管理员身份走 /admin/storage/uploads/**（与公共端同 DTO/Vo），
 * 直接用共享 request 实例（baseURL 已含 /admin 前缀），token 自动携带。
 */

/** 头像 zone：管理员可写，签名读（后端约定） */
export const AVATAR_ZONE = 'admin-avatar/'

/** 申请上传凭证：POST /admin/storage/uploads/requests（后台管理员身份） */
export function requestUploadCredential(params: StorageUploadCredentialParams) {
  return post<StorageUploadCredential>('/storage/uploads/requests', params)
}

/** 确认上传完成：POST /admin/storage/uploads/confirms */
export function confirmUpload(params: StorageUploadConfirmParams) {
  return post<StorageUploadConfirmResult>('/storage/uploads/confirms', params)
}

/** 获取文件访问地址：GET /admin/storage/uploads/view-url（签名读 zone 用它换新鲜地址） */
export function fetchUploadViewUrl(recordId: number, processStyle?: string) {
  return get<string>('/storage/uploads/view-url', { recordId, processStyle })
}

/** 文件 SHA-256 hex（64 位小写，凭证接口的 hash 字段要求） */
export async function sha256Hex(file: File): Promise<string> {
  if (!crypto.subtle) {
    throw new ApiError('当前环境不支持计算文件指纹，请用 HTTPS 或 localhost 访问后重试', -1)
  }
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * 从 policy 中解析 V4 签名版本（如 OSS4-HMAC-SHA256）。
 * OSS 侧按该字段决定走 V1 还是 V4 验签，policy 里有这条条件，
 * 表单就必须带同名字段，否则 OSS 按 V1 验签必报 SignatureDoesNotMatch。
 */
function ossSignatureVersion(policy: string): string {
  try {
    const decoded = JSON.parse(atob(policy)) as { conditions?: unknown[] }
    const cond = decoded.conditions?.find(
      (c): c is Record<string, string> =>
        typeof c === 'object' && c !== null && !Array.isArray(c) && 'x-oss-signature-version' in c,
    )
    const version = cond?.['x-oss-signature-version']
    if (typeof version === 'string' && version) return version
  } catch {
    // policy 解析失败就用默认值，不中断上传
  }
  return 'OSS4-HMAC-SHA256'
}

/**
 * 按凭证把文件 POST 到 OSS host，返回 ETag（拿不到可空，confirm 不强制）。
 * V4（带 credential）与 V1 只发各自版本的字段，不混发：
 * 混发且缺 x-oss-signature-version 时 OSS 会按 V1 验签导致签名不匹配。
 */
async function postFileToOss(
  cred: StorageUploadCredential,
  file: File,
): Promise<string | undefined> {
  if (!cred.host || !cred.policy || !cred.objectKey) {
    throw new ApiError('上传凭证不完整，请重试', -1)
  }
  const form = new FormData()
  form.append('key', cred.objectKey)
  form.append('policy', cred.policy)
  if (cred.credential) {
    form.append('x-oss-credential', cred.credential)
    if (cred.dateTime) form.append('x-oss-date', cred.dateTime)
    if (cred.signature) form.append('x-oss-signature', cred.signature)
    form.append('x-oss-signature-version', ossSignatureVersion(cred.policy))
  } else {
    if (cred.accessKeyId) form.append('OSSAccessKeyId', cred.accessKeyId)
    if (cred.signature) form.append('signature', cred.signature)
  }
  if (cred.callback) form.append('callback', cred.callback)
  form.append('success_action_status', '200')
  form.append('file', file)

  let resp: Response
  try {
    resp = await fetch(cred.host, { method: 'POST', body: form })
  } catch {
    throw new ApiError('文件直传失败，请检查网络后重试', -1)
  }
  if (!resp.ok) {
    throw new ApiError(`文件直传失败（${resp.status}），请重试`, resp.status)
  }
  const etag = resp.headers.get('etag') ?? undefined
  return etag?.replace(/^W\//, '').replace(/"/g, '')
}

/**
 * 图片直传结果：key 落库（后端读时按 key 解析可读地址），
 * viewUrl 只做即时预览（签名读 zone 会过期，不落库）。
 */
export interface UploadedImage {
  /** 对象 key，落库用 */
  key: string
  /** 刚确认的可读地址，即时预览用 */
  viewUrl: string
}

/**
 * 图片直传一条龙：校验图片 → 指纹 → 申请凭证 →（秒传命中直接用 / 否则 POST 到 OSS）
 * → 确认上传 → 返回 key 与可读地址。
 */
export async function uploadImageViaCredential(file: File, zone: string): Promise<UploadedImage> {
  if (!file.type.startsWith('image/')) {
    throw new ApiError('请选择图片文件（JPG / PNG 等）', -1)
  }
  if (file.size <= 0) {
    throw new ApiError('文件为空，请重新选择', -1)
  }
  const hash = await sha256Hex(file)
  const cred = await requestUploadCredential({
    zone,
    hash,
    size: file.size,
    contentType: file.type || undefined,
    originalName: file.name || undefined,
  })
  if (!cred.objectKey) {
    throw new ApiError('上传凭证缺对象 key，请重试', -1)
  }
  // 秒传命中：文件已在，直接用凭证里的可读地址
  if (cred.dedup && cred.viewUrl) return { key: cred.objectKey, viewUrl: cred.viewUrl }

  const etag = await postFileToOss(cred, file)
  const confirmed = await confirmUpload({
    recordId: cred.recordId,
    objectKey: cred.objectKey,
    size: file.size,
    etag,
  })
  const url = confirmed.viewUrl || cred.viewUrl || (await fetchUploadViewUrl(cred.recordId))
  if (!url) {
    throw new ApiError('上传确认成功但未返回访问地址，请重试', -1)
  }
  return { key: cred.objectKey, viewUrl: url }
}
