import { createFileRoute } from '@tanstack/react-router'

import { MemberLevels } from '../../../views/memberLevels/MemberLevels'

export const Route = createFileRoute('/_main/memberlevel/levels')({
  component: MemberLevelsRoute,
})

function MemberLevelsRoute() {
  return <MemberLevels />
}
