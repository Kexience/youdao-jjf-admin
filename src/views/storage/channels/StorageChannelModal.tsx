import { PlusOutlined } from '@ant-design/icons'
import { ModalForm } from '@ant-design/pro-components'
import { Button, Form } from 'antd'

import { StorageChannelFormFields } from './StorageChannelFormFields'

/** 新建存储通道弹窗表单值：与 StorageChannelSaveParams 一一对应 */
export interface StorageChannelFormValues {
  vendor: string
  endpoint?: string
  bucket?: string
  accessKeyId?: string
  accessKeySecret?: string
  callbackUrl?: string
  priority: number
  enabled: boolean
  accessKeySecretEncrypted: boolean
}

interface StorageChannelModalProps {
  saving: boolean
  onSubmit: (params: StorageChannelSaveParams) => Promise<unknown>
}

/**
 * 新增存储通道弹窗：按钮即 trigger，提交成功自动关闭。
 * 成功提示与失败提示由父组件的 mutation 回调负责。
 */
export function StorageChannelModal({ saving, onSubmit }: StorageChannelModalProps) {
  const [form] = Form.useForm<StorageChannelFormValues>()

  return (
    <ModalForm<StorageChannelFormValues>
      name="storage-channel-modal-form"
      title="新增存储通道"
      trigger={
        <Button type="primary">
          <PlusOutlined />
          新增通道
        </Button>
      }
      form={form}
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      submitTimeout={2000}
      layout="vertical"
      initialValues={{ priority: 1, enabled: true, accessKeySecretEncrypted: true }}
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
      <StorageChannelFormFields isEdit={false} />
    </ModalForm>
  )
}
