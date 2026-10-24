import { ModalForm } from '@ant-design/pro-components'
import { Button, Form } from 'antd'

import { GeoChannelFormFields } from './GeoChannelFormFields'
import type { GeoChannelFormValues } from './GeoChannelModal'

interface GeoChannelEditModalProps {
  channel: GeoChannel
  saving: boolean
  onSubmit: (params: GeoChannelSaveParams) => Promise<unknown>
}

/** 行内初始值：Secret 留空（保留原值），其余取行数据 */
function toInitialValues(channel: GeoChannel): GeoChannelFormValues {
  return {
    vendor: channel.vendor,
    serverKey: channel.serverKey,
    serverSecret: '',
    clientKey: channel.clientKey,
    priority: channel.priority,
    enabled: channel.enabled,
    serverSecretEncrypted: channel.serverSecretEncrypted ?? true,
  }
}

/**
 * 编辑地图通道弹窗：每行独立实例，trigger 为行内「编辑」。
 * 打开时用最新行数据同步表单（列表刷新后实例复用，initialValues 只在挂载时生效一次）。
 */
export function GeoChannelEditModal({ channel, saving, onSubmit }: GeoChannelEditModalProps) {
  const [form] = Form.useForm<GeoChannelFormValues>()

  return (
    <ModalForm<GeoChannelFormValues>
      name={`geo-channel-edit-form-${channel.id}`}
      title="编辑地图通道"
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
          serverKey: values.serverKey?.trim() || undefined,
          // Secret 留空不传 = 后端保留原值（响应恒为掩码）
          serverSecret: values.serverSecret?.trim() || undefined,
          clientKey: values.clientKey?.trim() || undefined,
          priority: values.priority,
          enabled: values.enabled,
          serverSecretEncrypted: values.serverSecretEncrypted,
        })
        return true
      }}
    >
      <GeoChannelFormFields isEdit />
    </ModalForm>
  )
}
