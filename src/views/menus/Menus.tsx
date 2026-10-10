import { PlusOutlined } from '@ant-design/icons'
import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import {
  Alert,
  App,
  Button,
  Popconfirm,
  Tag,
  Tooltip,
} from 'antd'
import { useMemo, useRef, useState } from 'react'

import { useDeleteMenu, useGetListMenus, useSaveMenu } from '../../api/menus'
import { ApiError } from '../../lib/request'
import type { ModalState } from './MenuModal'
import { MenuModal } from './MenuModal'

/** 节点类型元信息（见文档 AdminMenuSaveRequest.menuType） */
const MENU_TYPE_META: Record<AdminMenuType, { label: string; color: string }> = {
  M: { label: '目录', color: 'blue' },
  C: { label: '菜单', color: 'green' },
  A: { label: '按钮', color: 'orange' },
}

export function Menus() {
  const { message } = App.useApp()
  const [modal, setModal] = useState<ModalState | null>(null)
  const actionRef = useRef<ActionType>(null)

  const menusQuery = useGetListMenus()
  const menus = useMemo(() => menusQuery.data ?? [], [menusQuery.data])

  const saveMutation = useSaveMenu({
    onSuccess: (_, vars) => {
      message.success(vars.id === undefined ? '菜单新建成功' : '菜单更新成功')
      setModal(null)
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const deleteMutation = useDeleteMenu({
    onSuccess: () => {
      message.success('删除成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '删除失败，请重试')
    },
  })

  const columns: ProColumns<AdminMenuTreeNode>[] = [
      {
        title: '菜单名称',
        dataIndex: 'name',
        ellipsis: true,
      },
      {
        title: '类型',
        dataIndex: 'menuType',
        width: 100,
         render: (_, record) => (
          <Tag color={MENU_TYPE_META[record.menuType]?.color}>
            {MENU_TYPE_META[record.menuType]?.label ?? record.menuType}
          </Tag>
        ),
      },
      {
        title: '路由 / 组件',
        dataIndex: 'component',
        ellipsis: true,
         render: (_, record) => record.component || '-',
      },
      {
        title: '权限码',
        dataIndex: 'permissionCode',
        ellipsis: true,
         render: (_, record) => record.permissionCode || '-',
      },
      {
        title: '排序',
        dataIndex: 'sort',
        width: 80,
       },
      {
        title: '显示状态',
        dataIndex: 'show',
        width: 100,
         render: (_, record) =>
          record.show ? <Tag color="success">显示</Tag> : <Tag>隐藏</Tag>,
      },
      {
        title: '操作',
        key: 'action',
        width: 260,
        valueType: 'option',
        render: (_, record) => {
          const hasChildren = (record.children?.length ?? 0) > 0
          return [
            record.menuType !== 'A' && (
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
            <Tooltip
              key="delete"
              title={hasChildren ? '仅叶子节点可删除，请先删除子节点' : undefined}
            >
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
            </Tooltip>,
          ]
        },
      },
    ]

  return (
    <PageContainer
      header={{
        title: '菜单管理',
        subTitle: '后台菜单全量树（含隐藏节点），支持新建 / 编辑 / 删除叶子节点。',
      }}
    >
      {menusQuery.isError && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          title={
            menusQuery.error instanceof ApiError
              ? menusQuery.error.message
              : '菜单数据加载失败，请重试'
          }
        />
      )}

      <ProTable<AdminMenuTreeNode>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        dataSource={menus}
        loading={menusQuery.isLoading}
        pagination={false}
        search={false}
        dateFormatter={false}
        expandable={{ defaultExpandAllRows: true }}
        headerTitle="菜单列表"
        options={{
          reload: () => void menusQuery.refetch(),
          density: true,
        }}
        toolBarRender={() => [
          <Button
            key="new"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModal({ mode: 'create', pid: 0 })}
          >
            新建顶级菜单
          </Button>,
        ]}
        locale={{ emptyText: menusQuery.isError ? '加载失败，请重试' : '暂无菜单数据' }}
      />

      {modal && (
        <MenuModal
          key={modal.mode === 'edit' ? `edit-${modal.node.id}` : `create-${modal.pid}`}
          state={modal}
          tree={menus}
          saving={saveMutation.isPending}
          onCancel={() => setModal(null)}
          onSubmit={(params) =>
            saveMutation.mutate(
              modal.mode === 'edit' ? { id: modal.node.id, params } : { params },
            )
          }
        />
      )}
    </PageContainer>
  )
}
