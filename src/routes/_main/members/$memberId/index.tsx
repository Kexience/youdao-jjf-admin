import { createFileRoute } from '@tanstack/react-router'

import { MemberOverview } from '../../../../views/members/MemberOverview'

export const Route = createFileRoute('/_main/members/$memberId/')({
  component: MemberOverviewRoute,
})

function MemberOverviewRoute() {
  const { memberId } = Route.useParams()

  return <MemberOverview memberId={Number(memberId)} />
}
