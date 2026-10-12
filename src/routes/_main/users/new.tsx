import { createFileRoute } from '@tanstack/react-router'

import { AdminUserCreate } from '../../../views/adminUsers/AdminUserCreate'

export const Route = createFileRoute('/_main/users/new')({
  component: AdminUserCreateRoute,
})

function AdminUserCreateRoute() {
  return <AdminUserCreate />
}
