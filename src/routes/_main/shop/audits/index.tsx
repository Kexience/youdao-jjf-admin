import { createFileRoute, redirect } from '@tanstack/react-router'

/**
 * /shop/audits 无独立页面，直接跳到店铺申请终审（两个工作台通过页签切换）。
 */
export const Route = createFileRoute('/_main/shop/audits/')({
  beforeLoad: () => {
    throw redirect({ to: '/shop/audits/shop-applications' })
  },
})
