import type { ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { App, Button, Popconfirm } from 'antd'

import {
  useCreateSmsTemplate,
  useDeleteSmsTemplate,
  useGetSmsTemplates,
  useUpdateSmsTemplate,
} from '../../../api/smsTemplates'
import { ApiError } from '../../../lib/request'
import { SMS_TEMPLATE_COLUMNS } from './columns'
import { SmsTemplateEditModal } from './SmsTemplateEditModal'
import { SmsTemplateModal } from './SmsTemplateModal'

/**
 * 短信模板页：GET 列表 / POST 新增 / PUT 修改 / DELETE 删除 /admin/sms/templates。
 * 字段以线上文档 SmsTemplateVo / SmsTemplateSaveDto 为准，
 * 列定义见 ./columns，新建弹窗见 ./SmsTemplateModal，编辑弹窗见 ./SmsTemplateEditModal。
 */
export function SmsTemplates() {
  const { message } = App.useApp()

  const templatesQuery = useGetSmsTemplates()

  const createMutation = useCreateSmsTemplate({
    onSuccess: () => {
      message.success('短信模板新建成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const updateMutation = useUpdateSmsTemplate({
    onSuccess: () => {
      message.success('短信模板更新成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const deleteMutation = useDeleteSmsTemplate({
    onSuccess: () => {
      message.success('删除成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '删除失败，请重试')
    },
  })

  const columns: ProColumns<SmsTemplate>[] = [
    ...SMS_TEMPLATE_COLUMNS,
    {
      title: '操作',
      key: 'action',
      width: 160,
      valueType: 'option',
      render: (_, record) => [
        <SmsTemplateEditModal
          key="edit"
          template={record}
          saving={updateMutation.isPending}
          onSubmit={(params) => updateMutation.mutateAsync({ id: record.id, params })}
        />,
        <Popconfirm
          key="delete"
          title="确认删除该短信模板吗？"
          description="删除后不可恢复。"
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
        title: '短信模板',
        subTitle: '场景×厂商维度，支持新增 / 编辑 / 删除。',
      }}
    >
      <ProTable<SmsTemplate>
        rowKey="id"
        columns={columns}
        dataSource={templatesQuery.data ?? []}
        loading={templatesQuery.isLoading}
        pagination={false}
        search={false}
        dateFormatter={false}
        headerTitle="模板列表"
        options={{
          reload: () => void templatesQuery.refetch(),
          density: true,
        }}
        toolBarRender={() => [
          <SmsTemplateModal
            key="new"
            saving={createMutation.isPending}
            onSubmit={createMutation.mutateAsync}
          />,
        ]}
        locale={{ emptyText: templatesQuery.isError ? '加载失败，请重试' : '暂无模板数据' }}
      />
    </PageContainer>
  )
}
