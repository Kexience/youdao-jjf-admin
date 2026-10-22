import type { ProDescriptionsColumn } from '@ant-design/pro-components'
import { PageContainer, ProDescriptions } from '@ant-design/pro-components'
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router'
import { Alert, App, Button, Card, Empty, Popconfirm, Skeleton, Space, Tag, Typography } from 'antd'
import { useMemo } from 'react'

import { useGetActiveDistrictAgent, useRevokeDistrictAgent } from '../../api/districtAgents'
import { RegionDistrictCascader } from '../../components/RegionDistrictCascader'
import { ApiError } from '../../lib/request'
import { renderDistrictAgentStatus, renderMember, renderRegion } from './columns'

/** 区代附件只读展示（核对在任区代材料） */
function AttachmentsPreview({ attachments }: { attachments?: DistrictAgentAttachment[] }) {
  if (!attachments?.length) {
    return <Typography.Text type="secondary">无附件</Typography.Text>
  }
  return (
    <Space direction="vertical" size={2}>
      {attachments.map((attachment) => (
        <a
          key={attachment.id}
          href={attachment.fileUrl || undefined}
          target="_blank"
          rel="noreferrer"
        >
          {attachment.fileType || '附件'} · {attachment.fileUrl}
        </a>
      ))}
    </Space>
  )
}

/** 在任区代详情列（字段与文档 DistrictAgentVo 对齐） */
const DETAIL_COLUMNS: ProDescriptionsColumn<DistrictAgent>[] = [
  {
    title: '所属区域',
    dataIndex: 'regionId',
    render: (_, record) =>
      record.region ? renderRegion(record.region) : (record.regionId ?? '-'),
  },
  {
    title: '在任会员',
    dataIndex: 'memberId',
    render: (_, record) =>
      record.member ? (
        renderMember(record.member)
      ) : record.memberId ? (
        <Link
          to="/members/$memberId"
          params={{ memberId: String(record.memberId) }}
        >
          会员 {record.memberId}
        </Link>
      ) : (
        '-'
      ),
  },
  {
    title: '状态',
    dataIndex: 'status',
    render: (_, record) => renderDistrictAgentStatus(record.status),
  },
  {
    title: '上任时间',
    dataIndex: 'assignedAt',
    valueType: 'dateTime',
  },
  {
    title: '提交时间',
    dataIndex: 'createdAt',
    valueType: 'dateTime',
  },
  {
    title: '最后操作人 id',
    dataIndex: 'operatorId',
  },
  {
    title: '备注',
    dataIndex: 'remark',
    span: 2,
    render: (_, record) => record.remark || '-',
  },
  {
    title: '附件',
    dataIndex: 'attachments',
    span: 2,
    render: (_, record) => <AttachmentsPreview attachments={record.attachments} />,
  },
]

/**
 * 在任区代查询（/agent/district-agents/active）：
 * - 区域选择：复用行政区划接口（GET /admin/region/children）做省/市/区县级联，
 *   选中区县后取其 sys_region.id 作为 regionId；
 * - 查询：GET /admin/agent/district-agents/active?regionId={regionId}
 * - 撤销：POST /admin/agent/district-agents/{agentId}/revoke
 *
 * regionId 与区划码同时写入 URL search，刷新/分享后可直接复现查询与级联回显。
 * 待审区代列表的行内「在任区代」入口会带参跳到本页。
 */
export function DistrictAgentActive() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const search = getRouteApi('/_main/agent/district-agents/active').useSearch()
  const regionId = search.regionId
  const regionCode = search.regionCode

  const activeQuery = useGetActiveDistrictAgent(regionId)

  const revokeMutation = useRevokeDistrictAgent({
    onSuccess: () => {
      message.success('已撤销该区在任区代')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '撤销失败，请重试')
    },
  })

  // 国标码路径可由区县码推导（省码=前 2 位+0000，市码=前 4 位+00），用于级联回显
  const regionPath = useMemo(() => {
    if (!regionCode || !/^\d{6}$/.test(regionCode)) return undefined
    return [
      `${regionCode.slice(0, 2)}0000`,
      `${regionCode.slice(0, 4)}00`,
      regionCode,
    ]
  }, [regionCode])

  const handleRegionChange = (district: RegionChild | undefined) => {
    if (!district) {
      void navigate({ to: '/agent/district-agents/active', search: {} })
      return
    }
    if (!district.id) {
      message.error('该区域未返回 region id，请确认后端已部署最新行政区划接口')
      return
    }
    void navigate({
      to: '/agent/district-agents/active',
      search: { regionId: district.id, regionCode: district.code },
    })
  }

  const agent = activeQuery.data ?? undefined
  const activeError =
    activeQuery.error instanceof ApiError
      ? activeQuery.error.message
      : '在任区代加载失败，请重试'

  return (
    <PageContainer
      header={{
        title: '在任区代',
        subTitle:
          '选择省 / 市 / 区县，查询该区当前在任的区代，可核对材料并撤销。',
        extra: [
          <Link key="pendings" to="/agent/district-agents/pendings">
            <Button>待审区代</Button>
          </Link>,
        ],
      }}
    >
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <RegionDistrictCascader
            value={regionPath}
            onChange={handleRegionChange}
            style={{ width: 320 }}
          />
          {regionId !== undefined && <Tag color="blue">区域 id：{regionId}</Tag>}
          <Typography.Text type="secondary">
            选择到区 / 县后自动查询
          </Typography.Text>
        </Space>
      </Card>

      {regionId === undefined ? (
        <Card>
          <Empty description="选择省 / 市 / 区县后自动查询该区在任区代" />
        </Card>
      ) : activeQuery.isError ? (
        <Card>
          <Alert type="error" showIcon title={activeError} />
        </Card>
      ) : activeQuery.isPending ? (
        <Card>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      ) : !agent ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="该区域当前没有在任区代"
          >
            <Link to="/agent/district-agents/pendings">
              <Button type="primary">查看待审区代</Button>
            </Link>
          </Empty>
        </Card>
      ) : (
        <Card
          title="区代信息"
          extra={
            <Space>
              {agent.member && (
                <Link
                  to="/members/$memberId"
                  params={{ memberId: String(agent.member.id) }}
                >
                  <Button>会员详情</Button>
                </Link>
              )}
              <Button
                onClick={() => void activeQuery.refetch()}
                loading={activeQuery.isFetching}
              >
                刷新
              </Button>
              <Popconfirm
                title="撤销该区在任区代？"
                description="撤销后该区域将回到无区代状态，操作不可恢复。"
                okText="确认撤销"
                okButtonProps={{ danger: true }}
                onConfirm={() => revokeMutation.mutateAsync(agent.id)}
              >
                <Button danger loading={revokeMutation.isPending}>
                  撤销区代
                </Button>
              </Popconfirm>
            </Space>
          }
        >
          <ProDescriptions<DistrictAgent>
            column={2}
            bordered
            size="small"
            emptyText="-"
            dataSource={agent}
            columns={DETAIL_COLUMNS}
          />
        </Card>
      )}
    </PageContainer>
  )
}
