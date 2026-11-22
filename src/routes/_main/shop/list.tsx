import { createFileRoute } from '@tanstack/react-router'

import { Shops } from '../../../views/shopLifecycle/Shops'

export const Route = createFileRoute('/_main/shop/list')({
  component: ShopListRoute,
})

/** 店铺列表（菜单 component=shop/list，权限码 admin:shop:shop:list） */
function ShopListRoute() {
  return <Shops />
}
