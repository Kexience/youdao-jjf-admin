import {
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components'

import { READ_POLICY_OPTIONS, WRITE_POLICY_OPTIONS } from './policies'

/**
 * Zone 表单公共字段（新建 / 编辑共用）。
 * 数组类白名单用逗号分隔文本输入，提交时拆为数组；编辑初始值由调用方 join 回字符串。
 * prefix 仅新建可填，enabled 仅编辑可改（与两份 DTO 对齐）。
 */
export function StorageZoneFormFields({ isEdit }: { isEdit: boolean }) {
  return (
    <>
      {!isEdit && (
        <ProFormText
          width="md"
          name="prefix"
          label="地址前缀"
          tooltip="必须以 / 结尾"
          placeholder="如 /avatar/"
          rules={[{ required: true, message: '请输入地址前缀' }]}
        />
      )}
      <ProForm.Group>
        <ProFormSelect
          width="md"
          name="writePolicy"
          label="写策略"
          placeholder="请选择写策略"
          options={WRITE_POLICY_OPTIONS}
          rules={isEdit ? [] : [{ required: true, message: '请选择写策略' }]}
        />
        <ProFormSelect
          width="md"
          name="readPolicy"
          label="读策略"
          placeholder="请选择读策略"
          options={READ_POLICY_OPTIONS}
          rules={isEdit ? [] : [{ required: true, message: '请选择读策略' }]}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormDigit
          width="md"
          name="maxSizeBytes"
          label="单文件大小上限（字节）"
          placeholder="请输入字节数"
          min={1}
          rules={isEdit ? [] : [{ required: true, message: '请输入单文件大小上限' }]}
        />
        <ProFormDigit
          width="xs"
          name="uploadPolicyExpireSeconds"
          label="上传凭证有效期（秒）"
          tooltip="空=默认 300"
          placeholder="默认 300"
          min={1}
        />
        <ProFormDigit
          width="xs"
          name="viewUrlExpireSeconds"
          label="读 URL 有效期（秒）"
          tooltip="空=默认 600"
          placeholder="默认 600"
          min={1}
        />
      </ProForm.Group>
      <ProFormText
        name="allowContentTypes"
        label="content-type 白名单"
        tooltip="多个用逗号分隔，空=不限制"
        placeholder="如 image/png,image/jpeg（可选）"
      />
      <ProForm.Group>
        <ProFormText
          width="md"
          name="allowExts"
          label="后缀白名单"
          tooltip="多个用逗号分隔，空=不限制"
          placeholder="如 png,jpg（可选）"
        />
        <ProFormText
          width="md"
          name="processStyles"
          label="图片处理 style 白名单"
          tooltip="多个用逗号分隔，空=不启用"
          placeholder="（可选）"
        />
      </ProForm.Group>
      {isEdit && (
        <ProFormSwitch
          name="enabled"
          label="启用状态"
          checkedChildren="启用"
          unCheckedChildren="停用"
        />
      )}
    </>
  )
}
