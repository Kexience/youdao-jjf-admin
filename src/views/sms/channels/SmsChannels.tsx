import type { ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { App } from 'antd'

import { useCreateSmsChannel, useGetSmsChannels, useUpdateSmsChannel } from '../../../api/smsChannels'
import { ApiError } from '../../../lib/request'
import { SmsChannelEditModal } from './SmsChannelEditModal'
import { SmsChannelModal } from './SmsChannelModal'
import { SMS_CHANNEL_COLUMNS } from './columns'

/**
 * 短信通道页：GET 列表 / POST 新增 / PUT 修改 /admin/sms/channels。
 * 字段以线上文档 SmsChannelVo / SmsChannelSaveDto 为准，
 * 列定义见 ./columns，新建弹窗见 ./SmsChannelModal，编辑弹窗见 ./SmsChannelEditModal。
 */
export function SmsChannels() {
  const { message } = App.useApp()

  const channelsQuery = useGetSmsChannels()

  const createMutation = useCreateSmsChannel({
    onSuccess: () => {
      message.success('短信通道新建成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const updateMutation = useUpdateSmsChannel({
    onSuccess: () => {
      message.success('短信通道更新成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const columns: ProColumns<SmsChannel>[] = [
    ...SMS_CHANNEL_COLUMNS,
    {
      title: '操作',
      key: 'action',
      width: 120,
      valueType: 'option',
      render: (_, record) => [
        <SmsChannelEditModal
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
        title: '短信通道',
        subTitle: '按优先级升序排列，优先级 1 最高，支持新增通道。',
      }}
    >
      <ProTable<SmsChannel>
        rowKey="id"
        columns={columns}
        dataSource={channelsQuery.data ?? []}
        loading={channelsQuery.isLoading}
        pagination={false}
        search={false}
        dateFormatter={false}
        options={{
          reload: () => void channelsQuery.refetch(),
          density: true,
        }}
        toolBarRender={() => [
          <SmsChannelModal
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
