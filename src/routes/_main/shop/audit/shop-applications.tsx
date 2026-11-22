import { createFileRoute } from '@tanstack/react-router'

import { ShopApplications } from '../../../../views/shopAudits/ShopApplications'

export const Route = createFileRoute('/_main/shop/audit/shop-applications')({
  component: ShopApplicationsRoute,
})

function ShopApplicationsRoute() {
  return <ShopApplications />
}
