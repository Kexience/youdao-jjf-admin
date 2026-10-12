import { createFileRoute } from '@tanstack/react-router'

import { MemberLevelHistory } from '../../../../views/members/MemberLevelHistory'

export const Route = createFileRoute('/_main/members/$memberId/level-history')({
  component: MemberLevelHistoryRoute,
})

function MemberLevelHistoryRoute() {
  const { memberId } = Route.useParams()

  return <MemberLevelHistory memberId={Number(memberId)} />
}
