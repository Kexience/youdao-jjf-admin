import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'

/**
 * 后端统一信封见全局类型 ApiResult（src/types/global.d.ts）：
 * 线上文档（https://dev-1.ydndd.com/v3/api-docs）全接口均为
 * `ResultXxx{code, message, data}`，全局鉴权为 bearerAuth JWT。
 */

// 成功码：文档未明确成功码取值，按常见约定兼容 0 / 200，联调时以实际为准
const SUCCESS_CODES = new Set([0, 200])

/** 业务 / 网络错误统一类型 */
export class ApiError extends Error {
  /** 后端信封 code（网络异常时为 -1） */
  code: number
  /** HTTP 状态码（网络异常时缺省） */
  httpStatus?: number

  constructor(message: string, code: number, httpStatus?: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.httpStatus = httpStatus
  }
}

const TOKEN_KEY = 'jjf-admin-token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // 忽略（如隐私模式）：仅本次会话生效
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // 忽略
  }
}

function resolveBaseURL(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL
  if (typeof fromEnv === 'string' && fromEnv.length > 0) return fromEnv
  // 文档 servers 写的是 http，页面多为 https，默认用 https 避免混合内容被拦截
  return 'https://dev-1.ydndd.com'
}

/** 全局 axios 实例：业务代码请用下面的 get/post/put/patch/del，不要直接用它 */
export const request = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 15000,
})

request.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

request.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResult<unknown>>) => {
    // 无 response：超时 / 断网 / 被取消
    if (!error.response) {
      throw new ApiError('网络异常，请检查网络后重试', -1)
    }
    const status = error.response.status
    if (status === 401) {
      clearToken()
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
      throw new ApiError('登录已过期，请重新登录', 401, 401)
    }
    const payload = error.response.data
    const message =
      (payload &&
        typeof payload === 'object' &&
        typeof payload.message === 'string' &&
        payload.message) ||
      `请求失败（${status}）`
    const code =
      payload && typeof payload === 'object' && typeof payload.code === 'number'
        ? payload.code
        : status
    throw new ApiError(message, code, status)
  },
)

/** 拆信封：成功返回 data，失败抛 ApiError（非信封响应直接透传） */
function unwrap<T>(payload: ApiResult<T> | T): T {
  if (payload !== null && typeof payload === 'object' && 'code' in payload) {
    const envelope = payload as ApiResult<T>
    if (SUCCESS_CODES.has(envelope.code)) return envelope.data
    throw new ApiError(envelope.message || '请求失败', envelope.code)
  }
  return payload as T
}

export async function get<T>(url: string, params?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await request.get<ApiResult<T> | T>(url, { ...config, params })
  return unwrap(data)
}

export async function post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await request.post<ApiResult<T> | T>(url, body, config)
  return unwrap(data)
}

export async function put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await request.put<ApiResult<T> | T>(url, body, config)
  return unwrap(data)
}

export async function patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await request.patch<ApiResult<T> | T>(url, body, config)
  return unwrap(data)
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await request.delete<ApiResult<T> | T>(url, config)
  return unwrap(data)
}
