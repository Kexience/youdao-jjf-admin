import { Spin, Tag, Tooltip, Typography } from 'antd'

import { useGetStoreDepositBalance } from '../../api/shopAudits'
import { ApiError } from '../../lib/request'
import { renderAmount } from '../shopAudits/columns'

/**
 * 列表行的保证金余额单元：后台无批量余额接口，按行懒加载
 * （GET /admin/shop/deposits/apply/{applyId}/balance）。
 * 与抽屉共用同一查询键，登记后自动一起刷新。
 */
export function DepositBalanceCell({ application }: { application: StoreApplyVo }) {
  const query = useGetStoreDepositBalance(application.id)

  if (query.isLoading) return <Spin size="small" />

  if (query.isError) {
    const message =
      query.error instanceof ApiError ? query.error.message : '余额加载失败'
    return (
      <Tooltip title={message}>
        <Typography.Text type="secondary">加载失败</Typography.Text>
      </Tooltip>
    )
  }

  const balance = query.data?.balance ?? 0
  const depositAmount = application.depositAmount
  const needed =
    typeof depositAmount === 'number' && depositAmount > 0 && balance < depositAmount

  return (
    <>
      <Typography.Text type={needed ? 'danger' : undefined}>
        {renderAmount(balance)}
      </Typography.Text>
      {needed ? (
        <Tag color="warning" style={{ marginInlineStart: 4 }}>
          待缴
        </Tag>
      ) : null}
    </>
  )
}
