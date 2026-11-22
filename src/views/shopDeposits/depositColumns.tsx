import type { ProColumns } from '@ant-design/pro-components'
import { ProField } from '@ant-design/pro-components'
import { Image, Typography } from 'antd'

/**
 * 保证金台账列定义（与线上文档 StoreDepositVo 字段对齐）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 本文件只放常量 / 纯函数 / 列定义，组件在 Drawer 与登记弹窗里。
 */

/** 保证金动作（见文档 StoreDepositVo.action / StoreDepositRequest.action） */
export const DEPOSIT_ACTION_ENUM = {
  pay: { text: '缴纳', status: 'Success' },
  refund: { text: '退还', status: 'Warning' },
  deduct: { text: '扣减', status: 'Error' },
} as const

/** 动作登记入参的可选项（登记弹窗用） */
export const DEPOSIT_ACTION_OPTIONS = [
  { value: 'pay', label: '缴纳（余额增加）' },
  { value: 'refund', label: '退还（余额减少）' },
  { value: 'deduct', label: '扣减（余额减少）' },
] as const

/** 金额方向：缴纳为 +，退还 / 扣减为 - */
export function renderDepositAmount(record: StoreDepositVo) {
  if (record.amount === undefined || record.amount === null) return '-'
  const isPay = record.action === 'pay'
  const sign = record.action ? (isPay ? '+' : '-') : ''
  return (
    <Typography.Text type={record.action ? (isPay ? 'success' : 'danger') : undefined}>
      {`${sign}¥${record.amount.toFixed(2)}`}
    </Typography.Text>
  )
}

/** 保证金流水列（不分页数据由接口整包返回，页面内分页展示） */
export const STORE_DEPOSIT_COLUMNS: ProColumns<StoreDepositVo>[] = [
  {
    title: '登记时间',
    dataIndex: 'createdAt',
    valueType: 'dateTime',
    width: 170,
  },
  {
    title: '动作',
    dataIndex: 'action',
    width: 80,
    render: (_, record) => (
      <ProField
        text={record.action}
        valueType="select"
        mode="read"
        valueEnum={DEPOSIT_ACTION_ENUM}
        emptyText="-"
      />
    ),
  },
  {
    title: '动作金额',
    dataIndex: 'amount',
    width: 110,
    align: 'right',
    render: (_, record) => renderDepositAmount(record),
  },
  {
    title: '动作后余额',
    dataIndex: 'balanceAfter',
    width: 120,
    align: 'right',
    render: (_, record) =>
      record.balanceAfter === undefined || record.balanceAfter === null
        ? '-'
        : `¥${record.balanceAfter.toFixed(2)}`,
  },
  {
    title: '凭证',
    dataIndex: 'voucherUrl',
    width: 80,
    render: (_, record) =>
      record.voucherUrl ? (
        <Image
          src={record.voucherUrl}
          width={48}
          height={48}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          alt="保证金凭证"
        />
      ) : (
        '-'
      ),
  },
  {
    title: '备注',
    dataIndex: 'remark',
    ellipsis: true,
    render: (_, record) => record.remark || '-',
  },
  {
    title: '登记管理员',
    dataIndex: 'operatorId',
    width: 110,
    render: (_, record) =>
      record.operatorId ? `管理员 #${record.operatorId}` : '-',
  },
  {
    title: '关联门店',
    dataIndex: 'storeId',
    width: 90,
    render: (_, record) => (record.storeId ? `门店 #${record.storeId}` : '申请期'),
  },
]
