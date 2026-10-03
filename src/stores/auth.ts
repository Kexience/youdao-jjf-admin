import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  /** 管理员 access token（见文档 AdminLoginVo），持久化到 localStorage */
  token: string | null
  setToken: (token: string) => void
  clearToken: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
    }),
    {
      name: 'jjf-admin-auth',
      partialize: (state) => ({ token: state.token }) as AuthState,
    },
  ),
)
