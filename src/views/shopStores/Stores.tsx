import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { App, Button, Popconfirm, Typography } from 'antd'
import { useRef } from 'react'

import type { ShopLifecycleAction } from '../../api/shopLifecycle'
import { fetchStores, useChangeStoreLifecycle } from '../../api/shopLifecycle'
import { usePermissionChecker } from '../../hooks/usePermissionChecker'
import { ApiError } from '../../lib/request'
import { SHOP_LIFECYCLE_STATUS_ENUM, STORE_LIST_COLUMNS } from './columns'

/** 四类生命周期动作的确认文案与成功提示（动作名即接口路径末段） */
const ACTION_META: Record<
  ShopLifecycleAction,
  {
    label: string
    title: string
    description: string
    okText: string
    successText: string
    danger?: boolean
  }
> = {
  freeze: {
    label: '冻结',
    title: '冻结该门店？',
    description: '冻结后门店停止订货与交易，需恢复营业后才能继续经营。',
    okText: '确认冻结',
    successText: '已冻结该门店',
    danger: true,
  },
  suspend: {
    label: '停业',
    title: '停业该门店？',
    description: '停业后门店暂停经营，可随时恢复营业。',
    okText: '确认停业',
    successText: '已停业该门店',
  },
  resume: {
    label: '恢复营业',
    title: '恢复该门店营业？',
    description: '恢复后门店回到营业中状态，清空冻结 / 停业时间。',
    okText: '确认恢复',
    successText: '已恢复该门店营业',
  },
  close: {
    label: '关店',
    title: '关闭该门店？',
    description: '关店为终态，不可恢复；须保证金已结清，请谨慎操作。',
    okText: '确认关店',
    successText: '已关闭该门店',
    danger: true,
  },
}

/**
 * 当前状态允许的动作（后端 ShopLifecycleService 状态机）：
 * - freeze：active/suspended → frozen；
 * - suspend：active/frozen → suspended；
 * - resume：frozen/suspended → active；
 * - close：active/suspended → closed（终态，frozen 须先恢复）。
 */
const ACTIONS_BY_STATUS: Record<ShopLifecycleStatus, ShopLifecycleAction[]> = {
  active: ['freeze', 'suspend', 'close'],
  frozen: ['resume', 'suspend'],
  suspended: ['resume', 'freeze', 'close'],
  closed: [],
}

/**
 * 门店列表页（/shop/store，菜单 component=shop/store）：
 * - 列表：GET /admin/shop/stores（page/pageSize 分页），支持按归属店铺 id、
 *   经营状态多选、门店名称 / 联系电话关键词过滤；不填店铺 id 即跨店铺查询；
 * - 操作：冻结 / 停业 / 恢复 / 关店（POST /admin/shop/lifecycle/stores/{storeId}/{action}），
 *   可见动作由门店当前状态 + 当前管理员权限码共同决定；关店终态且要求保证金结清
 *   （后端校验）。
 */
export function Stores() {
  const { message } = App.useApp()
  const actionRef = useRef<ActionType>(null)
  const hasPermission = usePermissionChecker()

  const lifecycleMutation = useChangeStoreLifecycle({
    onSuccess: (_data, variables) => {
      message.success(ACTION_META[variables.action].successText)
      actionRef.current?.reload()
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '操作失败，请重试')
    },
  })

  const columns: ProColumns<StoreVo>[] = [
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
      title: '所属店铺 ID',
      dataIndex: 'shopId',
      hideInTable: true,
      fieldProps: {
        placeholder: '不填=跨店铺',
        inputMode: 'numeric',
      },
    },
    {
      title: '关键词',
      dataIndex: 'keyword',
      hideInTable: true,
      fieldProps: {
        placeholder: '门店名称 / 联系电话',
      },
    },
    ...STORE_LIST_COLUMNS,
    {
      title: '操作',
      key: 'action',
      valueType: 'option',
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        const actions = (record.status ? ACTIONS_BY_STATUS[record.status] : []).filter(
          (action) => hasPermission(`admin:shop:store:${action}`),
        )
        if (actions.length === 0) {
          return [
            <Typography.Text key="closed" type="secondary">
              {record.status === 'closed' ? '已关店（终态）' : '-'}
            </Typography.Text>,
          ]
        }
        return actions.map((action) => {
          const meta = ACTION_META[action]
          return (
            <Popconfirm
              key={action}
              title={meta.title}
              description={meta.description}
              okText={meta.okText}
              cancelText="取消"
              okButtonProps={{ danger: meta.danger, loading: lifecycleMutation.isPending }}
              disabled={lifecycleMutation.isPending}
              onConfirm={() =>
                lifecycleMutation.mutateAsync({ storeId: record.id, action })
              }
            >
              <Button type="link" size="small" danger={meta.danger}>
                {meta.label}
              </Button>
            </Popconfirm>
          )
        })
      },
    },
  ]

  return (
    <PageContainer
      header={{
        title: '门店列表',
        subTitle:
          '跨店铺查看门店经营状态，可按归属店铺 / 经营状态 / 关键词筛选；支持冻结 / 停业 / 恢复 / 关店。',
      }}
    >
      <ProTable<StoreVo>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        headerTitle="门店列表"
        scroll={{ x: 'max-content' }}
        search={{ labelWidth: 'auto' }}
        dateFormatter={false}
        options={{ density: true, reload: true, setting: true }}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          showTotal: (total) => `共 ${total} 条`,
        }}
        request={async (params) => {
          const shopIdValue = Number(params.shopId)
          const shopId =
            Number.isInteger(shopIdValue) && shopIdValue > 0 ? shopIdValue : undefined
          try {
            const data = await fetchStores({
              page: params.current ?? 1,
              pageSize: params.pageSize ?? 20,
              shopId,
              statuses:
                typeof params.statuses === 'string' ? params.statuses : undefined,
              keyword:
                typeof params.keyword === 'string' && params.keyword.trim()
                  ? params.keyword.trim()
                  : undefined,
            })
            return { data: data.records, total: data.total, success: true }
          } catch (error) {
            message.error(
              error instanceof ApiError ? error.message : '门店列表加载失败，请重试',
            )
            return { data: [], total: 0, success: false }
          }
        }}
        locale={{ emptyText: '暂无门店数据' }}
      />
    </PageContainer>
  )
}
