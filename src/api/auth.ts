import { post } from '../lib/request'
import { useAuthStore } from '../stores/auth'


/** 管理员登录：成功后自动持久化 accessToken，后续请求自动携带 */
export async function login(params: AdminLoginParams): Promise<AdminLoginResult> {
  // 基础路径已由 VITE_API_BASE_URL 统一为 /api，这里只写后端路由前缀之后的路径
  const data = await post<AdminLoginResult>('/auth/login', params)
  useAuthStore.getState().setToken(data.accessToken)
  return data
}

/**
 * 退出登录：文档中管理端暂无 logout 接口，仅清除本地 token。
 * 调用方负责跳转到 /login（401 由 request 拦截器统一处理）。
 */
export function logout() {
  useAuthStore.getState().clearToken()
}
