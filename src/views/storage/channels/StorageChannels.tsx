import type { ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { App, Switch } from 'antd'
import { useState } from 'react'

import {
  useCreateStorageChannel,
  useSetStorageChannelEnabled,
  useGetStorageChannels,
  useUpdateStorageChannel,
} from '../../../api/storageChannels'
import { ApiError } from '../../../lib/request'
import { STORAGE_CHANNEL_COLUMNS } from './columns'
import { StorageChannelEditModal } from './StorageChannelEditModal'
import { StorageChannelModal } from './StorageChannelModal'

/**
 * 存储通道页：GET 列表 / POST 新增 / PUT 修改 / PUT 启用停用 /admin/storage/channels。
 * 字段以线上文档 StorageChannelVo / StorageChannelSaveDto 为准，
 * 列定义见 ./columns，新建弹窗见 ./StorageChannelModal，编辑弹窗见 ./StorageChannelEditModal。
 */
export function StorageChannels() {
  const { message } = App.useApp()
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const channelsQuery = useGetStorageChannels()

  const createMutation = useCreateStorageChannel({
    onSuccess: () => {
      message.success('存储通道新建成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const updateMutation = useUpdateStorageChannel({
    onSuccess: () => {
      message.success('存储通道更新成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const enabledMutation = useSetStorageChannelEnabled({
    onSuccess: (_, vars) => {
      message.success(vars.enabled ? '通道已启用' : '通道已停用')
      setTogglingId(null)
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '状态切换失败，请重试')
      setTogglingId(null)
    },
  })

  const columns: ProColumns<StorageChannel>[] = [
    ...STORAGE_CHANNEL_COLUMNS,
    {
      title: '操作',
      key: 'action',
      width: 160,
      valueType: 'option',
      render: (_, record) => [
        <StorageActionSwitch
          key="toggle"
          checked={record.enabled}
          loading={enabledMutation.isPending && togglingId === record.id}
          onChange={(checked) => {
            setTogglingId(record.id)
            enabledMutation.mutate({ id: record.id, enabled: checked })
          }}
        />,
        <StorageChannelEditModal
          key="edit"
          channel={record}
          saving={updateMutation.isPending}
          onSubmit={(params) => updateMutation.mutateAsync({ id: record.id, params })}
        />,
      ],
    },
  ]

  return (
    <PageContainer
      header={{
        title: '存储通道',
        subTitle: '按优先级升序排列，优先级 1 最高，支持新增 / 编辑 / 启用停用。',
      }}
    >
      <ProTable<StorageChannel>
        rowKey="id"
        columns={columns}
        dataSource={channelsQuery.data ?? []}
        loading={channelsQuery.isLoading}
        pagination={false}
        search={false}
        dateFormatter={false}
        headerTitle="通道列表"
        options={{
          reload: () => void channelsQuery.refetch(),
          density: true,
        }}
        toolBarRender={() => [
          <StorageChannelModal
            key="new"
            saving={createMutation.isPending}
            onSubmit={createMutation.mutateAsync}
          />,
        ]}
        locale={{ emptyText: channelsQuery.isError ? '加载失败，请重试' : '暂无通道数据' }}
      />
    </PageContainer>
  )
}

/** 行内启用开关（loading 期间禁止重复切换） */
function StorageActionSwitch({
  checked,
  loading,
  onChange,
}: {
  checked: boolean
  loading: boolean
  onChange: (checked: boolean) => void
}) {
  return <Switch size="small" checked={checked} loading={loading} onChange={onChange} />
}
