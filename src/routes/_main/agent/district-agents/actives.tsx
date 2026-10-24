import { createFileRoute } from '@tanstack/react-router'

import { DistrictAgentActives } from '../../../../views/districtAgents/DistrictAgentActives'

export const Route = createFileRoute('/_main/agent/district-agents/actives')({
  component: DistrictAgentActivesRoute,
})

function DistrictAgentActivesRoute() {
  return <DistrictAgentActives />
}
