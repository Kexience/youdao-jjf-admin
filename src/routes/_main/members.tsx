import { createFileRoute } from '@tanstack/react-router'

import { Members } from '../../views/members/Members'

export const Route = createFileRoute('/_main/members')({
  component: MembersRoute,
})

function MembersRoute() {
  return <Members />
}
