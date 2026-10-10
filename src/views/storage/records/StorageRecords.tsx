import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { useMutation } from '@tanstack/react-query'
import { App, Button, Popconfirm } from 'antd'
import { useRef } from 'react'

import { fetchStorageRecords, useDeleteStorageRecord } from '../../../api/storageRecords'
import { uploadServerFile } from '../../../api/storageServerFiles'
import { useGetStorageZones } from '../../../api/storageZones'
import { ApiError } from '../../../lib/request'
import { getStorageRecordColumns } from './columns'
import { ServerFileReadUrlModal } from './ServerFileReadUrlModal'
import { ServerFileUploadModal } from './ServerFileUploadModal'

/**
 * 存储上传记录页：GET 分页检索 / DELETE 逻辑删除 /admin/storage/records（按 key 反查暂不做）。
 * 服务端分页 + 条件检索走 ProTable request，参数以文档为准：
 * zone / hash / uploaderType / uploaderId / status（空=默认排除 EXPIRED）/ start~end。
 */
export function StorageRecords() {
  const { message } = App.useApp()
  const actionRef = useRef<ActionType>(null)

  // zone 筛选项来自 Zone 列表
  const zonesQuery = useGetStorageZones()

  const deleteMutation = useDeleteStorageRecord({
    onSuccess: () => {
      message.success('删除成功')
      actionRef.current?.reload()
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '删除失败，请重试')
    },
  })

  const uploadMutation = useMutation({
    mutationFn: ({ zone, file }: { zone?: string; file: File }) => uploadServerFile(zone, file),
    onSuccess: () => {
      message.success('上传成功')
      actionRef.current?.reload()
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '上传失败，请重试')
    },
  })

  const columns: ProColumns<StorageUploadRecord>[] = [
    ...getStorageRecordColumns(zonesQuery.data ?? []),
    {
      title: '操作',
      key: 'action',
      width: 200,
      valueType: 'option',
      render: (_, record) => [
        <ServerFileReadUrlModal key="read-url" recordId={record.id} />,
        <Popconfirm
          key="delete"
          title="确认逻辑删除该上传记录吗？"
          onConfirm={() => deleteMutation.mutate(record.id)}
          okButtonProps={{ loading: deleteMutation.isPending }}
        >
          <Button type="link" size="small" danger>
            删除
          </Button>
        </Popconfirm>,
      ],
    },
  ]

  return (
    <PageContainer
      header={{
        title: '存储上传记录',
        subTitle: '按 zone / hash / 上传人 / 状态 / 时间区间检索，支持逻辑删除。',
      }}
    >
      <ProTable<StorageUploadRecord>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          try {
            const [start, end] = (params.createdAtRange as [string, string] | undefined) ?? []
            const uploaderId = Number(params.uploaderId)
            const data = await fetchStorageRecords({
              page: params.current ?? 1,
              size: params.pageSize ?? 10,
              zone: (params.zone as string | undefined)?.trim() || undefined,
              hash: (params.hash as string | undefined)?.trim() || undefined,
              uploaderType: (params.uploaderType as string | undefined)?.trim() || undefined,
              uploaderId: Number.isNaN(uploaderId) ? undefined : uploaderId,
              status: (params.status as string | undefined)?.trim() || undefined,
              start,
              end,
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
        headerTitle="上传记录"
        options={{ density: true }}
        toolBarRender={() => [
          <ServerFileUploadModal
            key="upload"
            saving={uploadMutation.isPending}
            onSubmit={uploadMutation.mutateAsync}
          />,
        ]}
        locale={{ emptyText: '暂无上传记录' }}
      />
    </PageContainer>
  )
}
