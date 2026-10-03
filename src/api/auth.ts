import { clearToken, post, setToken } from '../lib/request'

/** POST /admin/auth/login 入参（见文档 AdminLoginDto） */
export interface AdminLoginParams {
  username: string
  password: string
}

/** 登录成功响应（见文档 AdminLoginVo） */
export interface AdminLoginResult {
  /** 管理员 access token */
  accessToken: string
  /** 令牌有效期（秒） */
  expiresIn: number
}

/** 管理员登录：成功后自动持久化 accessToken，后续请求自动携带 */
export async function login(params: AdminLoginParams): Promise<AdminLoginResult> {
  const data = await post<AdminLoginResult>('/admin/auth/login', params)
  setToken(data.accessToken)
  return data
}

/**
 * 退出登录：文档中管理端暂无 logout 接口，仅清除本地 token。
 * 调用方负责跳转到 /login（401 由 request 拦截器统一处理）。
 */
export function logout() {
  clearToken()
}
