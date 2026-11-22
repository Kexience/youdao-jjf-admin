import { createFileRoute } from '@tanstack/react-router'

import { SmsChannels } from '../../../views/sms/channels/SmsChannels'

export const Route = createFileRoute('/_main/sms/channel')({
  component: SmsChannelsRoute,
})

function SmsChannelsRoute() {
  return <SmsChannels />
}
