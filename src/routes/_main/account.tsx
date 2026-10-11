import { createFileRoute } from '@tanstack/react-router'

import { AccountCenter } from '../../views/account/AccountCenter'

export const Route = createFileRoute('/_main/account')({
  component: AccountRoute,
})

function AccountRoute() {
  return <AccountCenter />
}
