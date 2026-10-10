import { PlusOutlined } from '@ant-design/icons'
import { ModalForm } from '@ant-design/pro-components'
import { Button, Form } from 'antd'

import { SmsTemplateFormFields } from './SmsTemplateFormFields'

/** 新建模板弹窗表单值：与 SmsTemplateSaveParams 一一对应 */
export interface SmsTemplateFormValues {
  scene: string
  vendor: string
  templateCode: string
  enabled: boolean
  remark?: string
}

interface SmsTemplateModalProps {
  saving: boolean
  onSubmit: (params: SmsTemplateSaveParams) => Promise<unknown>
}

/**
 * 新增短信模板弹窗：按钮即 trigger，提交成功自动关闭。
 * 成功提示与失败提示由父组件的 mutation 回调负责。
 */
export function SmsTemplateModal({ saving, onSubmit }: SmsTemplateModalProps) {
  const [form] = Form.useForm<SmsTemplateFormValues>()

  return (
    <ModalForm<SmsTemplateFormValues>
      name="sms-template-modal-form"
      title="新增短信模板"
      trigger={
        <Button type="primary">
          <PlusOutlined />
          新增模板
        </Button>
      }
      form={form}
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      submitTimeout={2000}
      layout="vertical"
      initialValues={{ enabled: false }}
      submitter={{
        searchConfig: { submitText: '保存', resetText: '取消' },
        submitButtonProps: { loading: saving },
      }}
      onFinish={async (values) => {
        await onSubmit({
          scene: values.scene.trim(),
          vendor: values.vendor.trim(),
          templateCode: values.templateCode.trim(),
          enabled: values.enabled,
          remark: values.remark?.trim() || undefined,
        })
        return true
      }}
    >
      <SmsTemplateFormFields />
    </ModalForm>
  )
}
