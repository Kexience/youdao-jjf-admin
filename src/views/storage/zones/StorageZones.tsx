import type { ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { App } from 'antd'

import {
  useCreateStorageZone,
  useGetStorageZones,
  useUpdateStorageZone,
} from '../../../api/storageZones'
import { ApiError } from '../../../lib/request'
import { STORAGE_ZONE_COLUMNS } from './columns'
import { StorageZoneEditModal } from './StorageZoneEditModal'
import { StorageZoneModal } from './StorageZoneModal'

/**
 * 存储 Zone 页：GET 列表 / POST 新增 / PUT 修改 /admin/storage/zones。
 * 新增与修改 DTO 不同（见 api/storageZones 注释），表单值统一后分别映射，
 * 列定义见 ./columns，新建弹窗见 ./StorageZoneModal，编辑弹窗见 ./StorageZoneEditModal。
 */
export function StorageZones() {
  const { message } = App.useApp()

  const zonesQuery = useGetStorageZones()

  const createMutation = useCreateStorageZone({
    onSuccess: () => {
      message.success('Zone 新建成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const updateMutation = useUpdateStorageZone({
    onSuccess: () => {
      message.success('Zone 更新成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const columns: ProColumns<StorageZone>[] = [
    ...STORAGE_ZONE_COLUMNS,
    {
      title: '操作',
      key: 'action',
      valueType: 'option',
      render: (_, record) => [
        <StorageZoneEditModal
          key="edit"
          zone={record}
          saving={updateMutation.isPending}
          onSubmit={(params) => updateMutation.mutateAsync({ id: record.id, params })}
        />,
      ],
    },
  ]

  return (
    <PageContainer
      header={{
        title: '存储 Zone',
        subTitle: '文件地址前缀维度，含停用，支持新增 / 编辑。',
      }}
    >
      <ProTable<StorageZone>
        rowKey="id"
        columns={columns}
        dataSource={zonesQuery.data ?? []}
        loading={zonesQuery.isLoading}
        pagination={false}
        search={false}
        dateFormatter={false}
        scroll={{ x: 'max-content' }}
        headerTitle="Zone 列表"
        options={{
          reload: () => void zonesQuery.refetch(),
          density: true,
        }}
        toolBarRender={() => [
          <StorageZoneModal
            key="new"
            saving={createMutation.isPending}
            onSubmit={createMutation.mutateAsync}
          />,
        ]}
        locale={{ emptyText: zonesQuery.isError ? '加载失败，请重试' : '暂无 Zone 数据' }}
      />
    </PageContainer>
  )
}
