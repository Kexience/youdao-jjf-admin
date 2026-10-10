import { PlusOutlined } from '@ant-design/icons'
import { ModalForm } from '@ant-design/pro-components'
import { Button, Form } from 'antd'

import { SmsChannelFormFields } from './SmsChannelFormFields'

/** 新建通道弹窗表单值：与 SmsChannelSaveParams 一一对应 */
export interface SmsChannelFormValues {
  vendor: string
  accessKeyId?: string
  accessKeySecret?: string
  signName?: string
  priority: number
  unitPrice?: number
  enabled: boolean
  accessKeySecretEncrypted: boolean
}

interface SmsChannelModalProps {
  saving: boolean
  onSubmit: (params: SmsChannelSaveParams) => Promise<unknown>
}

/**
 * 新增短信通道弹窗：按钮即 trigger，提交成功自动关闭。
 * 成功提示与失败提示由父组件的 mutation 回调负责。
 */
export function SmsChannelModal({ saving, onSubmit }: SmsChannelModalProps) {
  const [form] = Form.useForm<SmsChannelFormValues>()

  return (
    <ModalForm<SmsChannelFormValues>
      name="sms-channel-modal-form"
      title="新增短信通道"
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
      initialValues={{ priority: 1, enabled: false, accessKeySecretEncrypted: true }}
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
      <SmsChannelFormFields isEdit={false} />
    </ModalForm>
  )
}
