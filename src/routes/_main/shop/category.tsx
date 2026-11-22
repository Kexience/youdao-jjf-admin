import { createFileRoute } from '@tanstack/react-router'

import { ShopCategories } from '../../../views/shopCategories/ShopCategories'

export const Route = createFileRoute('/_main/shop/category')({
  component: ShopCategoriesRoute,
})

function ShopCategoriesRoute() {
  return <ShopCategories />
}
