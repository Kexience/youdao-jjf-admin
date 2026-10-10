import { ModalForm } from '@ant-design/pro-components'
import { Button, Form } from 'antd'

import { SmsTemplateFormFields } from './SmsTemplateFormFields'
import type { SmsTemplateFormValues } from './SmsTemplateModal'

interface SmsTemplateEditModalProps {
  template: SmsTemplate
  saving: boolean
  onSubmit: (params: SmsTemplateSaveParams) => Promise<unknown>
}

/** 行内初始值：取行数据 */
function toInitialValues(template: SmsTemplate): SmsTemplateFormValues {
  return {
    scene: template.scene,
    vendor: template.vendor,
    templateCode: template.templateCode,
    enabled: template.enabled,
    remark: template.remark,
  }
}

/**
 * 编辑短信模板弹窗：每行独立实例，trigger 为行内「编辑」。
 * 打开时用最新行数据同步表单（列表刷新后实例复用，initialValues 只在挂载时生效一次）。
 */
export function SmsTemplateEditModal({ template, saving, onSubmit }: SmsTemplateEditModalProps) {
  const [form] = Form.useForm<SmsTemplateFormValues>()

  return (
    <ModalForm<SmsTemplateFormValues>
      name={`sms-template-edit-form-${template.id}`}
      title="编辑短信模板"
      trigger={
        <Button type="link" size="small">
          编辑
        </Button>
      }
      form={form}
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      onOpenChange={(open) => {
        if (open) form.setFieldsValue(toInitialValues(template))
      }}
      submitTimeout={2000}
      layout="vertical"
      initialValues={toInitialValues(template)}
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
