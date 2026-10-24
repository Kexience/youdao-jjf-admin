import { createFileRoute } from '@tanstack/react-router'

import { GeoChannels } from '../../../views/geo/channels/GeoChannels'

export const Route = createFileRoute('/_main/geo/channels')({
  component: GeoChannelsRoute,
})

function GeoChannelsRoute() {
  return <GeoChannels />
}
