import { Link, createFileRoute } from '@tanstack/react-router'
import { Alert, Button } from 'antd'

import { AdminUserDetail } from '../../../views/adminUsers/AdminUserDetail'

export const Route = createFileRoute('/_main/users/$userId')({
  component: AdminUserDetailRoute,
})

function AdminUserDetailRoute() {
  const { userId } = Route.useParams()
  const id = Number(userId)

  if (!Number.isInteger(id)) {
    return (
      <Alert
        type="error"
        showIcon
        message="管理员 id 非法，请返回列表重试"
        action={
          <Link to="/users">
            <Button size="small">返回列表</Button>
          </Link>
        }
      />
    )
  }

  return <AdminUserDetail userId={id} />
}
