import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { PageContainer } from '@ant-design/pro-components'
import { Alert, App, Button, Descriptions, Popconfirm, Skeleton, Tag } from 'antd'

import { fetchMemberDetail, useUpdateMemberStatus } from '../../api/members'
import { ApiError } from '../../lib/request'
import { MEMBER_SEX_TEXT } from './columns'

interface MemberDetailProps {
  memberId: number
}

/**
 * 会员详情页：GET /admin/members/{id} 展示全部字段，支持禁用 / 解禁。
 * 独立路由页面（/members/$memberId），后续复杂功能（等级历史、推荐链等）
 * 以嵌套路由形式挂到该页面下扩展。
 */
export function MemberDetail({ memberId }: MemberDetailProps) {
  const { message } = App.useApp()

  const detailQuery = useQuery({
    queryKey: ['member-detail', memberId],
    queryFn: () => fetchMemberDetail(memberId),
  })

  const statusMutation = useUpdateMemberStatus({
    onSuccess: (_, vars) => {
      message.success(vars.status === 1 ? '会员已解禁' : '会员已禁用')
      void detailQuery.refetch()
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '操作失败，请重试')
    },
  })

  const detail = detailQuery.data
  const banned = detail?.status === 0

  return (
    <PageContainer
      header={{
        title: `会员详情（id ${memberId}）`,
        subTitle: '会员基础信息与登录状态，支持禁用 / 解禁。',
        extra: [
          <Link key="back" to="/members">
            <Button>返回列表</Button>
          </Link>,
          detail && (
            <Popconfirm
              key="status"
              title={banned ? '确认解禁该会员吗？' : '确认禁用该会员吗？'}
              description={banned ? undefined : '禁用后该会员将被踢下线。'}
              onConfirm={() =>
                statusMutation.mutate({ id: memberId, status: banned ? 1 : 0 })
              }
              okButtonProps={{ loading: statusMutation.isPending }}
            >
              <Button type="primary" danger={!banned}>
                {banned ? '解禁' : '禁用'}
              </Button>
            </Popconfirm>
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
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="会员 id">{detail.id}</Descriptions.Item>
          <Descriptions.Item label="状态">
            {detail.status === 1 ? (
              <Tag color="success">正常</Tag>
            ) : detail.status === 0 ? (
              <Tag color="error">禁用</Tag>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="手机号">{detail.mobile || '-'}</Descriptions.Item>
          <Descriptions.Item label="用户名">{detail.username || '-'}</Descriptions.Item>
          <Descriptions.Item label="昵称">{detail.nickname || '-'}</Descriptions.Item>
          <Descriptions.Item label="真实姓名">{detail.realname || '-'}</Descriptions.Item>
          <Descriptions.Item label="性别">
            {detail.sex !== undefined ? (MEMBER_SEX_TEXT[detail.sex] ?? '-') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="生日">{detail.birthday || '-'}</Descriptions.Item>
          <Descriptions.Item label="等级">{detail.levelName || '-'}</Descriptions.Item>
          <Descriptions.Item label="成长值">{detail.growth ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="注册渠道">{detail.registerChannel || '-'}</Descriptions.Item>
          <Descriptions.Item label="注册时间">{detail.registerAt || '-'}</Descriptions.Item>
          <Descriptions.Item label="最后登录时间">{detail.lastLoginAt || '-'}</Descriptions.Item>
          <Descriptions.Item label="最后登录 IP">{detail.lastLoginIp || '-'}</Descriptions.Item>
          <Descriptions.Item label="最后登录渠道">{detail.lastLoginChannel || '-'}</Descriptions.Item>
          <Descriptions.Item label="最后访问时间">{detail.lastVisitAt || '-'}</Descriptions.Item>
          <Descriptions.Item label="消费日限额（元）">
            {detail.dailyConsumptionLimit ?? '不限'}
          </Descriptions.Item>
          <Descriptions.Item label="消费月限额（元）">
            {detail.monthlyConsumptionLimit ?? '不限'}
          </Descriptions.Item>
        </Descriptions>
      )}
    </PageContainer>
  )
}
