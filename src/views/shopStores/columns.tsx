import type { ProColumns } from '@ant-design/pro-components'
import { ProField } from '@ant-design/pro-components'
import { Space, Tag, Typography } from 'antd'

import { renderStoreType } from '../shopAudits/columns'

/**
 * 门店经营列定义（与线上文档 StoreVo 字段对齐）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 数据来源：后台暂无「店铺列表」接口，门店总表由
 * 已通过店铺申请单（shopId）→ GET /admin/shop/lifecycle/shops/{shopId}/stores 聚合而来。
 */

/** 门店经营状态（见文档 StoreVo.status / 后端 Store.STATUS_*） */
export const SHOP_LIFECYCLE_STATUS_ENUM = {
  active: { text: '营业中', status: 'Success' },
  suspended: { text: '已停业', status: 'Warning' },
  frozen: { text: '已冻结', status: 'Error' },
  closed: { text: '已关店', status: 'Default' },
} as const

/** 经营状态筛选选项（Select 用，与表格状态色同一份枚举） */
export const SHOP_LIFECYCLE_STATUS_OPTIONS = (
  Object.keys(SHOP_LIFECYCLE_STATUS_ENUM) as ShopLifecycleStatus[]
).map((value) => ({ value, label: SHOP_LIFECYCLE_STATUS_ENUM[value].text }))

/** 经营状态展示：交给 ProField（valueEnum → 只读态彩色 Badge，色值跟随主题） */
export function renderShopLifecycleStatus(status?: string) {
  return (
    <ProField
      text={status}
      valueType="select"
      mode="read"
      valueEnum={SHOP_LIFECYCLE_STATUS_ENUM}
      emptyText="-"
    />
  )
}

/**
 * 状态时间：按当前状态取对应的时间戳（冻结 / 停业 / 关店），营业中无额外时间。
 * 三列合并成一列，避免表格过宽。
 */
function renderStatusTime(record: StoreVo) {
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
 * 门店总表列（生命周期四动作的操作列由页面追加）。
 * shopNameOf：按 shopId 取店铺名称，用于「所属店铺」列展示。
 */
export function buildStoreColumns(
  shopNameOf: (shopId?: number) => string | undefined,
): ProColumns<StoreVo>[] {
  return [
    {
      title: '门店',
      dataIndex: 'storeName',
      width: 180,
      ellipsis: true,
      render: (_, record) => (
        <span>
          {record.storeName || '-'}
          <Typography.Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>
            #{record.id}
          </Typography.Text>
        </span>
      ),
    },
    {
      title: '所属店铺',
      dataIndex: 'shopId',
      width: 170,
      ellipsis: true,
      render: (_, record) => {
        if (!record.shopId) return '-'
        const name = shopNameOf(record.shopId)
        return (
          <span>
            {name || `店铺 ${record.shopId}`}
            <Typography.Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>
              #{record.shopId}
            </Typography.Text>
          </span>
        )
      },
    },
    {
      title: '门店类型',
      dataIndex: 'storeType',
      width: 90,
      render: (_, record) => renderStoreType(record.storeType),
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      width: 130,
    },
    {
      title: '门店地址',
      dataIndex: 'addressDetail',
      width: 220,
      ellipsis: true,
      render: (_, record) =>
        [record.regionName, record.addressDetail].filter(Boolean).join(' ') || '-',
    },
    {
      title: '行业分类',
      dataIndex: 'categoryName',
      width: 110,
      ellipsis: true,
    },
    {
      title: '经营状态',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => renderShopLifecycleStatus(record.status),
    },
    {
      title: '状态时间',
      key: 'statusTime',
      width: 190,
      render: (_, record) => renderStatusTime(record),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 170,
    },
  ]
}
