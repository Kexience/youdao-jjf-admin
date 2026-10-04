import { createFileRoute } from '@tanstack/react-router'

import { Menus } from '../../views/Menus'

export const Route = createFileRoute('/_main/menus')({
  component: MenusRoute,
})

function MenusRoute() {
  return <Menus />
}
