import type { ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { App, Button, Typography } from 'antd'
import { useState } from 'react'

import { fetchStoreApplyAudits } from '../../api/shopAudits'
import { ApiError } from '../../lib/request'
import {
  SHOP_APPLY_STATUS_ENUM,
  renderAmount,
  renderStoreType,
} from '../shopAudits/columns'
import { DepositAccountDrawer } from './DepositAccountDrawer'
import { DepositBalanceCell } from './DepositBalanceCell'

/**
 * 状态全集：保证金页要覆盖「先缴后审」的待终审单，也要覆盖已开通门店
 * （开户后仍可退还 / 扣减），因此显式传全部状态，不能沿用申请列表
 * 「不传 statuses = 全部非 approved」的默认口径。
 */
const ALL_APPLY_STATUSES = Object.keys(SHOP_APPLY_STATUS_ENUM).join(',')

/**
 * 门店保证金管理页（/shop/deposit）：
 * - 后台没有独立保证金账号接口，账户主体是门店申请单（applyId），
 *   列表先用 GET /admin/shop/audits/store-applications 拿到申请单；
 * - 每行「保证金账户」打开抽屉：按 applyId 查余额与流水，并登记
 *   缴纳 / 退还 / 扣减（POST /admin/shop/deposits/apply/{applyId}/records）；
 * - 应缴保证金来自申请单快照（depositAmount），未缴清时门店终审会被后端拒绝。
 */
export function Deposits() {
  const { message } = App.useApp()

  const [selected, setSelected] = useState<StoreApplyVo>()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const openAccount = (application: StoreApplyVo) => {
    setSelected(application)
    setDrawerOpen(true)
  }

  const columns: ProColumns<StoreApplyVo>[] = [
    {
      title: '申请单号',
      dataIndex: 'id',
      width: 90,
      search: false,
    },
    {
      title: '门店名称',
      dataIndex: 'storeName',
      width: 170,
      ellipsis: true,
      search: false,
    },
    {
      title: '所属店铺',
      dataIndex: 'shopId',
      width: 90,
      search: false,
      render: (_, record) => (record.shopId ? `店铺 #${record.shopId}` : '-'),
    },
    {
      title: '门店类型',
      dataIndex: 'storeType',
      width: 90,
      search: false,
      render: (_, record) => renderStoreType(record.storeType),
    },
    {
      title: '应缴保证金',
      dataIndex: 'depositAmount',
      width: 120,
      search: false,
      render: (_, record) => renderAmount(record.depositAmount),
    },
    {
      title: '当前余额',
      key: 'balance',
      width: 130,
      search: false,
      render: (_, record) => <DepositBalanceCell application={record} />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      width: 110,
      valueEnum: SHOP_APPLY_STATUS_ENUM,
      fieldProps: { mode: 'multiple', placeholder: '不选=全部状态' },
      search: {
        transform: (value) => ({
          statuses:
            Array.isArray(value) && value.length > 0 ? value.join(',') : undefined,
        }),
      },
    },
    {
      title: '已开通门店',
      dataIndex: 'storeId',
      width: 110,
      search: false,
      render: (_, record) =>
        record.storeId ? `门店 #${record.storeId}` : '未开通',
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 170,
      search: false,
    },
    {
      title: '操作',
      key: 'action',
      valueType: 'option',
      width: 110,
      fixed: 'right',
      render: (_, record) => [
        <Button
          key="account"
          type="link"
          size="small"
          onClick={() => openAccount(record)}
        >
          保证金账户
        </Button>,
      ],
    },
  ]

  return (
    <PageContainer
      header={{
        title: '保证金管理',
        subTitle:
          '按门店申请单管理保证金账户：登记缴纳 / 退还 / 扣减并查看流水；未缴清应缴保证金时门店终审无法通过。',
      }}
    >
      <ProTable<StoreApplyVo>
        rowKey="id"
        columns={columns}
        headerTitle="门店保证金账户"
        scroll={{ x: 'max-content' }}
        dateFormatter={false}
        search={{ labelWidth: 'auto' }}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        request={async (params) => {
          try {
            const data = await fetchStoreApplyAudits({
              page: params.current ?? 1,
              pageSize: params.pageSize ?? 20,
              statuses: (params.statuses as string | undefined) ?? ALL_APPLY_STATUSES,
            })
            return { data: data.records, total: data.total, success: true }
          } catch (error) {
            message.error(
              error instanceof ApiError ? error.message : '门店申请单加载失败，请重试',
            )
            return { data: [], total: 0, success: false }
          }
        }}
        locale={{
          emptyText: (
            <Typography.Text type="secondary">
              暂无门店申请单
            </Typography.Text>
          ),
        }}
        options={{ density: true, reload: true, setting: true }}
      />

      <DepositAccountDrawer
        application={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </PageContainer>
  )
}
