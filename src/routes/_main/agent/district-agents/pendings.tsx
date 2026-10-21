import { createFileRoute } from '@tanstack/react-router'

import { DistrictAgentPendings } from '../../../../views/districtAgents/DistrictAgentPendings'

export const Route = createFileRoute('/_main/agent/district-agents/pendings')({
  component: DistrictAgentPendingsRoute,
})

function DistrictAgentPendingsRoute() {
  return <DistrictAgentPendings />
}
