import { PageContainer } from '@ant-design/pro-components'
import { Link } from '@tanstack/react-router'
import { Alert, App, Button, Card, Descriptions, Skeleton, Tag } from 'antd'
import { useMemo } from 'react'

import { useGetListMenus } from '../../api/menus'
import { useGetRoleDetail, useGrantRolePermissions, useUpdateRole } from '../../api/roles'
import { ApiError } from '../../lib/request'
import { RoleEditModal } from './RoleEditModal'
import { RoleGrantModal } from './RoleGrantModal'

interface RoleDetailProps {
  roleId: number
}

/** 菜单全量树 → 权限码到节点名的映射（展示授权中文名用，同码取首个） */
function toPermissionNameMap(nodes: AdminMenuTreeNode[]): Map<string, string> {
  const map = new Map<string, string>()
  const walk = (items: AdminMenuTreeNode[]) => {
    for (const node of items) {
      if (node.permissionCode && !map.has(node.permissionCode)) {
        map.set(node.permissionCode, node.name)
      }
      if (node.children?.length) walk(node.children)
    }
  }
  walk(nodes)
  return map
}

/**
 * 角色详情页：GET /admin/roles/{id} 展示基础信息与已授予权限码。
 * 权限码中文名来自菜单全量树（GET /admin/menus）的 permissionCode 对应节点，
 * 树中找不到的码按原样展示。
 */
export function RoleDetail({ roleId }: RoleDetailProps) {
  const { message } = App.useApp()

  const detailQuery = useGetRoleDetail(roleId)
  const menusQuery = useGetListMenus()

  const updateMutation = useUpdateRole({
    onSuccess: () => {
      message.success('角色更新成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const grantMutation = useGrantRolePermissions({
    onSuccess: () => {
      message.success('角色授权更新成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const permissionNameMap = useMemo(
    () => toPermissionNameMap(menusQuery.data ?? []),
    [menusQuery.data],
  )

  const detail = detailQuery.data
  const permissionCodes = detail?.permissionCodes ?? []

  return (
    <PageContainer
      header={{
        title: '角色详情',
        subTitle: '角色基础信息与已授予权限码。',
        extra: [
          <Link key="back" to="/roles">
            <Button>返回列表</Button>
          </Link>,
          detail && (
            <RoleEditModal
              key="edit"
              role={detail}
              saving={updateMutation.isPending}
              onSubmit={(params) => updateMutation.mutateAsync({ id: roleId, params })}
            />
          ),
          detail && (
            <RoleGrantModal
              key="grant"
              role={detail}
              saving={grantMutation.isPending}
              onSubmit={(params) => grantMutation.mutateAsync({ id: roleId, params })}
            />
          ),
        ],
      }}
    >
      {detailQuery.isPending && <Skeleton active paragraph={{ rows: 6 }} />}
      {detailQuery.isError && (
        <Alert
          type="error"
          showIcon
          message={
            detailQuery.error instanceof ApiError ? detailQuery.error.message : '详情加载失败，请重试'
          }
        />
      )}
      {detail && (
        <>
          <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="状态">
              {detail.status === 1 ? (
                <Tag color="success">启用</Tag>
              ) : detail.status === 0 ? (
                <Tag>停用</Tag>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="角色名">{detail.roleName}</Descriptions.Item>
            <Descriptions.Item label="类型">
              {detail.builtin ? <Tag color="gold">内置</Tag> : <Tag color="blue">自建</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="内置标识">{detail.keyword || '-'}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{detail.updatedAt || '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{detail.createdAt || '-'}</Descriptions.Item>
          </Descriptions>
          <Card title={`已授予权限（${permissionCodes.length}）`} size="small">
            {permissionCodes.length === 0 ? (
              <span style={{ color: 'var(--ant-color-text-tertiary)' }}>暂无授权</span>
            ) : (
              permissionCodes.map((code) => {
                const name = permissionNameMap.get(code)
                return (
                  <Tag key={code} style={{ marginBottom: 8 }} title={name ? code : undefined}>
                    {name ?? code}
                  </Tag>
                )
              })
            )}
          </Card>
        </>
      )}
    </PageContainer>
  )
}
