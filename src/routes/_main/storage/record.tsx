import { createFileRoute } from '@tanstack/react-router'

import { StorageRecords } from '../../../views/storage/records/StorageRecords'

export const Route = createFileRoute('/_main/storage/record')({
  component: StorageRecordsRoute,
})

function StorageRecordsRoute() {
  return <StorageRecords />
}
