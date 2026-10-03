import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutRoute,
})

function AboutRoute() {
  return (
    <section>
      <h2>关于</h2>
      <p>优道（jjf）PC 管理端 · React 19 + TypeScript + Vite + TanStack Router</p>
    </section>
  )
}
