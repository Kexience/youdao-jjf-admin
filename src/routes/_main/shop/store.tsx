import { createFileRoute } from '@tanstack/react-router'

import { Stores } from '../../../views/shopStores/Stores'

export const Route = createFileRoute('/_main/shop/store')({
  component: StoresRoute,
})

function StoresRoute() {
  return <Stores />
}
