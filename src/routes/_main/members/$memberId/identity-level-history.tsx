import { createFileRoute } from '@tanstack/react-router'

import { MemberIdentityLevelHistory } from '../../../../views/members/MemberIdentityLevelHistory'

export const Route = createFileRoute('/_main/members/$memberId/identity-level-history')({
  component: MemberIdentityLevelHistoryRoute,
})

function MemberIdentityLevelHistoryRoute() {
  const { memberId } = Route.useParams()

  return <MemberIdentityLevelHistory memberId={Number(memberId)} />
}
