import type { ProDescriptionsColumn, ProFieldValueType } from '@ant-design/pro-components'
import { PageContainer, ProDescriptions } from '@ant-design/pro-components'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Alert, App, Button, Popconfirm, Skeleton, Tag } from 'antd'

import { fetchAdminUserDetail, useResetAdminUserPassword, useUpdateAdminUser, useUpdateAdminUserStatus } from '../../api/adminUsers'
import { ApiError } from '../../lib/request'
import { AdminUserEditModal } from './AdminUserEditModal'
import { AdminUserResetPasswordModal } from './AdminUserResetPasswordModal'

interface AdminUserDetailProps {
  userId: number
}

/**
 * 详情描述列：时间戳统一用 valueType dateTime 交给 ProField 格式化，
 * 空值由 emptyText 兜底为 -，不再手写原串。
 */
const DETAIL_COLUMNS: ProDescriptionsColumn<AdminUser, ProFieldValueType>[] = [
  {
    title: '状态',
    dataIndex: 'status',
    render: (_, record) =>
      record.status === 1 ? (
        <Tag color="success">正常</Tag>
      ) : record.status === 0 ? (
        <Tag color="error">禁用</Tag>
      ) : (
        '-'
      ),
  },
  { title: '用户名', dataIndex: 'username' },
  { title: '真实姓名', dataIndex: 'realname' },
  { title: '昵称', dataIndex: 'nickname' },
  { title: '手机号', dataIndex: 'phone' },
  { title: '邮箱', dataIndex: 'email' },
  { title: '头像', dataIndex: 'avatar' },
  {
    title: '所属角色',
    dataIndex: 'roleName',
    render: (_, record) => record.roleName || '无角色',
  },
  {
    title: '角色 id',
    dataIndex: 'roleId',
    render: (_, record) => record.roleId ?? '无',
  },
  { title: '备注', dataIndex: 'remark' },
  { title: '最近登录时间', dataIndex: 'lastLoginAt', valueType: 'dateTime' },
  { title: '创建时间', dataIndex: 'createdAt', valueType: 'dateTime' },
  { title: '更新时间', dataIndex: 'updatedAt', valueType: 'dateTime' },
]

/**
 * 管理员详情页：GET /admin/users/{id} 展示全部字段，支持编辑资料与启停。
 * 独立路由页面（/users/$userId），用户名 / 密码 / 角色不在此改，
 * 后续对应接口完成后在该页面扩展入口。
 */
export function AdminUserDetail({ userId }: AdminUserDetailProps) {
  const { message } = App.useApp()

  const detailQuery = useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: () => fetchAdminUserDetail(userId),
  })

  const updateMutation = useUpdateAdminUser({
    onSuccess: () => {
      message.success('管理员资料更新成功')
      void detailQuery.refetch()
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const statusMutation = useUpdateAdminUserStatus({
    onSuccess: (_, vars) => {
      message.success(vars.status === 1 ? '管理员已启用' : '管理员已禁用')
      void detailQuery.refetch()
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

  const detail = detailQuery.data
  const disabled = detail?.status === 0

  return (
    <PageContainer
      header={{
        title: `管理员详情`,
        subTitle: '管理员基础信息与角色状态，支持编辑资料与启停。',
        extra: [
          <Link key="back" to="/users">
            <Button>返回列表</Button>
          </Link>,
          detail && (
            <Popconfirm
              key="status"
              title={disabled ? '确认启用该管理员吗？' : '确认禁用该管理员吗？'}
              onConfirm={() =>
                statusMutation.mutate({ id: userId, status: disabled ? 1 : 0 })
              }
              okButtonProps={{ loading: statusMutation.isPending }}
            >
              <Button type="primary" danger={!disabled}>
                {disabled ? '启用' : '禁用'}
              </Button>
            </Popconfirm>
          ),
          detail && (
            <AdminUserResetPasswordModal
              key="reset-password"
              user={detail}
              saving={resetPasswordMutation.isPending}
              onSubmit={(params) =>
                resetPasswordMutation.mutateAsync({ id: userId, params })
              }
              trigger={<Button danger>重置密码</Button>}
            />
          ),
          detail && (
            <AdminUserEditModal
              key="edit"
              user={detail}
              saving={updateMutation.isPending}
              onSubmit={(params) => updateMutation.mutateAsync({ id: userId, params })}
            />
          ),
        ],
      }}
    >
      {detailQuery.isPending && <Skeleton active paragraph={{ rows: 8 }} />}
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
        <ProDescriptions<AdminUser, ProFieldValueType>
          column={2}
          bordered
          size="small"
          emptyText="-"
          dataSource={detail}
          columns={DETAIL_COLUMNS}
        />
      )}
    </PageContainer>
  )
}
