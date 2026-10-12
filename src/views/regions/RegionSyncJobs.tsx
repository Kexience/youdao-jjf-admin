import { SyncOutlined } from '@ant-design/icons'
import type { ProColumns } from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { App, Button, Tooltip } from 'antd'
import { useState } from 'react'

import { useGetRegionSyncJobs, useTriggerRegionSync } from '../../api/regions'
import { ApiError } from '../../lib/request'
import { REGION_SYNC_JOB_COLUMNS } from './columns'
import { JobDetailDrawer } from './JobDetailDrawer'
import { TriggerSyncAction } from './TriggerSyncAction'

/**
 * 同步任务列表：GET /admin/region/sync-jobs（列表）+ POST 触发同步 + 详情抽屉。
 * 接口无分页，直接 dataSource 渲染；触发 / 再次同步成功后自动刷新列表。
 * 「再次同步」复用同一触发接口，仅失败（status=failed）的任务可点击，版本号沿用该任务的 targetVersion。
 */
export function RegionSyncJobs() {
  const { message } = App.useApp()
  const [detailJobId, setDetailJobId] = useState<number | undefined>(undefined)

  const jobsQuery = useGetRegionSyncJobs()

  const triggerMutation = useTriggerRegionSync({
    onSuccess: () => {
      message.success('同步任务已触发')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '触发失败，请重试')
    },
  })

  const columns: ProColumns<RegionSyncJob>[] = [
    ...REGION_SYNC_JOB_COLUMNS,
    {
      title: '操作',
      key: 'action',
      width: 160,
      valueType: 'option',
      render: (_, record) => {
        // 仅失败任务可再次同步（后端仅 failed 保留断点可续跑）
        const canResync = record.status === 'failed' && Boolean(record.targetVersion)
        return [
          <Button key="detail" type="link" size="small" onClick={() => setDetailJobId(record.id)}>
            详情
          </Button>,
          <Tooltip
            key="resync"
            title={canResync ? undefined : '仅失败的任务可再次同步'}
          >
            <TriggerSyncAction
              version={record.targetVersion}
              saving={triggerMutation.isPending}
              onConfirm={triggerMutation.mutateAsync}
            >
              <Button type="link" size="small" disabled={!canResync}>
                再次同步
              </Button>
            </TriggerSyncAction>
          </Tooltip>,
        ]
      },
    },
  ]

  return (
    <>
      <ProTable<RegionSyncJob>
        rowKey="id"
        columns={columns}
        dataSource={jobsQuery.data ?? []}
        loading={jobsQuery.isLoading}
        pagination={false}
        search={false}
        dateFormatter={false}
        scroll={{ x: 'max-content' }}
        headerTitle="最近同步任务"
        options={{
          reload: () => void jobsQuery.refetch(),
          density: true,
        }}
        toolBarRender={() => [
          <TriggerSyncAction
            key="trigger"
            saving={triggerMutation.isPending}
            onConfirm={triggerMutation.mutateAsync}
          >
            <Button type="primary" icon={<SyncOutlined />}>
              触发同步
            </Button>
          </TriggerSyncAction>,
        ]}
        locale={{ emptyText: jobsQuery.isError ? '加载失败，请重试' : '暂无同步任务' }}
      />
      <JobDetailDrawer
        jobId={detailJobId}
        open={detailJobId !== undefined}
        onClose={() => setDetailJobId(undefined)}
      />
    </>
  )
}
