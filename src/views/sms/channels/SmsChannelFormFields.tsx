import {
  ProForm,
  ProFormDigit,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components'

/**
 * 通道表单公共字段（新建 / 编辑共用）。
 * 编辑时 Secret 留空表示保留原值（响应恒为掩码，见 PUT 文档）。
 */
export function SmsChannelFormFields({ isEdit }: { isEdit: boolean }) {
  return (
    <>
      <ProForm.Group>
        <ProFormText
          width="md"
          name="vendor"
          label="厂商标识"
          placeholder="如 aliyun"
          rules={[{ required: true, message: '请输入厂商标识' }]}
        />
        <ProFormText
          width="md"
          name="signName"
          label="短信签名"
          placeholder="短信签名（可选）"
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText
          width="md"
          name="accessKeyId"
          label="AccessKey ID"
          placeholder="AccessKey ID（可选）"
        />
        <ProFormText.Password
          width="md"
          name="accessKeySecret"
          label="AccessKey Secret"
          placeholder={isEdit ? '留空保留原值' : 'AccessKey Secret（可选）'}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormDigit
          width="xs"
          name="priority"
          label="优先级（1 最高，全局唯一）"
          placeholder="请输入优先级"
          min={1}
          rules={[{ required: true, message: '请输入优先级' }]}
        />
        <ProFormDigit
          width="xs"
          name="unitPrice"
          label="单条单价（元）"
          placeholder="单条单价（可选）"
          min={0}
          fieldProps={{ precision: 4 }}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormSwitch
          name="enabled"
          label="启用状态"
          tooltip="不传视为 false；关闭的通道不参与发送"
          checkedChildren="启用"
          unCheckedChildren="停用"
        />
        <ProFormSwitch
          name="accessKeySecretEncrypted"
          label="Secret 加密存储"
          tooltip="新增默认加密存储"
          checkedChildren="加密"
          unCheckedChildren="明文"
        />
      </ProForm.Group>
    </>
  )
}
