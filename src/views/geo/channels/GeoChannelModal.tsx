import { PlusOutlined } from '@ant-design/icons'
import { ModalForm } from '@ant-design/pro-components'
import { Button, Form } from 'antd'

import { GeoChannelFormFields } from './GeoChannelFormFields'

/** 新建地图通道弹窗表单值：与 GeoChannelSaveParams 一一对应 */
export interface GeoChannelFormValues {
  vendor: string
  serverKey?: string
  serverSecret?: string
  clientKey?: string
  priority: number
  enabled: boolean
  serverSecretEncrypted: boolean
}

interface GeoChannelModalProps {
  saving: boolean
  onSubmit: (params: GeoChannelSaveParams) => Promise<unknown>
}

/**
 * 新增地图通道弹窗：按钮即 trigger，提交成功自动关闭。
 * 成功提示与失败提示由父组件的 mutation 回调负责。
 */
export function GeoChannelModal({ saving, onSubmit }: GeoChannelModalProps) {
  const [form] = Form.useForm<GeoChannelFormValues>()

  return (
    <ModalForm<GeoChannelFormValues>
      name="geo-channel-modal-form"
      title="新增地图通道"
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
      // 新增：不传 enabled/加密开关 = 后端默认（false / 加密），这里显式给默认值
      initialValues={{ priority: 1, enabled: true, serverSecretEncrypted: true }}
      submitter={{
        searchConfig: { submitText: '保存', resetText: '取消' },
        submitButtonProps: { loading: saving },
      }}
      onFinish={async (values) => {
        await onSubmit({
          vendor: values.vendor.trim(),
          serverKey: values.serverKey?.trim() || undefined,
          serverSecret: values.serverSecret?.trim() || undefined,
          clientKey: values.clientKey?.trim() || undefined,
          priority: values.priority,
          enabled: values.enabled,
          serverSecretEncrypted: values.serverSecretEncrypted,
        })
        return true
      }}
    >
      <GeoChannelFormFields isEdit={false} />
    </ModalForm>
  )
}
