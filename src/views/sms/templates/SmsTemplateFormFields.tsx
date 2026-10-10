import {
  ProForm,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components'

import { useGetSmsChannels } from '../../../api/smsChannels'

/** 模板表单公共字段（新建 / 编辑共用，长度上限以文档为准） */
export function SmsTemplateFormFields() {
  // 厂商必须已登记通道：选项来自通道列表，去重
  const channelsQuery = useGetSmsChannels()
  const vendorOptions = [...new Set((channelsQuery.data ?? []).map((c) => c.vendor))].map(
    (vendor) => ({ value: vendor, label: vendor }),
  )

  return (
    <>
      <ProForm.Group>
        <ProFormText
          width="md"
          name="scene"
          label="场景标识"
          tooltip="建议大写下划线，如 LOGIN"
          placeholder="如 LOGIN"
          rules={[
            { required: true, message: '请输入场景标识' },
            { max: 64, message: '场景标识最多 64 个字符' },
          ]}
          fieldProps={{ maxLength: 64 }}
        />
        <ProFormSelect
          width="md"
          name="vendor"
          label="厂商标识"
          tooltip="必须已登记通道，来自通道列表"
          placeholder="请选择厂商"
          rules={[{ required: true, message: '请选择厂商标识' }]}
          options={vendorOptions}
          fieldProps={{ loading: channelsQuery.isLoading }}
        />
      </ProForm.Group>
      <ProFormText
        name="templateCode"
        label="厂商侧模板 code"
        placeholder="厂商侧模板 code"
        rules={[
          { required: true, message: '请输入厂商侧模板 code' },
          { max: 128, message: '模板 code 最多 128 个字符' },
        ]}
        fieldProps={{ maxLength: 128 }}
      />
      <ProFormTextArea
        name="remark"
        label="人工备注"
        placeholder="人工备注（可选）"
        rules={[{ max: 255, message: '备注最多 255 个字符' }]}
        fieldProps={{ maxLength: 255, rows: 2 }}
      />
      <ProFormSwitch
        name="enabled"
        label="启用状态"
        tooltip="不传视为 false"
        checkedChildren="启用"
        unCheckedChildren="停用"
      />
    </>
  )
}
