import { Link, createFileRoute } from '@tanstack/react-router'
import { Alert, Button } from 'antd'

import { MemberDetail } from '../../views/members/MemberDetail'

export const Route = createFileRoute('/_main/members/$memberId')({
  component: MemberDetailRoute,
})

function MemberDetailRoute() {
  const { memberId } = Route.useParams()
  const id = Number(memberId)

  if (!Number.isInteger(id)) {
    return (
      <Alert
        type="error"
        showIcon
        message="会员 id 非法，请返回列表重试"
        action={
          <Link to="/members">
            <Button size="small">返回列表</Button>
          </Link>
        }
      />
    )
  }

  return <MemberDetail memberId={id} />
}
