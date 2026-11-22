import { createFileRoute } from '@tanstack/react-router'

import { SmsRecords } from '../../../views/sms/records/SmsRecords'

export const Route = createFileRoute('/_main/sms/record')({
  component: SmsRecordsRoute,
})

function SmsRecordsRoute() {
  return <SmsRecords />
}
