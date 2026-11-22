import { createFileRoute } from '@tanstack/react-router'

import { Roles } from '../../../../views/roles/Roles'

export const Route = createFileRoute('/_main/system/role/')({
  component: RolesRoute,
})

function RolesRoute() {
  return <Roles />
}
