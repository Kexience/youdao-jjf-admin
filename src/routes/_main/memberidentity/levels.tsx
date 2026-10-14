import { createFileRoute } from '@tanstack/react-router'

import { MemberIdentityLevels } from '../../../views/memberIdentityLevels/MemberIdentityLevels'

export const Route = createFileRoute('/_main/memberidentity/levels')({
  component: MemberIdentityLevelsRoute,
})

function MemberIdentityLevelsRoute() {
  return <MemberIdentityLevels />
}
