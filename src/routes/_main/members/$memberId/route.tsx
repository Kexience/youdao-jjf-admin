import { Link, createFileRoute } from '@tanstack/react-router'
import { Alert, Button } from 'antd'

import { MemberDetailLayout } from '../../../../views/members/MemberDetailLayout'

export const Route = createFileRoute('/_main/members/$memberId')({
  component: MemberDetailRoute,
})

/**
 * 会员详情布局路由：只做 id 校验 + 挂载 MemberDetailLayout（页头 + <Outlet />）。
 * 详情概览（index）与后续订单等子页均为其子路由。
 */
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

  return <MemberDetailLayout memberId={id} />
}
