import { createFileRoute, redirect } from '@tanstack/react-router'

import { useAuthStore } from '../stores/auth'
import { Login } from '../views/login/Login'

interface LoginSearch {
  redirect?: string
}

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: ({ search }) => {
    // 已登录再进 /login：直接回业务页，避免重复登录
    if (useAuthStore.getState().token) {
      // redirect 可能自带 query（如 /menus?page=1），用 href 原样跳回
      throw redirect({ href: search.redirect ?? '/' })
    }
  },
  component: LoginRoute,
})

function LoginRoute() {
  return <Login />
}
