import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { useNavigate } from '@tanstack/react-router'
import { App, Button, Popconfirm } from 'antd'
import { useRef } from 'react'

import { fetchAdminUsers, useResetAdminUserPassword, useUpdateAdminUserStatus } from '../../api/adminUsers'
import { useGetRoles } from '../../api/roles'
import { ApiError } from '../../lib/request'
import { AdminUserResetPasswordModal } from './AdminUserResetPasswordModal'
import { getAdminUserColumns } from './columns'

/**
 * 管理员管理页：GET 分页检索 /admin/users。
 * 服务端分页 + 条件检索走 ProTable request，参数以文档为准：
 * username（用户名模糊）/ realname（真实姓名模糊）/ status（1正常 0禁用）
 * / roleId（角色 id 精确）/ unassignedOnly（是否只看无角色）。
 */
export function AdminUsers() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const actionRef = useRef<ActionType>(null)
  // 角色筛选项来自角色列表
  const rolesQuery = useGetRoles()

  const statusMutation = useUpdateAdminUserStatus({
    onSuccess: (_, vars) => {
      message.success(vars.status === 1 ? '管理员已启用' : '管理员已禁用')
      actionRef.current?.reload()
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '操作失败，请重试')
    },
  })

  const resetPasswordMutation = useResetAdminUserPassword({
    onSuccess: () => {
      message.success('密码重置成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '操作失败，请重试')
    },
  })

  const columns: ProColumns<AdminUser>[] = [
    ...getAdminUserColumns(rolesQuery.data ?? []),
    {
      title: '操作',
      key: 'action',
      width: 220,
      valueType: 'option',
      render: (_, record) => {
        const disabled = record.status === 0
        return [
          <Button
            key="detail"
            type="link"
            size="small"
            onClick={() =>
              void navigate({
                to: '/users/$userId',
                params: { userId: String(record.id) },
              })
            }
          >
            详情
          </Button>,
          <Popconfirm
            key="status"
            title={disabled ? '确认启用该管理员吗？' : '确认禁用该管理员吗？'}
            onConfirm={() =>
              statusMutation.mutate({ id: record.id, status: disabled ? 1 : 0 })
            }
            okButtonProps={{ loading: statusMutation.isPending }}
          >
            <Button type="link" size="small" danger={!disabled}>
              {disabled ? '启用' : '禁用'}
            </Button>
          </Popconfirm>,
          <AdminUserResetPasswordModal
            key="reset-password"
            user={record}
            saving={resetPasswordMutation.isPending}
            onSubmit={(params) =>
              resetPasswordMutation.mutateAsync({ id: record.id, params })
            }
            trigger={
              <Button type="link" size="small" danger>
                重置密码
              </Button>
            }
          />,
        ]
      },
    },
  ]

  return (
    <PageContainer
      header={{
        title: '管理员管理',
        subTitle: '按用户名 / 真实姓名 / 状态 / 角色检索，创建时间倒序。',
      }}
    >
      <ProTable<AdminUser>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          try {
            // status 0 为 falsy，不能用 || 过滤；ProTable select 回传可能是字符串，需转数字
            const rawStatus = params.status as string | number | undefined
            const status =
              rawStatus === undefined || rawStatus === ''
                ? undefined
                : (Number(rawStatus) as 0 | 1)
            const rawRoleId = params.roleId as string | number | undefined
            const roleId =
              rawRoleId === undefined || rawRoleId === '' ? undefined : Number(rawRoleId)
            // unassignedOnly 只在选“是”时传 true，其余视为不过滤
            const rawUnassigned = params.unassignedOnly as string | boolean | undefined
            const unassignedOnly = rawUnassigned === true || rawUnassigned === 'true' ? true : undefined
            const data = await fetchAdminUsers({
              page: params.current ?? 1,
              size: params.pageSize ?? 10,
              username: (params.username as string | undefined)?.trim() || undefined,
              realname: (params.realname as string | undefined)?.trim() || undefined,
              status,
              roleId,
              unassignedOnly,
            })
            return { data: data.records, total: data.total, success: true }
          } catch (error) {
            return {
              data: [],
              total: 0,
              success: false,
              errorMessage: error instanceof ApiError ? error.message : '加载失败，请重试',
            }
          }
        }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        dateFormatter={false}
        scroll={{ x: 'max-content' }}
        options={{ density: true }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            onClick={() => void navigate({ to: '/users/new' })}
          >
            新建管理员
          </Button>,
        ]}
      />
    </PageContainer>
  )
}
