import { createFileRoute } from '@tanstack/react-router'

import { SmsConfig } from '../../../views/sms/config/SmsConfig'

export const Route = createFileRoute('/_main/sms/config')({
  component: SmsConfigRoute,
})

function SmsConfigRoute() {
  return <SmsConfig />
}
