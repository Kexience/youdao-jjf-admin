import { PlusOutlined } from '@ant-design/icons'
import { ModalForm } from '@ant-design/pro-components'
import { Alert, Button, Form, Input, Select, Space } from 'antd'

/** 附件类型（见文档 AttachmentRequest.fileType：id_card/business_license/other） */
const FILE_TYPE_OPTIONS = [
  { label: '身份证', value: 'id_card' },
  { label: '营业执照', value: 'business_license' },
  { label: '其他', value: 'other' },
]

/** 附件表单值：与 AttachmentRequest 字段对齐 */
interface DistrictAgentAttachmentsFormValues {
  attachments: DistrictAgentAttachmentParams[]
}

interface DistrictAgentAttachmentsModalProps {
  agent: DistrictAgent
  saving: boolean
  onSubmit: (params: DistrictAgentAttachmentsParams) => Promise<unknown>
}

/** 行数据 → 表单初始值（附件列表全量覆盖，空数组即清空） */
function toInitialValues(agent: DistrictAgent): DistrictAgentAttachmentsFormValues {
  return {
    attachments: (agent.attachments ?? []).map((attachment) => ({
      fileType: attachment.fileType || 'other',
      fileUrl: attachment.fileUrl || '',
    })),
  }
}

/**
 * 区代附件编辑弹窗：每行独立实例，trigger 为行内「附件」。
 * 提交走 PUT /admin/agent/district-agents/{agentId}/attachments（仅待审可改），
 * 后端按提交列表全量覆盖，删除全部即清空附件。
 */
export function DistrictAgentAttachmentsModal({
  agent,
  saving,
  onSubmit,
}: DistrictAgentAttachmentsModalProps) {
  const [form] = Form.useForm<DistrictAgentAttachmentsFormValues>()

  return (
    <ModalForm<DistrictAgentAttachmentsFormValues>
      name={`district-agent-attachments-form-${agent.id}`}
      title="编辑区代附件"
      trigger={
        <Button type="link" size="small">
          附件
        </Button>
      }
      form={form}
      width={720}
      layout="vertical"
      modalProps={{ destroyOnHidden: true }}
      initialValues={toInitialValues(agent)}
      onOpenChange={(open) => {
        if (open) form.setFieldsValue(toInitialValues(agent))
      }}
      submitTimeout={2000}
      submitter={{
        searchConfig: { submitText: '保存附件', resetText: '取消' },
        submitButtonProps: { loading: saving },
      }}
      onFinish={async (values) => {
        await onSubmit({
          attachments: (values.attachments ?? []).map((attachment) => ({
            fileType: attachment.fileType,
            fileUrl: attachment.fileUrl.trim(),
          })),
        })
        return true
      }}
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="保存会以当前列表全量覆盖附件；删除全部条目即清空附件。"
      />
      <Form.List name="attachments">
        {(fields, { add, remove }) => (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {fields.map((field) => (
              <Space key={field.key} align="baseline" style={{ display: 'flex', width: '100%' }}>
                <Form.Item
                  name={[field.name, 'fileType']}
                  rules={[{ required: true, message: '请选择附件类型' }]}
                  style={{ marginBottom: 8 }}
                >
                  <Select
                    style={{ width: 150 }}
                    placeholder="附件类型"
                    options={FILE_TYPE_OPTIONS}
                  />
                </Form.Item>
                <Form.Item
                  name={[field.name, 'fileUrl']}
                  rules={[
                    { required: true, message: '请填写附件 URL' },
                    { type: 'url', message: '请填写合法的 URL' },
                  ]}
                  style={{ marginBottom: 8, flex: 1, minWidth: 320 }}
                >
                  <Input
                    placeholder="对象存储 URL，如 https://..."
                    maxLength={2048}
                    allowClear
                  />
                </Form.Item>
                <Button
                  type="text"
                  danger
                  onClick={() => remove(field.name)}
                  style={{ marginBottom: 8 }}
                >
                  删除
                </Button>
              </Space>
            ))}
            <Button
              type="dashed"
              block
              icon={<PlusOutlined />}
              onClick={() => add({ fileType: 'id_card', fileUrl: '' })}
            >
              添加附件
            </Button>
          </Space>
        )}
      </Form.List>
    </ModalForm>
  )
}
