import type { ProColumns } from '@ant-design/pro-components'
import { ProField } from '@ant-design/pro-components'
import { Link } from '@tanstack/react-router'
import { Space, Tag, Typography } from 'antd'

import {
  SHOP_LIFECYCLE_STATUS_ENUM,
  renderShopLifecycleStatus,
} from '../shopStores/columns'

/**
 * 店铺列表列定义（与线上文档 ShopVo 字段对齐）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 数据来源：GET /admin/shop（后台店铺列表分页，只读）。
 */

/**
 * 状态时间：按当前状态取对应的时间戳（冻结 / 停业 / 关店），营业中无额外时间。
 * 三列合并成一列，避免表格过宽。
 */
function renderStatusTime(record: ShopVo) {
  const current =
    record.status === 'frozen'
      ? { label: '冻结', time: record.frozenAt }
      : record.status === 'suspended'
        ? { label: '停业', time: record.suspendedAt }
        : record.status === 'closed'
          ? { label: '关店', time: record.closedAt }
          : undefined
  if (!current) return '-'
  return (
    <Space size={4}>
      <Tag>{current.label}</Tag>
      <ProField text={current.time} valueType="dateTime" mode="read" emptyText="-" />
    </Space>
  )
}

/**
 * 店铺生命周期列（生命周期四动作的操作列由页面追加）。
 * 检索项（经营状态多选 / 关键词）单独放在列首，hideInTable 只参与表单。
 */
export const SHOP_LIFECYCLE_COLUMNS: ProColumns<ShopVo>[] = [
  {
    title: '经营状态',
    dataIndex: 'statuses',
    valueType: 'select',
    hideInTable: true,
    valueEnum: SHOP_LIFECYCLE_STATUS_ENUM,
    fieldProps: {
      mode: 'multiple',
      placeholder: '全部经营状态',
    },
    search: {
      transform: (value) => ({
        statuses: Array.isArray(value) && value.length > 0 ? value.join(',') : undefined,
      }),
    },
  },
  {
    title: '关键词',
    dataIndex: 'keyword',
    hideInTable: true,
    fieldProps: {
      placeholder: '店铺名称 / 联系电话',
    },
  },
  {
    title: '店铺',
    dataIndex: 'shopName',
    width: 180,
    ellipsis: true,
    search: false,
    render: (_, record) => (
      <span>
        {record.shopName || '-'}
        <Typography.Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>
          #{record.id}
        </Typography.Text>
      </span>
    ),
  },
  {
    title: '店主',
    dataIndex: 'ownerMemberId',
    width: 110,
    search: false,
    render: (_, record) =>
      record.ownerMemberId ? (
        <Link
          to="/member/$memberId"
          params={{ memberId: String(record.ownerMemberId) }}
        >
          #{record.ownerMemberId}
        </Link>
      ) : (
        '-'
      ),
  },
  {
    title: '联系电话',
    dataIndex: 'contactPhone',
    width: 130,
    search: false,
  },
  {
    title: '营业地址',
    dataIndex: 'addressDetail',
    width: 240,
    ellipsis: true,
    search: false,
    render: (_, record) =>
      [record.regionName, record.addressDetail].filter(Boolean).join(' ') || '-',
  },
  {
    title: '行业分类',
    dataIndex: 'categoryName',
    width: 110,
    ellipsis: true,
    search: false,
  },
  {
    title: '标签',
    dataIndex: 'labelNames',
    width: 160,
    ellipsis: true,
    search: false,
    render: (_, record) => record.labelNames || '-',
  },
  {
    title: '经营状态',
    dataIndex: 'status',
    width: 100,
    search: false,
    render: (_, record) => renderShopLifecycleStatus(record.status),
  },
  {
    title: '状态时间',
    key: 'statusTime',
    width: 190,
    search: false,
    render: (_, record) => renderStatusTime(record),
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    valueType: 'dateTime',
    width: 170,
    search: false,
  },
]
