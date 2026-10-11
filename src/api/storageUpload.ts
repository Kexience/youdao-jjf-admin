import { ApiError, post } from '../lib/request'

/**
 * 前端直传 OSS（线上文档 tag「文件存储（公共端）」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 流程：申请上传凭证 → 文件 POST 到凭证 host → 确认上传完成 → 拿 viewUrl。
 * 注意公共端点不在 /admin 下，共享 axios 实例的 baseURL（/api → …/admin）
 * 到不了这里，所以用绝对地址调 post（axios 遇绝对 URL 会忽略 baseURL，
 * 拦截器里的 token 携带与信封拆包保持不变，管理员登录态下 uploader 走 ADMIN）。
 */

/** 头像 zone：管理员可写，签名读（后端约定） */
export const AVATAR_ZONE = 'admin-avatar/'

/** 公共端基址：换环境只改 .env 的 VITE_PUBLIC_API_BASE_URL */
function resolvePublicBase(): string {
  const direct = import.meta.env.VITE_PUBLIC_API_BASE_URL
  if (typeof direct === 'string' && direct.length > 0) return direct.replace(/\/+$/, '')
  // 兜底：从代理目标去掉 /admin 后缀（开发环境 .env 的 PROXY 是 …/admin）
  const proxyTarget = import.meta.env.VITE_API_PROXY_TARGET
  if (typeof proxyTarget === 'string' && proxyTarget.length > 0) {
    return proxyTarget.replace(/\/+$/, '').replace(/\/admin$/, '')
  }
  return ''
}

function publicUrl(path: string): string {
  const base = resolvePublicBase()
  return base ? `${base}${path}` : path
}

/** 申请上传凭证：POST /api/v1/storage/upload-requests（需登录态，匿名调会 500） */
export function requestUploadCredential(params: StorageUploadCredentialParams) {
  return post<StorageUploadCredential>(publicUrl('/api/v1/storage/upload-requests'), params)
}

/** 确认上传完成：POST /api/v1/storage/upload-confirms */
export function confirmUpload(params: StorageUploadConfirmParams) {
  return post<StorageUploadConfirmResult>(publicUrl('/api/v1/storage/upload-confirms'), params)
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
 * 按凭证把文件 POST 到 OSS host，返回 ETag（拿不到可空，confirm 不强制）。
 * 凭证同时带 V1（accessKeyId）与 V4（credential/dateTime）字段，
 * 后端按哪种验签取决于 OSS 配置，这里两套字段都带上，
 * policy 只约束它声明的条件，多余字段会被忽略，不影响验签。
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
  if (cred.accessKeyId) {
    form.append('OSSAccessKeyId', cred.accessKeyId)
    if (cred.signature) form.append('signature', cred.signature)
  }
  if (cred.credential) form.append('x-oss-credential', cred.credential)
  if (cred.dateTime) form.append('x-oss-date', cred.dateTime)
  if (cred.signature) form.append('x-oss-signature', cred.signature)
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
 * 图片直传一条龙：校验图片 → 指纹 → 申请凭证 →（秒传命中直接用 / 否则 POST 到 OSS）
 * → 确认上传 → 返回可读地址。
 * 注意 admin-avatar/ 是签名读，返回的 URL 有有效期，过期后需重新上传。
 */
export async function uploadImageViaCredential(file: File, zone: string): Promise<string> {
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
  // 秒传命中：文件已在，直接用凭证里的可读地址
  if (cred.dedup && cred.viewUrl) return cred.viewUrl

  const etag = await postFileToOss(cred, file)
  if (!cred.objectKey) {
    throw new ApiError('上传凭证缺对象 key，请重试', -1)
  }
  const confirmed = await confirmUpload({
    recordId: cred.recordId,
    objectKey: cred.objectKey,
    size: file.size,
    etag,
  })
  const url = confirmed.viewUrl || cred.viewUrl
  if (!url) {
    throw new ApiError('上传确认成功但未返回访问地址，请重试', -1)
  }
  return url
}
