import type { TabsProps } from 'antd'
import { Tabs } from 'antd'
import { Outlet, createFileRoute, useRouterState, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'

export const Route = createFileRoute('/_main/shop/audit')({
  component: ShopAuditsLayout,
})

/**
 * 店铺管理员终审工作台布局路由：
 * 顶部分页签在「店铺申请终审 / 门店申请终审」间切换，
 * 两者是平级子路由，共用 /shop/audit 前缀。
 */
function ShopAuditsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()

  const activeKey = useMemo(() => {
    if (pathname.startsWith('/shop/audit/store-applications')) return 'store-applications'
    return 'shop-applications'
  }, [pathname])

  const items: TabsProps['items'] = [
    { key: 'shop-applications', label: '店铺申请终审' },
    { key: 'store-applications', label: '门店申请终审' },
  ]

  const onChange: TabsProps['onChange'] = (key) => {
    void navigate({ to: `/shop/audit/${key}` as '/shop/audit/shop-applications' })
  }

  return (
    <div>
      <Tabs activeKey={activeKey} items={items} onChange={onChange} />
      <Outlet />
    </div>
  )
}
