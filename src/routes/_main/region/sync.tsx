import { createFileRoute } from '@tanstack/react-router'

import { Regions } from '../../../views/regions/Regions'

export const Route = createFileRoute('/_main/region/sync')({
  component: RegionSyncRoute,
})

function RegionSyncRoute() {
  return <Regions />
}
