import { PlusOutlined } from '@ant-design/icons'
import { ModalForm, ProFormSelect, ProFormSwitch, ProFormText, ProFormTextArea } from '@ant-design/pro-components'
import { Button, Form } from 'antd'

/** 新增黑名单弹窗表单值：与 SmsBlacklistAddParams 一一对应 */
export interface SmsBlacklistFormValues {
  type: SmsBlacklistType
  value: string
  reason?: string
  enabled: boolean
}

interface SmsBlacklistModalProps {
  saving: boolean
  onSubmit: (params: SmsBlacklistAddParams) => Promise<unknown>
}

/**
 * 新增黑名单项弹窗：按钮即 trigger，提交成功自动关闭。
 * 成功提示与失败提示由父组件的 mutation 回调负责。
 */
export function SmsBlacklistModal({ saving, onSubmit }: SmsBlacklistModalProps) {
  const [form] = Form.useForm<SmsBlacklistFormValues>()

  return (
    <ModalForm<SmsBlacklistFormValues>
      name="sms-blacklist-modal-form"
      title="新增黑名单项"
      trigger={
        <Button type="primary">
          <PlusOutlined />
          加入黑名单
        </Button>
      }
      form={form}
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      submitTimeout={2000}
      layout="vertical"
      initialValues={{ type: 'MOBILE', enabled: true }}
      submitter={{
        searchConfig: { submitText: '保存', resetText: '取消' },
        submitButtonProps: { loading: saving },
      }}
      onFinish={async (values) => {
        await onSubmit({
          type: values.type,
          value: values.value.trim(),
          reason: values.reason?.trim() || undefined,
          enabled: values.enabled,
        })
        return true
      }}
    >
      <ProFormSelect
        name="type"
        width="md"
        label="拦截维度"
        placeholder="请选择拦截维度"
        rules={[{ required: true, message: '请选择拦截维度' }]}
        options={[
          { value: 'MOBILE', label: '手机号' },
          { value: 'IP', label: 'IP' },
          { value: 'DEVICE', label: '设备标识' },
        ]}
      />
      <ProFormText
        name="value"
        width="md"
        label="维度值"
        tooltip="按所选维度填写：手机号 / IP / 设备标识"
        placeholder="手机号 / IP / 设备标识"
        rules={[
          { required: true, message: '请输入维度值' },
          { max: 128, message: '维度值最多 128 个字符' },
        ]}
        fieldProps={{ maxLength: 128 }}
      />
      <ProFormTextArea
        name="reason"
        label="原因备注"
        placeholder="原因备注（可选）"
        rules={[{ max: 255, message: '备注最多 255 个字符' }]}
        fieldProps={{ maxLength: 255, rows: 2 }}
      />
      <ProFormSwitch
        name="enabled"
        label="启用状态"
        tooltip="停用后不参与拦截，记录保留"
        checkedChildren="启用"
        unCheckedChildren="停用"
      />
    </ModalForm>
  )
}
