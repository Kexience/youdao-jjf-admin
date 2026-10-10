import { Link, createFileRoute } from '@tanstack/react-router'
import { Alert, Button } from 'antd'

import { RoleDetail } from '../../../views/roles/RoleDetail'

export const Route = createFileRoute('/_main/roles/$roleId')({
  component: RoleDetailRoute,
})

function RoleDetailRoute() {
  const { roleId } = Route.useParams()
  const id = Number(roleId)

  if (!Number.isInteger(id)) {
    return (
      <Alert
        type="error"
        showIcon
        message="角色 id 非法，请返回列表重试"
        action={
          <Link to="/roles">
            <Button size="small">返回列表</Button>
          </Link>
        }
      />
    )
  }

  return <RoleDetail roleId={id} />
}
