import { createFileRoute } from '@tanstack/react-router'

import { Roles } from '../../../views/roles/Roles'

export const Route = createFileRoute('/_main/roles/')({
  component: RolesRoute,
})

function RolesRoute() {
  return <Roles />
}
