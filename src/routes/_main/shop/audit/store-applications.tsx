import { createFileRoute } from '@tanstack/react-router'

import { StoreApplications } from '../../../../views/shopAudits/StoreApplications'

export const Route = createFileRoute('/_main/shop/audit/store-applications')({
  component: StoreApplicationsRoute,
})

function StoreApplicationsRoute() {
  return <StoreApplications />
}
