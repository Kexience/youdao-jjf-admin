import { createFileRoute } from '@tanstack/react-router'

import { RegionQuery } from '../../../views/regions/RegionQuery'

export const Route = createFileRoute('/_main/region/query')({
  component: RegionQueryRoute,
})

function RegionQueryRoute() {
  return <RegionQuery />
}
