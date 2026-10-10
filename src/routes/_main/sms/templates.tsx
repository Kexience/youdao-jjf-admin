import { createFileRoute } from '@tanstack/react-router'

import { SmsTemplates } from '../../../views/sms/templates/SmsTemplates'

export const Route = createFileRoute('/_main/sms/templates')({
  component: SmsTemplatesRoute,
})

function SmsTemplatesRoute() {
  return <SmsTemplates />
}
