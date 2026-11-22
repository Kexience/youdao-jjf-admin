import type { ProColumns } from '@ant-design/pro-components'
import { Link } from '@tanstack/react-router'
import { Avatar, Space, Tag, Typography } from 'antd'

/**
 * 区代模块列定义（与线上文档 DistrictAgentVo 字段对齐）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 */

/** 区代状态（见文档 DistrictAgentVo.status） */
export const DISTRICT_AGENT_STATUS_ENUM = {
  pending: { text: '待审核', color: 'warning' },
  active: { text: '在任', color: 'success' },
  rejected: { text: '已驳回', color: 'error' },
  revoked: { text: '已撤销', color: 'default' },
} as const

/** 区代状态展示（带颜色 Tag，未知值按原样展示） */
export function renderDistrictAgentStatus(status?: string) {
  if (!status) return '-'
  const meta =
    DISTRICT_AGENT_STATUS_ENUM[status as keyof typeof DISTRICT_AGENT_STATUS_ENUM]
  return <Tag color={meta?.color ?? 'default'}>{meta?.text ?? status}</Tag>
}

/** 区域层级（见文档 RegionView.level：1 省 2 地 3 区/县） */
const REGION_LEVEL_TEXT: Record<number, string> = {
  1: '省',
  2: '地市',
  3: '区/县',
}

/**
 * 会员展示：头像 + 昵称/用户名 + 手机号。
 * 点击整块会员信息跳到会员详情主 Tab（/member/$memberId，即「用户身份」）。
 */
export function renderMember(member?: MemberBrief) {
  if (!member) return '-'
  const name = member.nickname || member.username || member.mobile || `会员 ${member.id}`
  return (
    <Link to="/member/$memberId" params={{ memberId: String(member.id) }}>
      <Space>
        <Avatar src={member.avatar || undefined}>{name.slice(0, 1)}</Avatar>
        <div>
          <div>{name}</div>
          {member.mobile && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {member.mobile}
            </Typography.Text>
          )}
        </div>
      </Space>
    </Link>
  )
}

/** 区域展示：全称 + 层级 / 国标码 */
export function renderRegion(region?: RegionView) {
  if (!region) return '-'
  return (
    <Space size={4} wrap>
      <span>{region.name || region.shortName || region.id}</span>
      {region.level !== undefined && (
        <Tag color="geekblue">{REGION_LEVEL_TEXT[region.level] ?? `层级 ${region.level}`}</Tag>
      )}
      {region.code && (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {region.code}
        </Typography.Text>
      )}
    </Space>
  )
}

/**
 * 待审区代列（GET /admin/agent/district/pendings）。
 * 该页只有待审数据，检索条件由页面决定；操作列在页面内追加。
 */
export const DISTRICT_AGENT_PENDING_COLUMNS: ProColumns<DistrictAgent>[] = [
  {
    title: '会员',
    dataIndex: 'memberId',
    width: 220,
    search: false,
    render: (_, record) => renderMember(record.member),
  },
  {
    title: '所属区域',
    dataIndex: 'regionId',
    width: 240,
    search: false,
    render: (_, record) => renderRegion(record.region),
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    search: false,
    render: (_, record) => renderDistrictAgentStatus(record.status),
  },
  {
    title: '附件',
    dataIndex: 'attachments',
    width: 90,
    search: false,
    render: (_, record) =>
      record.attachments?.length ? (
        <Tag color="blue">{record.attachments.length} 个</Tag>
      ) : (
        <Tag>无</Tag>
      ),
  },
  {
    title: '备注',
    dataIndex: 'remark',
    ellipsis: true,
    search: false,
    render: (_, record) => record.remark || '-',
  },
  {
    title: '提交时间',
    dataIndex: 'createdAt',
    valueType: 'dateTime',
    width: 180,
    search: false,
  },
]

/**
 * 全部在任区代列（GET /admin/agent/district/actives）。
 * 与待审列的差异：在任数据无待审态，补「上任时间」；检索由页面的
 * 城市 / 区域级联条件提供，操作列在页面内追加。
 */
export const DISTRICT_AGENT_ACTIVES_COLUMNS: ProColumns<DistrictAgent>[] = [
  {
    title: '会员',
    dataIndex: 'memberId',
    width: 220,
    search: false,
    render: (_, record) => renderMember(record.member),
  },
  {
    title: '所属区域',
    dataIndex: 'regionId',
    width: 240,
    search: false,
    render: (_, record) => renderRegion(record.region),
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    search: false,
    render: (_, record) => renderDistrictAgentStatus(record.status),
  },
  {
    title: '上任时间',
    dataIndex: 'assignedAt',
    valueType: 'dateTime',
    width: 180,
    search: false,
  },
  {
    title: '附件',
    dataIndex: 'attachments',
    width: 90,
    search: false,
    render: (_, record) =>
      record.attachments?.length ? (
        <Tag color="blue">{record.attachments.length} 个</Tag>
      ) : (
        <Tag>无</Tag>
      ),
  },
  {
    title: '备注',
    dataIndex: 'remark',
    ellipsis: true,
    search: false,
    render: (_, record) => record.remark || '-',
  },
  {
    title: '提交时间',
    dataIndex: 'createdAt',
    valueType: 'dateTime',
    width: 180,
    search: false,
  },
]
