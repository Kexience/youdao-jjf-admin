import { createFileRoute } from '@tanstack/react-router'

import { Home } from '../../views/home/Home'

export const Route = createFileRoute('/_main/')({
  component: HomeRoute,
})

function HomeRoute() {
  return <Home title="优道 · 管理端" />
}
