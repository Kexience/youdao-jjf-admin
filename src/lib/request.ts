import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'

import { useAuthStore } from '../stores/auth'

/**
 * 后端统一信封见全局类型 ApiResult（src/types/global.d.ts）：
 * 线上文档（https://dev-1.ydndd.com/v3/api-docs）全接口均为
 * `ResultXxx{code, message, data}`，全局鉴权为 bearerAuth JWT。
 */

// 成功码：文档未明确成功码取值，按常见约定兼容 0 / 200，联调时以实际为准
const SUCCESS_CODES = new Set([0, 200])

/**
 * 登录失效码：后端鉴权失败不一定走 HTTP 401，
 * 实测过期返回的是 HTTP 200 + 信封 `{code: 40202, message: '登录已过期，请重新登录'}`，
 * 因此 HTTP 状态码和业务 code 都要处理。
 */
const UNAUTHORIZED_CODES = new Set([401, 40202])

/** 并发请求同时过期时只跳一次，避免多次 assign */
let redirectingToLogin = false

/** 清 token 并跳 /login（保留原路径，登录成功后可跳回） */
function handleUnauthorized(): void {
  if (typeof window === 'undefined') return
  useAuthStore.getState().clearToken()
  const pathname = window.location.pathname
  if (pathname.startsWith('/login') || redirectingToLogin) return
  redirectingToLogin = true
  const redirect = `${pathname}${window.location.search}`
  const target =
    redirect && redirect !== '/'
      ? `/login?redirect=${encodeURIComponent(redirect)}`
      : '/login'
  window.location.assign(target)
  // 下一轮事件循环后复位（页面一般已跳转，复位仅防单页未跳转时卡死）
  setTimeout(() => {
    redirectingToLogin = false
  }, 1000)
}

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

function resolveBaseURL(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL
  if (typeof fromEnv === 'string' && fromEnv.length > 0) return fromEnv
  // 兜底同源 /api：开发环境经 vite 代理转到 VITE_API_PROXY_TARGET，
  // 生产构建由部署层把 /api/** 转到后端地址/**；换环境只改 .env
  return '/api'
}

/** 全局 axios 实例：业务代码请用下面的 get/post/put/patch/del，不要直接用它 */
export const request = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 15000,
})

request.interceptors.request.use((config) => {
  // 拦截器在 React 之外，用 getState() 读 token
  const token = useAuthStore.getState().token
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
    const payload = error.response.data
    const payloadCode =
      payload && typeof payload === 'object' && typeof payload.code === 'number'
        ? payload.code
        : undefined
    // HTTP 401 或信封业务码为登录失效码：清 token 并跳 /login
    if (status === 401 || (payloadCode !== undefined && UNAUTHORIZED_CODES.has(payloadCode))) {
      handleUnauthorized()
      const message =
        (payload &&
          typeof payload === 'object' &&
          typeof payload.message === 'string' &&
          payload.message) ||
        '登录已过期，请重新登录'
      throw new ApiError(message, payloadCode ?? status, status)
    }
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
    // HTTP 200 但业务码表示登录失效（如 40202）：同样清 token 并跳 /login
    if (UNAUTHORIZED_CODES.has(envelope.code)) {
      handleUnauthorized()
    }
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
