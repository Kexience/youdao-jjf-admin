import { createFileRoute } from '@tanstack/react-router'

import { AdminUserCreate } from '../../../../views/adminUsers/AdminUserCreate'

export const Route = createFileRoute('/_main/system/admin/new')({
  component: AdminUserCreateRoute,
})

function AdminUserCreateRoute() {
  return <AdminUserCreate />
}
