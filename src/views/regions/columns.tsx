import type { ProColumns } from '@ant-design/pro-components'
import { Progress, Tag } from 'antd'

/**
 * 行政区划模块列定义（与线上文档 RegionSyncJobVo / RegionSyncChangeVo 字段对齐）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 */

/** 审核状态枚举（见文档 sync-changes status 取值：pending/approved/rejected） */
export const REGION_CHANGE_STATUS_ENUM = {
  pending: { text: '待审核', status: 'Warning' },
  approved: { text: '已批准', status: 'Success' },
  rejected: { text: '已驳回', status: 'Error' },
} as const

/** 审核状态 → Tag 颜色 */
const REGION_CHANGE_STATUS_COLOR: Record<string, string> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
}

/** 审核状态展示（带颜色 Tag，未知值按原样展示） */
export function renderRegionChangeStatus(status?: string) {
  if (!status) return '-'
  const text =
    REGION_CHANGE_STATUS_ENUM[status as keyof typeof REGION_CHANGE_STATUS_ENUM]?.text ?? status
  return <Tag color={REGION_CHANGE_STATUS_COLOR[status] ?? 'default'}>{text}</Tag>
}

/**
 * 同步任务状态（对应后端 RegionSyncJobStatus，落库为小写字符串）
 * 后端：PENDING / RUNNING / WAITING_REVIEW / DONE / FAILED
 */
export const REGION_JOB_STATUS_ENUM = {
  pending: { text: '待运行', status: 'Default' },
  running: { text: '运行中', status: 'Processing' },
  waiting_review: { text: '等待审核', status: 'Warning' },
  done: { text: '完成', status: 'Success' },
  failed: { text: '失败', status: 'Error' },
} as const

/** 同步任务状态 → Tag 颜色 */
const REGION_JOB_STATUS_COLOR: Record<string, string> = {
  pending: 'default',
  running: 'processing',
  waiting_review: 'warning',
  done: 'success',
  failed: 'error',
}

/** 同步任务状态展示（带颜色 Tag，未知值按原样展示） */
export function renderRegionJobStatus(status?: string) {
  if (!status) return '-'
  const text =
    REGION_JOB_STATUS_ENUM[status as keyof typeof REGION_JOB_STATUS_ENUM]?.text ?? status
  return <Tag color={REGION_JOB_STATUS_COLOR[status] ?? 'default'}>{text}</Tag>
}

/**
 * 同步任务阶段（对应后端 RegionSyncJobStage，落库为小写字符串）
 * 后端：PROVINCE 抓取省/地/县 / STREET 抓取街道 / EXPORT 生成导出
 */
export const REGION_JOB_STAGE_ENUM = {
  province: { text: '省地县抓取' },
  street: { text: '街道抓取' },
  export: { text: '导出生成' },
} as const

/** 同步任务阶段 → Tag 颜色 */
const REGION_JOB_STAGE_COLOR: Record<string, string> = {
  province: 'blue',
  street: 'geekblue',
  export: 'purple',
}

/** 同步任务阶段展示（带颜色 Tag，未知值按原样展示） */
export function renderRegionJobStage(stage?: string) {
  if (!stage) return '-'
  const text =
    REGION_JOB_STAGE_ENUM[stage as keyof typeof REGION_JOB_STAGE_ENUM]?.text ?? stage
  return <Tag color={REGION_JOB_STAGE_COLOR[stage] ?? 'default'}>{text}</Tag>
}

/**
 * 市辖区变动类型（对应后端 RegionSyncChangeType / 服务写入的小写取值）
 * 取值：added / renamed / renamed_parent_changed / parent_changed / disabled
 */
export const REGION_CHANGE_TYPE_ENUM = {
  added: { text: '新增', color: 'success' },
  renamed: { text: '改名', color: 'processing' },
  renamed_parent_changed: { text: '改名且改隶属', color: 'purple' },
  parent_changed: { text: '隶属调整', color: 'geekblue' },
  disabled: { text: '撤区/消失', color: 'error' },
} as const

