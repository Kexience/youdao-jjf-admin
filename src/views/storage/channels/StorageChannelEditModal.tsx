import { ModalForm } from '@ant-design/pro-components'
import { Button, Form } from 'antd'

import { StorageChannelFormFields } from './StorageChannelFormFields'
import type { StorageChannelFormValues } from './StorageChannelModal'

interface StorageChannelEditModalProps {
  channel: StorageChannel
  saving: boolean
  onSubmit: (params: StorageChannelSaveParams) => Promise<unknown>
}

/** 行内初始值：Secret 留空（保留原值），其余取行数据 */
function toInitialValues(channel: StorageChannel): StorageChannelFormValues {
  return {
    vendor: channel.vendor,
    endpoint: channel.endpoint,
    bucket: channel.bucket,
    accessKeyId: channel.accessKeyId,
    accessKeySecret: '',
    callbackUrl: channel.callbackUrl,
    priority: channel.priority,
    enabled: channel.enabled,
    accessKeySecretEncrypted: channel.accessKeySecretEncrypted ?? true,
  }
}

/**
 * 编辑存储通道弹窗：每行独立实例，trigger 为行内「编辑」。
 * 打开时用最新行数据同步表单（列表刷新后实例复用，initialValues 只在挂载时生效一次）。
 */
export function StorageChannelEditModal({ channel, saving, onSubmit }: StorageChannelEditModalProps) {
  const [form] = Form.useForm<StorageChannelFormValues>()

  return (
    <ModalForm<StorageChannelFormValues>
      name={`storage-channel-edit-form-${channel.id}`}
      title="编辑存储通道"
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
          endpoint: values.endpoint?.trim() || undefined,
          bucket: values.bucket?.trim() || undefined,
          accessKeyId: values.accessKeyId?.trim() || undefined,
          accessKeySecret: values.accessKeySecret?.trim() || undefined,
          callbackUrl: values.callbackUrl?.trim() || undefined,
          priority: values.priority,
          enabled: values.enabled,
          accessKeySecretEncrypted: values.accessKeySecretEncrypted,
        })
        return true
      }}
    >
      <StorageChannelFormFields isEdit />
    </ModalForm>
  )
}
