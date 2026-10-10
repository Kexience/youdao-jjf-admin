import { createFileRoute } from '@tanstack/react-router'

import { Menus } from '../../views/menus/Menus'

export const Route = createFileRoute('/_main/menus')({
  component: MenusRoute,
})

function MenusRoute() {
  return <Menus />
}
