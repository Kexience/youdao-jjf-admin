import { createFileRoute } from '@tanstack/react-router'

import { StorageChannels } from '../../../views/storage/channels/StorageChannels'

export const Route = createFileRoute('/_main/storage/channels')({
  component: StorageChannelsRoute,
})

function StorageChannelsRoute() {
  return <StorageChannels />
}
