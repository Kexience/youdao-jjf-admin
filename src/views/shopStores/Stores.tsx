import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { Alert, App, Button, Input, Popconfirm, Select, Space, Typography } from 'antd'
import { useMemo, useRef, useState } from 'react'

import type { ShopLifecycleAction } from '../../api/shopLifecycle'
import { useChangeStoreLifecycle, useGetStoresOfShops } from '../../api/shopLifecycle'
import { useGetAllApprovedShopApplications } from '../../api/shopAudits'
import { ApiError } from '../../lib/request'
import { SHOP_LIFECYCLE_STATUS_OPTIONS, buildStoreColumns } from './columns'

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
 * 门店经营页（/shop/store）：
 * - 数据：后台暂无店铺列表接口，先取全部已通过店铺申请单拿 shopId 清单，
 *   再按店铺并行查门店（GET /admin/shop/lifecycle/shops/{shopId}/stores，不分页），
 *   前端聚合成门店总表并按店铺 / 状态 / 关键词本地筛选；
 * - 操作：冻结 / 停业 / 恢复 / 关店（POST /admin/shop/lifecycle/stores/{storeId}/{action}），
 *   可见动作由门店当前状态决定；关店终态且要求保证金结清（后端校验）。
 */
export function Stores() {
  const { message } = App.useApp()
  const actionRef = useRef<ActionType>(null)

  const [shopId, setShopId] = useState<number>()
  const [status, setStatus] = useState<ShopLifecycleStatus>()
  const [keyword, setKeyword] = useState('')

  const shopsQuery = useGetAllApprovedShopApplications()
  const shopIds = useMemo(
    () => (shopsQuery.data ?? []).map((shop) => shop.id).filter((id) => id > 0),
    [shopsQuery.data],
  )
  const storesQuery = useGetStoresOfShops(shopIds)

  const shopNameById = useMemo(
    () => new Map((shopsQuery.data ?? []).map((shop) => [shop.id, shop.shopName ?? ''])),
    [shopsQuery.data],
  )

  const shopOptions = useMemo(
    () =>
      (shopsQuery.data ?? []).map((shop) => ({
        value: shop.id,
        label: `${shop.shopName || '未命名店铺'}（#${shop.id}）`,
      })),
    [shopsQuery.data],
  )

  /** 各店铺门店列表拍平为一张总表 */
  const stores = useMemo(
    () => (storesQuery.data ?? []).flatMap((list) => list),
    [storesQuery.data],
  )

  /** 本地筛选：店铺、经营状态、关键词（门店名称 / 电话 / 地址） */
  const filteredStores = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return stores.filter((store) => {
      if (shopId !== undefined && store.shopId !== shopId) return false
      if (status !== undefined && store.status !== status) return false
      if (!kw) return true
      return [store.storeName, store.contactPhone, store.regionName, store.addressDetail].some(
        (value) => value?.toLowerCase().includes(kw),
      )
    })
  }, [stores, shopId, status, keyword])

  const lifecycleMutation = useChangeStoreLifecycle({
    onSuccess: (_data, variables) => {
      message.success(ACTION_META[variables.action].successText)
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '操作失败，请重试')
    },
  })

  const columns: ProColumns<StoreVo>[] = [
    ...buildStoreColumns((id) => (id ? shopNameById.get(id) : undefined)),
    {
      title: '操作',
      key: 'action',
      valueType: 'option',
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        const actions = record.status ? ACTIONS_BY_STATUS[record.status] : []
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

  const loading = shopsQuery.isLoading || storesQuery.isLoading || storesQuery.isFetching
  const loadError = shopsQuery.isError || storesQuery.isError
  const errorText =
    (shopsQuery.error instanceof ApiError && shopsQuery.error.message) ||
    (storesQuery.error instanceof ApiError && storesQuery.error.message) ||
    '门店数据加载失败，请重试'

  const refreshAll = () => {
    void shopsQuery.refetch()
    void storesQuery.refetch()
  }

  const emptyText =
    shopsQuery.isLoading || storesQuery.isLoading
      ? '加载中…'
      : shopsQuery.isError
        ? '店铺清单加载失败，请点击右上角刷新重试'
        : storesQuery.isError
          ? '门店数据加载失败，请点击右上角刷新重试'
          : shopIds.length === 0
            ? '暂无已通过审批的店铺：门店数据由已通过审批的店铺聚合而来'
            : stores.length === 0
              ? '所选店铺下暂无门店'
              : '当前筛选条件下暂无门店'

  return (
    <PageContainer
      header={{
        title: '门店经营',
        subTitle:
          '按店铺查看门店经营状态，支持冻结 / 停业 / 恢复 / 关店；关店为终态且须保证金已结清。',
        extra: [
          <Button key="refresh" onClick={refreshAll} loading={loading}>
            刷新
          </Button>,
        ],
      }}
    >
      {loadError && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message="门店数据加载失败"
          description={errorText}
        />
      )}
      <ProTable<StoreVo>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        dataSource={filteredStores}
        loading={loading}
        search={false}
        dateFormatter={false}
        headerTitle={`门店列表（${filteredStores.length} / 共 ${stores.length}）`}
        scroll={{ x: 'max-content' }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          showTotal: (total) => `共 ${total} 条`,
        }}
        options={{ density: true, reload: false, setting: true }}
        toolbar={{
          filter: (
            <Space wrap>
              <Select<number>
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="全部店铺"
                style={{ width: 240 }}
                loading={shopsQuery.isFetching}
                options={shopOptions}
                value={shopId}
                onChange={(value) => setShopId(value)}
              />
              <Select<ShopLifecycleStatus>
                allowClear
                placeholder="全部经营状态"
                style={{ width: 150 }}
                options={SHOP_LIFECYCLE_STATUS_OPTIONS}
                value={status}
                onChange={(value) => setStatus(value)}
              />
              <Input
                allowClear
                placeholder="搜索门店名称 / 电话 / 地址"
                style={{ width: 260 }}
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
              <Typography.Text type="secondary">
                {`共 ${stores.length} 家门店`}
              </Typography.Text>
            </Space>
          ),
        }}
        locale={{ emptyText }}
      />
    </PageContainer>
  )
}
