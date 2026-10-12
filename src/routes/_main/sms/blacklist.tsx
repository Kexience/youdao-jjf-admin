import { createFileRoute } from '@tanstack/react-router'

import { SmsBlacklistPage } from '../../../views/sms/blacklist/SmsBlacklist'

export const Route = createFileRoute('/_main/sms/blacklist')({
  component: SmsBlacklistRoute,
})

function SmsBlacklistRoute() {
  return <SmsBlacklistPage />
}
