import { createFileRoute } from '@tanstack/react-router'

import { SmsTemplates } from '../../../views/sms/templates/SmsTemplates'

export const Route = createFileRoute('/_main/sms/template')({
  component: SmsTemplatesRoute,
})

function SmsTemplatesRoute() {
  return <SmsTemplates />
}
