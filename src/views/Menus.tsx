import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  TreeSelect,
} from 'antd'
import type { TableColumnsType } from 'antd'
import { useMemo, useState } from 'react'

import { createMenu, deleteMenu, listMenus, updateMenu } from '../api/menus'
import { ApiError } from '../lib/request'

/** 菜单管理列表查询键：增删改成功后按此键失效缓存 */
const MENUS_QUERY_KEY = ['admin-menus'] as const

/** 节点类型元信息（见文档 AdminMenuSaveRequest.menuType） */
const MENU_TYPE_META: Record<AdminMenuType, { label: string; color: string }> = {
  M: { label: '目录', color: 'blue' },
  C: { label: '菜单', color: 'green' },
  A: { label: '按钮', color: 'orange' },
}

/** 弹窗表单值：与 AdminMenuSaveParams 一一对应 */
interface MenuFormValues {
  pid: number
  name: string
  menuType: AdminMenuType
  icon?: string
  component?: string
  sort?: number
  isShow: 0 | 1
  permissionCode?: string
}

type ModalState = { mode: 'create'; pid: number } | { mode: 'edit'; node: AdminMenuTreeNode }

/** 收集节点自身及所有后代 id（编辑时禁用这些父级选项，避免形成环） */
function collectSubtreeIds(node: AdminMenuTreeNode): Set<number> {
  const ids = new Set<number>([node.id])
  const walk = (children?: AdminMenuTreeNode[]) => {
    for (const child of children ?? []) {
      ids.add(child.id)
      walk(child.children)
    }
  }
  walk(node.children)
  return ids
}

/** 父级选择器选项：与 TreeSelect treeData 的 {title, value, children} 对齐 */
interface ParentOption {
  title: string
  value: number
  disabled?: boolean
  children?: ParentOption[]
}

/** 菜单树 → TreeSelect 父级选项（顶级 pid=0 与各节点平级） */
function toParentOptions(nodes: AdminMenuTreeNode[], disabledIds: Set<number>): ParentOption[] {
  const walk = (list: AdminMenuTreeNode[]): ParentOption[] =>
    list.map((node) => ({
      title: node.name,
      value: node.id,
      disabled: disabledIds.has(node.id),
      children: node.children?.length ? walk(node.children) : undefined,
    }))
  return [{ title: '顶级（无父级）', value: 0 }, ...walk(nodes)]
}

export function Menus() {
  const { message } = App.useApp()
  const queryClient = useQueryClient()
  const [modal, setModal] = useState<ModalState | null>(null)

  const menusQuery = useQuery({ queryKey: MENUS_QUERY_KEY, queryFn: listMenus })
  const menus = useMemo(() => menusQuery.data ?? [], [menusQuery.data])

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: MENUS_QUERY_KEY })

  const saveMutation = useMutation({
    mutationFn: (input: { state: ModalState; params: AdminMenuSaveParams }) =>
      input.state.mode === 'edit'
        ? updateMenu(input.state.node.id, input.params)
        : createMenu(input.params),
    onSuccess: (_, input) => {
      message.success(input.state.mode === 'edit' ? '菜单更新成功' : '菜单新建成功')
      setModal(null)
      void invalidate()
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMenu(id),
    onSuccess: () => {
      message.success('删除成功')
      void invalidate()
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '删除失败，请重试')
    },
  })

  const columns: TableColumnsType<AdminMenuTreeNode> = useMemo(
    () => [
      { title: '菜单名称', dataIndex: 'name', key: 'name', ellipsis: true },
      {
        title: '类型',
        dataIndex: 'menuType',
        key: 'menuType',
        width: 100,
        render: (value: AdminMenuType) => (
          <Tag color={MENU_TYPE_META[value]?.color}>{MENU_TYPE_META[value]?.label ?? value}</Tag>
        ),
      },
      {
        title: '路由 / 组件',
        dataIndex: 'component',
        key: 'component',
        ellipsis: true,
        render: (value?: string) => value || '-',
      },
      {
        title: '权限码',
        dataIndex: 'permissionCode',
        key: 'permissionCode',
        ellipsis: true,
        render: (value?: string) => value || '-',
      },
      { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
      {
        title: '显示状态',
        dataIndex: 'show',
        key: 'show',
        width: 100,
        render: (value: boolean) =>
          value ? <Tag color="success">显示</Tag> : <Tag>隐藏</Tag>,
      },
      {
        title: '操作',
        key: 'action',
        width: 260,
        render: (_, record) => {
          const hasChildren = (record.children?.length ?? 0) > 0
          return (
            <Space size="small">
              {record.menuType !== 'A' && (
                <Button
                  type="link"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => setModal({ mode: 'create', pid: record.id })}
                >
                  新增子级
                </Button>
              )}
              <Button type="link" size="small" onClick={() => setModal({ mode: 'edit', node: record })}>
                编辑
              </Button>
              <Tooltip title={hasChildren ? '仅叶子节点可删除，请先删除子节点' : undefined}>
                <Popconfirm
                  title="确认删除该菜单节点吗？"
                  description="仅叶子节点可删除，删除后不可恢复。"
                  disabled={hasChildren}
                  onConfirm={() => deleteMutation.mutate(record.id)}
                  okButtonProps={{ loading: deleteMutation.isPending }}
                >
                  <Button type="link" size="small" danger disabled={hasChildren}>
                    删除
                  </Button>
                </Popconfirm>
              </Tooltip>
            </Space>
          )
        },
      },
    ],
    [deleteMutation],
  )

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>菜单管理</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--ant-color-text-secondary)' }}>
            后台菜单全量树（含隐藏节点），支持新建 / 编辑 / 删除叶子节点。
          </p>
        </div>
        <Space style={{ marginLeft: 'auto' }}>
          <Button
            icon={<ReloadOutlined />}
            loading={menusQuery.isFetching}
            onClick={() => void menusQuery.refetch()}
          >
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModal({ mode: 'create', pid: 0 })}>
            新建顶级菜单
          </Button>
        </Space>
      </div>

      {menusQuery.isError && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message={
            menusQuery.error instanceof ApiError
              ? menusQuery.error.message
              : '菜单数据加载失败，请重试'
          }
        />
      )}

      <Table<AdminMenuTreeNode>
        rowKey="id"
        columns={columns}
        dataSource={menus}
        loading={menusQuery.isLoading}
        pagination={false}
        defaultExpandAllRows
        locale={{ emptyText: menusQuery.isError ? '加载失败，请重试' : '暂无菜单数据' }}
      />

      {modal && (
        <MenuModal
          key={modal.mode === 'edit' ? `edit-${modal.node.id}` : `create-${modal.pid}`}
          state={modal}
          tree={menus}
          saving={saveMutation.isPending}
          onCancel={() => setModal(null)}
          onSubmit={(params) => saveMutation.mutate({ state: modal, params })}
        />
      )}
    </section>
  )
}

