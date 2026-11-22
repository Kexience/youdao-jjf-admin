import { createFileRoute } from '@tanstack/react-router'

import { Deposits } from '../../../views/shopDeposits/Deposits'

export const Route = createFileRoute('/_main/shop/deposit')({
  component: DepositsRoute,
})

function DepositsRoute() {
  return <Deposits />
}
