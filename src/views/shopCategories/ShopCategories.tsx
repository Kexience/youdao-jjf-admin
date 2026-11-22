import { PlusOutlined } from '@ant-design/icons'
import type { ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { Alert, App, Button, Switch, Tooltip } from 'antd'
import type { Key } from 'react'
import { useMemo, useState } from 'react'

import {
  useCreateShopCategory,
  useGetShopCategoryTree,
  useSetShopCategoryStatus,
  useUpdateShopCategory,
} from '../../api/shopCategories'
import { ApiError } from '../../lib/request'
import { SHOP_CATEGORY_COLUMNS } from './columns'
import type { ShopCategoryModalState, ShopCategoryModalSubmit } from './ShopCategoryModal'
import { ShopCategoryModal } from './ShopCategoryModal'

/**
 * 行业分类页（/shop/category）：
 * - 数据：GET /admin/shop/taxonomy/categories，返回店铺与门店共用的两级树
 *   （含停用），不分页；表格按树展开；
 * - 新建：POST /admin/shop/taxonomy/categories，可从工具栏建一级、
 *   或从一级行内「新增子级」建二级（分类最多两级）；
 * - 编辑：POST /admin/shop/taxonomy/categories/{id}，仅名称 / 图标 / 排序，
 *   不支持移动父级；
 * - 启停：POST /admin/shop/taxonomy/categories/{id}/status，行内开关；
 *   带子级的一级分类不可停用（后端校验，前端置灰并提示先停用子分类）；
 * - 分类无删除：历史单据引用 id+name 快照，不再使用只停用。
 */
export function ShopCategories() {
  const { message } = App.useApp()

  const [modal, setModal] = useState<ShopCategoryModalState | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>()

  const categoriesQuery = useGetShopCategoryTree()
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data])

  /** 默认展开全部一级分类；用户手动折叠后就以用户的选择为准 */
  const defaultExpandedKeys = useMemo(() => categories.map((node) => node.id), [categories])

  const createMutation = useCreateShopCategory({
    onSuccess: () => {
      message.success('分类新建成功')
      setModal(null)
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const updateMutation = useUpdateShopCategory({
    onSuccess: () => {
      message.success('分类更新成功')
      setModal(null)
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const statusMutation = useSetShopCategoryStatus({
    onSuccess: (_, vars) => {
      message.success(vars.enabled ? '分类已启用' : '分类已停用')
      setTogglingId(null)
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '状态切换失败，请重试')
      setTogglingId(null)
    },
  })

  const handleExpand = (expanded: boolean, record: ShopCategoryNode) => {
    const base = expandedRowKeys ?? defaultExpandedKeys
    setExpandedRowKeys(
      expanded ? [...base, record.id] : base.filter((key) => key !== record.id),
    )
  }

  const handleSubmit = (submit: ShopCategoryModalSubmit) => {
    if (submit.mode === 'create') {
      createMutation.mutate(submit.params)
      return
    }
    updateMutation.mutate({ id: submit.id, params: submit.params })
  }

  const columns: ProColumns<ShopCategoryNode>[] = [
    ...SHOP_CATEGORY_COLUMNS,
    {
      title: '状态',
      dataIndex: 'status',
      width: 130,
      render: (_, record) => {
        const enabled = record.status === 1
        const childCount = record.children?.length ?? 0
        // 带子级的一级分类不可停用（后端 ShopTaxonomyService 校验）
        const blocked = enabled && childCount > 0
        const toggle = (
          <Switch
            size="small"
            checked={enabled}
            disabled={blocked}
            loading={statusMutation.isPending && togglingId === record.id}
            checkedChildren="启用"
            unCheckedChildren="停用"
            onChange={(checked) => {
              setTogglingId(record.id)
              statusMutation.mutate({ id: record.id, enabled: checked })
            }}
          />
        )
        return blocked ? (
          <Tooltip title={`该分类下还有 ${childCount} 个子分类，须先停用子分类`}>
            <span>{toggle}</span>
          </Tooltip>
        ) : (
          toggle
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      valueType: 'option',
      render: (_, record) => [
        record.pid === 0 && (
          <Button
            key="add"
            type="link"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setModal({ mode: 'create', pid: record.id })}
          >
            新增子级
          </Button>
        ),
        <Button
          key="edit"
          type="link"
          size="small"
          onClick={() => setModal({ mode: 'edit', node: record })}
        >
          编辑
        </Button>,
      ],
    },
  ]

  const handleReload = () => {
    setExpandedRowKeys(undefined)
    void categoriesQuery.refetch()
  }

  return (
    <PageContainer
      header={{
        title: '行业分类',
      }}
    >
      {categoriesQuery.isError && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message={
            categoriesQuery.error instanceof ApiError
              ? categoriesQuery.error.message
              : '行业分类加载失败，请重试'
          }
        />
      )}

      <ProTable<ShopCategoryNode>
        rowKey="id"
        columns={columns}
        dataSource={categories}
        loading={categoriesQuery.isLoading}
        pagination={false}
        search={false}
        dateFormatter={false}
        expandable={{
          expandedRowKeys: expandedRowKeys ?? defaultExpandedKeys,
          onExpand: handleExpand,
        }}
        scroll={{ x: 'max-content' }}
        options={{
          reload: handleReload,
          density: true,
        }}
        toolBarRender={() => [
          <Button
            key="new"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModal({ mode: 'create', pid: 0 })}
          >
            新建一级分类
          </Button>,
        ]}
        locale={{
          emptyText: categoriesQuery.isError
            ? '加载失败，请点击右上角刷新重试'
            : '暂无行业分类，点击右上角新建一级分类',
        }}
      />

      {modal && (
        <ShopCategoryModal
          key={modal.mode === 'edit' ? `edit-${modal.node.id}` : `create-${modal.pid}`}
          state={modal}
          tree={categories}
          saving={createMutation.isPending || updateMutation.isPending}
          onCancel={() => setModal(null)}
          onSubmit={handleSubmit}
        />
      )}
    </PageContainer>
  )
}