interface MenuModalProps {
  state: ModalState
  tree: AdminMenuTreeNode[]
  saving: boolean
  onCancel: () => void
  onSubmit: (params: AdminMenuSaveParams) => void
}

/** 新建 / 编辑菜单弹窗（挂载即按当前 state 初始化，关闭即卸载） */
function MenuModal({ state, tree, saving, onCancel, onSubmit }: MenuModalProps) {
  const [form] = Form.useForm<MenuFormValues>()
  const isEdit = state.mode === 'edit'

  const disabledIds = useMemo(
    () => (isEdit ? collectSubtreeIds((state as { node: AdminMenuTreeNode }).node) : new Set<number>()),
    [isEdit, state],
  )
  const parentOptions = useMemo(() => toParentOptions(tree, disabledIds), [tree, disabledIds])

  const initialValues: MenuFormValues = isEdit
    ? (() => {
        const node = (state as { node: AdminMenuTreeNode }).node
        return {
          pid: node.pid,
          name: node.name,
          menuType: node.menuType,
          icon: node.icon,
          component: node.component,
          sort: node.sort,
          isShow: (node.show ? 1 : 0) as 0 | 1,
          permissionCode: node.permissionCode,
        }
      })()
    : {
        pid: (state as { pid: number }).pid,
        name: '',
        menuType: 'C',
        sort: 0,
        isShow: 1 as const,
      }

  const handleFinish = (values: MenuFormValues) => {
    onSubmit({
      pid: values.pid,
      name: values.name.trim(),
      menuType: values.menuType,
      icon: values.icon?.trim() || undefined,
      component: values.component?.trim() || undefined,
      sort: values.sort ?? 0,
      isShow: values.isShow,
      permissionCode: values.permissionCode?.trim() || undefined,
    })
  }

  return (
    <Modal
      title={isEdit ? '编辑菜单节点' : '新建菜单节点'}
      open
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={saving}
      okText="保存"
      cancelText="取消"
    >
      <Form<MenuFormValues>
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleFinish}
        preserve={false}
      >
        <Form.Item
          name="pid"
          label="父级节点"
          rules={[{ required: true, message: '请选择父级节点' }]}
        >
          <TreeSelect
            placeholder="请选择父级节点"
            treeData={parentOptions}
            treeDefaultExpandAll
            allowClear={false}
          />
        </Form.Item>
        <Form.Item
          name="name"
          label="节点名称"
          rules={[
            { required: true, message: '请输入节点名称' },
            { max: 100, message: '节点名称最多 100 个字符' },
          ]}
        >
          <Input placeholder="请输入节点名称" maxLength={100} />
        </Form.Item>
        <Form.Item
          name="menuType"
          label="节点类型"
          rules={[{ required: true, message: '请选择节点类型' }]}
        >
          <Select
            placeholder="请选择节点类型"
            options={[
              { value: 'M', label: 'M · 目录' },
              { value: 'C', label: 'C · 菜单' },
              { value: 'A', label: 'A · 按钮' },
            ]}
          />
        </Form.Item>
        <Form.Item name="icon" label="图标" rules={[{ max: 255, message: '图标最多 255 个字符' }]}>
          <Input placeholder="图标标识（可选）" maxLength={255} />
        </Form.Item>
        <Form.Item
          name="component"
          label="前端路由 / 组件路径"
          rules={[{ max: 200, message: '组件路径最多 200 个字符' }]}
        >
          <Input placeholder="如 /system/menus（可选）" maxLength={200} />
        </Form.Item>
        <Form.Item name="sort" label="同级排序（小值在前）">
          <InputNumber min={0} style={{ width: '100%' }} placeholder="默认为 0" />
        </Form.Item>
        <Form.Item name="isShow" label="是否进菜单树">
          <Radio.Group
            options={[
              { value: 1, label: '显示' },
              { value: 0, label: '隐藏' },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="permissionCode"
          label="权限码（目录可空）"
          rules={[{ max: 64, message: '权限码最多 64 个字符' }]}
        >
          <Input placeholder="引用的权限码（可选）" maxLength={64} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
