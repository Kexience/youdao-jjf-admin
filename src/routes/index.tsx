import { createFileRoute } from '@tanstack/react-router'

import { Home } from '../views/Home'

export const Route = createFileRoute('/')({
  component: HomeRoute,
})

function HomeRoute() {
  return <Home title="优道 · 管理端" />
}
