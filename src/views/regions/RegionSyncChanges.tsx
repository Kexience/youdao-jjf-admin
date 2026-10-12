import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { App, Button, Popconfirm } from 'antd'
import { useRef } from 'react'

import { fetchRegionSyncChanges, useReviewRegionSyncChange } from '../../api/regions'
import { ApiError } from '../../lib/request'
import { ChangeDetailModal } from './ChangeDetailModal'
import { REGION_SYNC_CHANGE_COLUMNS } from './columns'

/**
 * 市辖区变动清单：GET 分页查询 / PATCH 审批 /admin/region/sync-changes。
 * 服务端分页字段是 page/pageSize（与其它模块 page/size 不同）；
 * jobId / status（pending/approved/rejected）走 ProTable 检索，
 * 待审核项提供批准 / 驳回操作，其余项只能查看详情。
 */
export function RegionSyncChanges() {
  const { message } = App.useApp()
  const actionRef = useRef<ActionType>(null)

  const reviewMutation = useReviewRegionSyncChange({
    onSuccess: () => {
      message.success('审批完成')
      actionRef.current?.reload()
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '审批失败，请重试')
    },
  })

  const columns: ProColumns<RegionSyncChange>[] = [
    ...REGION_SYNC_CHANGE_COLUMNS,
    {
      title: '操作',
      key: 'action',
      width: 200,
      valueType: 'option',
      render: (_, record) => {
        const pending = record.status === 'pending'
        return [
          <ChangeDetailModal key="detail" change={record} />,
          pending ? (
            <Popconfirm
              key="approve"
              title="确认批准该变动吗？"
              onConfirm={() =>
                reviewMutation.mutateAsync({ id: record.id, params: { decision: 'approve' } })
              }
              okButtonProps={{ loading: reviewMutation.isPending }}
            >
              <Button type="link" size="small">
                批准
              </Button>
            </Popconfirm>
          ) : null,
          pending ? (
            <Popconfirm
              key="reject"
              title="确认驳回该变动吗？"
              onConfirm={() =>
                reviewMutation.mutateAsync({ id: record.id, params: { decision: 'reject' } })
              }
              okButtonProps={{ loading: reviewMutation.isPending }}
            >
              <Button type="link" size="small" danger>
                驳回
              </Button>
            </Popconfirm>
          ) : null,
        ]
      },
    },
  ]

  return (
    <ProTable<RegionSyncChange>
      rowKey="id"
      actionRef={actionRef}
      columns={columns}
      request={async (params) => {
        try {
          const jobId = Number(params.jobId)
          const data = await fetchRegionSyncChanges({
            jobId: Number.isNaN(jobId) ? undefined : jobId,
            status: (params.status as string | undefined)?.trim() || undefined,
            page: params.current ?? 1,
            pageSize: params.pageSize ?? 10,
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
      headerTitle="市辖区变动清单"
      options={{ density: true }}
      locale={{ emptyText: '暂无变动清单' }}
    />
  )
}
