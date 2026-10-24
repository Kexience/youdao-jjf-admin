import {
  ProForm,
  ProFormDigit,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components'

/**
 * 地图通道表单公共字段（新建 / 编辑共用）。
 * 字段以线上文档 GeoChannelSaveRequest 为准；编辑时 Secret 留空表示保留原值
 * （响应恒为掩码，见 PUT 修改通道文档）。
 */
export function GeoChannelFormFields({ isEdit }: { isEdit: boolean }) {
  return (
    <>
      <ProForm.Group>
        <ProFormText
          width="md"
          name="vendor"
          label="厂商标识"
          placeholder="如 tencent"
          rules={[{ required: true, message: '请输入厂商标识' }]}
        />
        <ProFormDigit
          width="xs"
          name="priority"
          label="优先级（1 最高，全局唯一）"
          placeholder="请输入优先级"
          min={1}
          rules={[{ required: true, message: '请输入优先级' }]}
        />
      </ProForm.Group>
      <ProFormText
        name="serverKey"
        label="服务端 Key"
        tooltip="厂商 WebService API 调用凭证"
        placeholder="服务端 Key（可选）"
      />
      <ProFormText.Password
        name="serverSecret"
        label="服务端 Secret"
        placeholder={isEdit ? '留空保留原值' : '服务端 Secret（可选）'}
      />
      <ProFormText
        name="clientKey"
        label="前端公开 Key"
        tooltip="H5/PC 地图渲染用的公开 key"
        placeholder="前端公开 Key（可选）"
      />
      <ProForm.Group>
        <ProFormSwitch
          name="enabled"
          label="启用状态"
          tooltip="新增不传=默认处理；修改不传=保留原值"
          checkedChildren="启用"
          unCheckedChildren="停用"
        />
        <ProFormSwitch
          name="serverSecretEncrypted"
          label="Secret 加密存储"
          tooltip="新增默认加密存储；修改不传保留原值"
          checkedChildren="加密"
          unCheckedChildren="明文"
        />
      </ProForm.Group>
    </>
  )
}
