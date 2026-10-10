import { ModalForm } from '@ant-design/pro-components'
import { Button, Form } from 'antd'

import type { SmsChannelFormValues } from './SmsChannelModal'
import { SmsChannelFormFields } from './SmsChannelFormFields'

interface SmsChannelEditModalProps {
  channel: SmsChannel
  saving: boolean
  onSubmit: (params: SmsChannelSaveParams) => Promise<unknown>
}

/** 行内初始值：Secret 留空（保留原值），其余取行数据 */
function toInitialValues(channel: SmsChannel): SmsChannelFormValues {
  return {
    vendor: channel.vendor,
    accessKeyId: channel.accessKeyId,
    accessKeySecret: '',
    signName: channel.signName,
    priority: channel.priority,
    unitPrice: channel.unitPrice,
    enabled: channel.enabled,
    accessKeySecretEncrypted: channel.accessKeySecretEncrypted ?? true,
  }
}

/**
 * 编辑短信通道弹窗：每行独立实例，trigger 为行内「编辑」。
 * 打开时用最新行数据同步表单（列表刷新后实例复用，initialValues 只在挂载时生效一次）。
 */
export function SmsChannelEditModal({ channel, saving, onSubmit }: SmsChannelEditModalProps) {
  const [form] = Form.useForm<SmsChannelFormValues>()

  return (
    <ModalForm<SmsChannelFormValues>
      name={`sms-channel-edit-form-${channel.id}`}
      title="编辑短信通道"
      trigger={
        <Button type="link" size="small">
          编辑
        </Button>
      }
      form={form}
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      onOpenChange={(open) => {
        if (open) form.setFieldsValue(toInitialValues(channel))
      }}
      submitTimeout={2000}
      layout="vertical"
      initialValues={toInitialValues(channel)}
      submitter={{
        searchConfig: { submitText: '保存', resetText: '取消' },
        submitButtonProps: { loading: saving },
      }}
      onFinish={async (values) => {
        await onSubmit({
          vendor: values.vendor.trim(),
          accessKeyId: values.accessKeyId?.trim() || undefined,
          accessKeySecret: values.accessKeySecret?.trim() || undefined,
          signName: values.signName?.trim() || undefined,
          priority: values.priority,
          unitPrice: values.unitPrice,
          enabled: values.enabled,
          accessKeySecretEncrypted: values.accessKeySecretEncrypted,
        })
        return true
      }}
    >
      <SmsChannelFormFields isEdit />
    </ModalForm>
  )
}
