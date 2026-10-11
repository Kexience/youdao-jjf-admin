import { createFileRoute } from '@tanstack/react-router'

import { AdminUsers } from '../../../views/adminUsers/AdminUsers'

export const Route = createFileRoute('/_main/users/')({
  component: AdminUsersRoute,
})

function AdminUsersRoute() {
  return <AdminUsers />
}
