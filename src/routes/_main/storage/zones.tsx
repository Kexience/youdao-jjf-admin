import { createFileRoute } from '@tanstack/react-router'

import { StorageZones } from '../../../views/storage/zones/StorageZones'

export const Route = createFileRoute('/_main/storage/zones')({
  component: StorageZonesRoute,
})

function StorageZonesRoute() {
  return <StorageZones />
}