/** 变动类型展示（带颜色 Tag，未知值按原样展示） */
export function renderRegionChangeType(changeType?: string) {
  if (!changeType) return '-'
  const meta =
    REGION_CHANGE_TYPE_ENUM[changeType as keyof typeof REGION_CHANGE_TYPE_ENUM]
  return <Tag color={meta?.color ?? 'default'}>{meta?.text ?? changeType}</Tag>
}

/** 同步任务列（GET /admin/region/sync-jobs，无分页，全部不可检索） */
export const REGION_SYNC_JOB_COLUMNS: ProColumns<RegionSyncJob>[] = [
  {
    title: '任务 id',
    dataIndex: 'id',
    width: 90,
    search: false,
  },
  {
    title: '目标版本',
    dataIndex: 'targetVersion',
    width: 120,
    search: false,
    render: (_, record) => record.targetVersion || '-',
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 120,
    search: false,
    render: (_, record) => renderRegionJobStatus(record.status),
  },
  {
    title: '当前阶段',
    dataIndex: 'stage',
    width: 140,
    search: false,
    render: (_, record) => renderRegionJobStage(record.stage),
  },
  {
    title: '抓取进度',
    dataIndex: 'fetched',
    width: 180,
    search: false,
    render: (_, record) => {
      const total = record.total ?? 0
      if (total <= 0) return '-'
      const fetched = record.fetched ?? 0
      const percent = Math.min(100, Math.round((fetched / total) * 100))
      return (
        <Progress
          percent={percent}
          size="small"
          format={() => `${fetched}/${total}`}
          style={{ marginBottom: 0 }}
        />
      )
    },
  },
  {
    title: '已应用',
    dataIndex: 'applied',
    width: 80,
    search: false,
    render: (_, record) => record.applied ?? '-',
  },
  {
    title: '已停用',
    dataIndex: 'disabled',
    width: 80,
    search: false,
    render: (_, record) => record.disabled ?? '-',
  },
  {
    title: '待审核',
    dataIndex: 'changed',
    width: 80,
    search: false,
    render: (_, record) => record.changed ?? '-',
  },
  {
    title: '已跳过',
    dataIndex: 'skipped',
    width: 80,
    search: false,
    render: (_, record) => record.skipped ?? '-',
  },
  {
    title: '错误信息',
    dataIndex: 'errorMsg',
    ellipsis: true,
    search: false,
    render: (_, record) => record.errorMsg || '-',
  },
  {
    title: '开始时间',
    dataIndex: 'startedAt',
    width: 180,
    valueType: 'dateTime',
    search: false,
  },
  {
    title: '结束时间',
    dataIndex: 'finishedAt',
    width: 180,
    valueType: 'dateTime',
    search: false,
  },
]

/** 变动清单列（GET /admin/region/sync-changes，服务端分页） */
export const REGION_SYNC_CHANGE_COLUMNS: ProColumns<RegionSyncChange>[] = [
  {
    title: '清单 id',
    dataIndex: 'id',
    width: 100,
    search: false,
  },
  {
    title: '任务 id',
    dataIndex: 'jobId',
    width: 110,
    valueType: 'digit',
  },
  {
    title: '国标码',
    dataIndex: 'code',
    width: 120,
    search: false,
    copyable: true,
    render: (_, record) => record.code || '-',
  },
  {
    title: '层级',
    dataIndex: 'level',
    width: 80,
    search: false,
    render: (_, record) => record.level ?? '-',
  },
  {
    title: '变动类型',
    dataIndex: 'changeType',
    width: 140,
    search: false,
    render: (_, record) => renderRegionChangeType(record.changeType),
  },
  {
    title: '审核状态',
    dataIndex: 'status',
    width: 120,
    valueType: 'select',
    valueEnum: REGION_CHANGE_STATUS_ENUM,
    render: (_, record) => renderRegionChangeStatus(record.status),
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 180,
    valueType: 'dateTime',
    search: false,
  },
  {
    title: '审核时间',
    dataIndex: 'reviewedAt',
    width: 180,
    valueType: 'dateTime',
    search: false,
    render: (_, record) => record.reviewedAt || '-',
  },
]
