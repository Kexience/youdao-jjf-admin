import { createFileRoute } from '@tanstack/react-router'

import { Shops } from '../../../views/shopLifecycle/Shops'

export const Route = createFileRoute('/_main/shop/lifecycle')({
  component: ShopsRoute,
})

/** 店铺生命周期（保留原路由；与 /shop/list 共用店铺列表能力） */
function ShopsRoute() {
  return (
    <Shops
      title="店铺生命周期"
      subTitle="管理店铺经营状态：冻结 / 停业 / 恢复 / 关店；关店为终态，须其下所有门店先关店。"
    />
  )
}
