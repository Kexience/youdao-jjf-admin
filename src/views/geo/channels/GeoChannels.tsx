import type { ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { App, Button, Modal, Popconfirm, Switch } from 'antd'
import { useState } from 'react'

import {
  useCreateGeoChannel,
  useGetGeoChannels,
  useSetGeoChannelEnabled,
  useTestGeoChannel,
  useUpdateGeoChannel,
} from '../../../api/geoChannels'
import { ApiError } from '../../../lib/request'
import { GEO_CHANNEL_COLUMNS } from './columns'
import { GeoChannelEditModal } from './GeoChannelEditModal'
import { GeoChannelModal } from './GeoChannelModal'

/**
 * 地图通道页：GET 列表 / POST 新增 / PUT 修改 / PUT 启用停用 / POST 连通性测试
 * /admin/geo/channels。字段以线上文档 GeoChannelVo / GeoChannelSaveRequest 为准，
 * 列定义见 ./columns，新建弹窗见 ./GeoChannelModal，编辑弹窗见 ./GeoChannelEditModal。
 */
export function GeoChannels() {
  const { message } = App.useApp()
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [testingId, setTestingId] = useState<number | null>(null)

  const channelsQuery = useGetGeoChannels()

  const createMutation = useCreateGeoChannel({
    onSuccess: () => {
      message.success('地图通道新建成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const updateMutation = useUpdateGeoChannel({
    onSuccess: () => {
      message.success('地图通道更新成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const enabledMutation = useSetGeoChannelEnabled({
    onSuccess: (_, vars) => {
      message.success(vars.enabled ? '通道已启用' : '通道已停用')
      setTogglingId(null)
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '状态切换失败，请重试')
      setTogglingId(null)
    },
  })

  // 测试结果有结构化文案（available + message），用弹窗展示比 message 更合适
  const testMutation = useTestGeoChannel({
    onSuccess: (result) => {
      if (result.available) {
        Modal.success({
          title: `连通性测试通过（${result.vendor}）`,
          content: result.message,
        })
      } else {
        Modal.error({
          title: `连通性测试未通过（${result.vendor}）`,
          content: result.message,
        })
      }
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '测试失败，请重试')
    },
  })

  const columns: ProColumns<GeoChannel>[] = [
    ...GEO_CHANNEL_COLUMNS,
    {
      title: '操作',
      key: 'action',
      width: 220,
      valueType: 'option',
      render: (_, record) => [
        <GeoChannelTestButton
          key="test"
          loading={testMutation.isPending && testingId === record.id}
          onTest={() => {
            setTestingId(record.id)
            testMutation.mutate(
              { id: record.id },
              { onSettled: () => setTestingId(null) },
            )
          }}
        />,
        <GeoChannelEditModal
          key="edit"
          channel={record}
          saving={updateMutation.isPending}
          onSubmit={(params) => updateMutation.mutateAsync({ id: record.id, params })}
        />,
        <GeoActionSwitch
          key="toggle"
          checked={record.enabled}
          loading={enabledMutation.isPending && togglingId === record.id}
          onChange={(checked) => {
            setTogglingId(record.id)
            enabledMutation.mutate({ id: record.id, enabled: checked })
          }}
        />,
      ],
    },
  ]

  return (
    <PageContainer
      header={{
        title: '地图通道',
        subTitle:
          '按优先级升序排列，优先级 1 最高，支持新增 / 编辑 / 启用停用 / 连通性测试。',
      }}
    >
      <ProTable<GeoChannel>
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
          <GeoChannelModal
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
function GeoActionSwitch({
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

/** 连通性测试入口：确认后发起最小查询，结果用 Modal 展示 */
function GeoChannelTestButton({ loading, onTest }: { loading: boolean; onTest: () => void }) {
  return (
    <Popconfirm
      title="用该通道凭据发起一次最小查询？"
      okText="开始测试"
      cancelText="取消"
      onConfirm={onTest}
    >
      <Button type="link" size="small" loading={loading}>
        测试
      </Button>
    </Popconfirm>
  )
}
