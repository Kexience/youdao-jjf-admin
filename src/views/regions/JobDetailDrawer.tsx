import { Alert, Descriptions, Drawer, Skeleton } from 'antd'

import { useGetRegionSyncJob } from '../../api/regions'
import { ApiError } from '../../lib/request'
import { renderRegionJobStage, renderRegionJobStatus } from './columns'

interface JobDetailDrawerProps {
  /** 要查看的任务 id；undefined 表示未选中（抽屉关闭） */
  jobId?: number
  open: boolean
  onClose: () => void
}

/**
 * 同步任务详情抽屉：GET /admin/region/sync-jobs/{id}。
 * 打开时才请求（enabled=open），关闭后保留上次数据，再次打开新 id 会重新拉取。
 */
export function JobDetailDrawer({ jobId, open, onClose }: JobDetailDrawerProps) {
  const jobQuery = useGetRegionSyncJob(jobId, { enabled: open && jobId !== undefined })
  const job = jobQuery.data

  return (
    <Drawer
      title="同步任务详情"
      size={560}
      open={open}
      onClose={onClose}
      destroyOnHidden
    >
      {jobQuery.isPending && <Skeleton active paragraph={{ rows: 8 }} />}
      {jobQuery.isError && (
        <Alert
          type="error"
          showIcon
          message={
            jobQuery.error instanceof ApiError ? jobQuery.error.message : '详情加载失败，请重试'
          }
        />
      )}
      {job && (
        <Descriptions bordered column={1} size="small" styles={{ label: { width: 130 } }}>
          <Descriptions.Item label="任务 id">{job.id}</Descriptions.Item>
          <Descriptions.Item label="目标版本">{job.targetVersion || '-'}</Descriptions.Item>
          <Descriptions.Item label="状态">{renderRegionJobStatus(job.status)}</Descriptions.Item>
          <Descriptions.Item label="当前阶段">{renderRegionJobStage(job.stage)}</Descriptions.Item>
          <Descriptions.Item label="阶段断点码">{job.cursorCode || '-'}</Descriptions.Item>
          <Descriptions.Item label="抓取进度">
            {`${job.fetched ?? 0} / ${job.total ?? 0}`}
          </Descriptions.Item>
          <Descriptions.Item label="已应用 / 已停用">
            {`${job.applied ?? 0} / ${job.disabled ?? 0}`}
          </Descriptions.Item>
          <Descriptions.Item label="待审核 / 已跳过">
            {`${job.changed ?? 0} / ${job.skipped ?? 0}`}
          </Descriptions.Item>
          <Descriptions.Item label="触发人 id">{job.createdBy ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="开始时间">{job.startedAt || '-'}</Descriptions.Item>
          <Descriptions.Item label="结束时间">{job.finishedAt || '-'}</Descriptions.Item>
          <Descriptions.Item label="错误信息">{job.errorMsg || '-'}</Descriptions.Item>
        </Descriptions>
      )}
    </Drawer>
  )
}
