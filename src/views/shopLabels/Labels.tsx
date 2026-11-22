import type { ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { Alert, App, Switch } from 'antd'
import { useMemo, useState } from 'react'

import {
  useCreateShopLabel,
  useGetShopLabels,
  useSetShopLabelStatus,
  useUpdateShopLabel,
} from '../../api/shopLabels'
import { ApiError } from '../../lib/request'
import { SHOP_LABEL_COLUMNS } from './columns'
import { LabelFormModal } from './LabelFormModal'

/**
 * 店铺标签页（/shop/label）：
 * GET 列表 / POST 新建 / POST 修改 / POST 启停
 * /admin/shop/taxonomy/labels。字段以线上文档 LabelVo / LabelRequest 为准，
 * 列定义见 ./columns，表单弹窗见 ./LabelFormModal。
 */
export function Labels() {
  const { message } = App.useApp()
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const labelsQuery = useGetShopLabels()

  /**
   * 按排序升序展示（后端无明确排序约定，这里再兜一层）：
   * sort 可空按 0 处理，相同排序按 id 稳定排列，避免刷新后行序跳动。
   */
  const labels = useMemo(
    () =>
      [...(labelsQuery.data ?? [])].sort(
        (a, b) => (a.sort ?? 0) - (b.sort ?? 0) || a.id - b.id,
      ),
    [labelsQuery.data],
  )

  const createMutation = useCreateShopLabel({
    onSuccess: () => {
      message.success('标签新建成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const updateMutation = useUpdateShopLabel({
    onSuccess: () => {
      message.success('标签更新成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const statusMutation = useSetShopLabelStatus({
    onSuccess: (_, vars) => {
      message.success(vars.enabled ? '标签已启用' : '标签已停用')
      setTogglingId(null)
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '状态切换失败，请重试')
      setTogglingId(null)
    },
  })

  const columns: ProColumns<ShopLabel>[] = [
    ...SHOP_LABEL_COLUMNS,
    {
      title: '操作',
      key: 'action',
      width: 160,
      valueType: 'option',
      render: (_, record) => [
        <LabelFormModal
          key="edit"
          label={record}
          saving={updateMutation.isPending}
          onSubmit={async (params) => {
            try {
              await updateMutation.mutateAsync({ id: record.id, params })
              return true
            } catch {
              // 失败提示已由 mutation onError 统一展示，返回 false 让弹窗保持打开便于修改
              return false
            }
          }}
        />,
        <Switch
          key="toggle"
          size="small"
          checked={record.status === 1}
          checkedChildren="启用"
          unCheckedChildren="停用"
          loading={statusMutation.isPending && togglingId === record.id}
          onChange={(checked) => {
            setTogglingId(record.id)
            statusMutation.mutate({ id: record.id, enabled: checked })
          }}
        />,
      ],
    },
  ]

  return (
    <PageContainer
      header={{
        title: '店铺标签',
        subTitle: '店铺申请与门店可选的标签，按排序升序展示，支持新建 / 编辑 / 启用停用。',
      }}
    >
      {labelsQuery.isError && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message={
            labelsQuery.error instanceof ApiError
              ? labelsQuery.error.message
              : '标签列表加载失败，请重试'
          }
        />
      )}

      <ProTable<ShopLabel>
        rowKey="id"
        columns={columns}
        dataSource={labels}
        loading={labelsQuery.isLoading}
        pagination={false}
        search={false}
        dateFormatter={false}
        headerTitle={`标签列表（${labels.length} 个）`}
        options={{
          reload: () => void labelsQuery.refetch(),
          density: true,
        }}
        toolBarRender={() => [
          <LabelFormModal
            key="new"
            saving={createMutation.isPending}
            onSubmit={async (params) => {
              try {
                await createMutation.mutateAsync(params)
                return true
              } catch {
                // 失败提示已由 mutation onError 统一展示，返回 false 让弹窗保持打开便于修改
                return false
              }
            }}
          />,
        ]}
        locale={{ emptyText: labelsQuery.isError ? '加载失败，请重试' : '暂无标签数据' }}
      />
    </PageContainer>
  )
}
