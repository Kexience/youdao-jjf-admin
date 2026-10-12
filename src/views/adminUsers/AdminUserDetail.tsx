import type { ProDescriptionsColumn, ProFieldValueType } from '@ant-design/pro-components'
import { PageContainer, ProDescriptions } from '@ant-design/pro-components'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { App, Avatar, Button, Card, Popconfirm, Skeleton, Tag } from 'antd'
import { useState } from 'react'

import { fetchAdminUserDetail, useUpdateAdminUser, useUpdateAdminUserStatus } from '../../api/adminUsers'
import { ApiError } from '../../lib/request'
import { AdminUserEditModal } from './AdminUserEditModal'
import { AdminUserResetPasswordModal } from './AdminUserResetPasswordModal'
import { AdminUserRoleAssignModal } from './AdminUserRoleAssignModal'

interface AdminUserDetailProps {
  userId: number
}

type DetailColumn = ProDescriptionsColumn<AdminUser, ProFieldValueType>

/**
 * 页头关键字段（对应案例单号区），头像单独放 extraContent 右侧展示。
 * 时间戳统一用 valueType dateTime 交给 ProField 格式化，空值由 emptyText 兜底为 -。
 */
const BASIC_COLUMNS: DetailColumn[] = [
  { title: '用户名', dataIndex: 'username' },
  { title: '昵称', dataIndex: 'nickname' },
  {
    title: '所属角色',
    dataIndex: 'roleName',
    render: (_, record) => record.roleName || '无角色',
  },
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
]

const CONTACT_COLUMNS: DetailColumn[] = [
  { title: '手机号', dataIndex: 'phone' },
  { title: '邮箱', dataIndex: 'email' },
  { title: '备注', dataIndex: 'remark' },
]

const TIME_COLUMNS: DetailColumn[] = [
  { title: '最近登录时间', dataIndex: 'lastLoginAt', valueType: 'dateTime' },
  { title: '创建时间', dataIndex: 'createdAt', valueType: 'dateTime' },
  { title: '更新时间', dataIndex: 'updatedAt', valueType: 'dateTime' },
]

/**
 * 详情 Tab 页签：暂只有「详情」，后续操作日志等在此扩展。
 */
const DETAIL_TAB_LIST = [{ key: 'detail', tab: '详情' }]

/**
 * 管理员详情页：GET /admin/users/{id} 展示全部字段，支持编辑资料与启停。
 * 独立路由页面（/users/$userId），用户名 / 密码 / 角色不在此改，
 * 后续对应接口完成后在该页面扩展入口。
 *
 * 布局参考 ant-design-pro 高级资料页：页头 content 区放关键字段、
 * extraContent 放头像，Tab 只在页头一层；主体用「用户信息」Card 包裹，
 * 内部各分组用带 title 的 Descriptions 排列。
 */
export function AdminUserDetail({ userId }: AdminUserDetailProps) {
  const { message } = App.useApp()
  const [tabActiveKey, setTabActiveKey] = useState<string>('detail')

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

  const detail = detailQuery.data
  const disabled = detail?.status === 0

  return (
    <PageContainer
      title="管理员详情"
      subTitle="管理员基础信息与角色状态，支持编辑资料与启停。"
      content={
        detail ? (
          <ProDescriptions<AdminUser, ProFieldValueType>
            column={3}
            size="small"
            emptyText="-"
            dataSource={detail}
            columns={BASIC_COLUMNS}
          />
        ) : undefined
      }
      extraContent={
        // 头像放页头右侧（对应案例 extraContent 的 Statistic 位置）
        detail ? (
          <Avatar
            size={64}
            src={detail.avatar || undefined}
            icon={!detail.avatar ? (detail.nickname || detail.username || '?').slice(0, 1) : undefined}
          />
        ) : undefined
      }
      tabList={DETAIL_TAB_LIST}
      tabActiveKey={tabActiveKey}
      onTabChange={setTabActiveKey}
      extra={[
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
            <AdminUserRoleAssignModal
              key="role"
              user={detail}
              trigger={<Button>分配角色</Button>}
            />
          ),
          detail && (
            <AdminUserResetPasswordModal
              key="reset-password"
              user={detail}
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
        ]}
    >
      {detailQuery.isPending && <Skeleton active paragraph={{ rows: 8 }} />}
      {detail && (
        <Card title="用户信息" variant="borderless" style={{ marginBottom: 24 }}>
          <ProDescriptions<AdminUser, ProFieldValueType>
            column={2}
            bordered
            size="small"
            emptyText="-"
            dataSource={detail}
            columns={CONTACT_COLUMNS}
            style={{ marginBottom: 24 }}
          />
          <ProDescriptions<AdminUser, ProFieldValueType>
            title="时间信息"
            column={2}
            bordered
            size="small"
            emptyText="-"
            dataSource={detail}
            columns={TIME_COLUMNS}
          />
        </Card>
      )}
    </PageContainer>
  )
}
