import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { App, Button, Popconfirm, Typography } from 'antd'
import { useRef } from 'react'

import type { ShopLifecycleAction } from '../../api/shopLifecycle'
import { fetchShops, useChangeShopLifecycle } from '../../api/shopLifecycle'
import { usePermissionChecker } from '../../hooks/usePermissionChecker'
import { ApiError } from '../../lib/request'
import { SHOP_LIFECYCLE_COLUMNS } from './columns'

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
    title: '冻结该店铺？',
    description: '冻结后店铺停止订货与交易，需恢复营业后才能继续经营。',
    okText: '确认冻结',
    successText: '已冻结该店铺',
    danger: true,
  },
  suspend: {
    label: '停业',
    title: '停业该店铺？',
    description: '停业后店铺暂停经营，可随时恢复营业。',
    okText: '确认停业',
    successText: '已停业该店铺',
  },
  resume: {
    label: '恢复营业',
    title: '恢复该店铺营业？',
    description: '恢复后店铺回到营业中状态，清空冻结 / 停业时间。',
    okText: '确认恢复',
    successText: '已恢复该店铺营业',
  },
  close: {
    label: '关店',
    title: '关闭该店铺？',
    description: '关店为终态，不可恢复；须其下所有门店均已关店，请谨慎操作。',
    okText: '确认关店',
    successText: '已关闭该店铺',
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
 * 店铺列表页（/shop/list；/shop/lifecycle 复用同一页但保留独立标题）：
 * - 列表：GET /admin/shop（page/pageSize 分页），支持经营状态多选与
 *   店铺名称 / 联系电话关键词检索；
 * - 操作：冻结 / 停业 / 恢复 / 关店（POST /admin/shop/lifecycle/shops/{shopId}/{action}），
 *   可见动作由店铺当前状态 + 当前管理员权限码共同决定；关店为终态且要求
 *   其下所有门店已关店（后端校验）。
 */
interface ShopsProps {
  /** 页面标题，默认「店铺列表」（菜单文案由后端下发，这里只兜底页面标题） */
  title?: string
  /** 页面副标题 */
  subTitle?: string
}

export function Shops({
  title = '店铺列表',
  subTitle = '查看店铺经营信息，支持冻结 / 停业 / 恢复 / 关店；关店为终态，须其下所有门店先关店。',
}: ShopsProps = {}) {
  const { message } = App.useApp()
  const actionRef = useRef<ActionType>(null)
  const hasPermission = usePermissionChecker()

  const lifecycleMutation = useChangeShopLifecycle({
    onSuccess: (_data, variables) => {
      message.success(ACTION_META[variables.action].successText)
      actionRef.current?.reload()
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '操作失败，请重试')
    },
  })

  const columns: ProColumns<ShopVo>[] = [
    ...SHOP_LIFECYCLE_COLUMNS,
    {
      title: '操作',
      key: 'action',
      valueType: 'option',
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        const actions = (record.status ? ACTIONS_BY_STATUS[record.status] : []).filter(
          (action) => hasPermission(`admin:shop:shop:${action}`),
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
                lifecycleMutation.mutateAsync({ shopId: record.id, action })
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
        title,
        subTitle,
      }}
    >
      <ProTable<ShopVo>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        headerTitle={title}
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
          try {
            const data = await fetchShops({
              page: params.current ?? 1,
              pageSize: params.pageSize ?? 20,
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
              error instanceof ApiError ? error.message : '店铺列表加载失败，请重试',
            )
            return { data: [], total: 0, success: false }
          }
        }}
        locale={{ emptyText: '暂无店铺数据' }}
      />
    </PageContainer>
  )
}
