import { ProFormSelect, ProFormText } from '@ant-design/pro-components'

/**
 * 角色表单公共字段（新建用，后续编辑可复用）。
 * status 为数字枚举 0/1（见文档 AdminRoleSaveRequest.status），
 * 新建默认启用（文档：status 为空新建时默认启用）。
 */
export function RoleFormFields() {
  return (
    <>
      <ProFormText
        width="md"
        name="roleName"
        label="角色名"
        tooltip="全局唯一"
        placeholder="如 运营专员"
        rules={[
          { required: true, message: '请输入角色名' },
          { max: 64, message: '角色名最多 64 个字符' },
        ]}
        fieldProps={{ maxLength: 64 }}
      />
      <ProFormSelect
        width="xs"
        name="status"
        label="状态"
        tooltip="不选默认启用"
        placeholder="请选择状态"
        options={[
          { value: 1, label: '启用' },
          { value: 0, label: '停用' },
        ]}
      />
    </>
  )
}
