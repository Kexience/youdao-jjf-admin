import { ModalForm } from '@ant-design/pro-components'
import { Button, Form } from 'antd'

import { RoleFormFields } from './RoleFormFields'
import type { RoleFormValues } from './RoleModal'

interface RoleEditModalProps {
  role: AdminRoleDetail
  saving: boolean
  onSubmit: (params: AdminRoleSaveParams) => Promise<unknown>
}

/** 详情初始值：取详情数据（status 非 0/1 时不传，即不改动） */
function toInitialValues(role: AdminRoleDetail): RoleFormValues {
  return {
    roleName: role.roleName,
    status: role.status === 0 || role.status === 1 ? role.status : undefined,
  }
}

/**
 * 编辑角色弹窗：trigger 为详情页头「编辑」按钮。
 * 打开时用最新详情数据同步表单（编辑成功后详情刷新，实例复用，
 * initialValues 只在挂载时生效一次）。
 */
export function RoleEditModal({ role, saving, onSubmit }: RoleEditModalProps) {
  const [form] = Form.useForm<RoleFormValues>()

  return (
    <ModalForm<RoleFormValues>
      name={`role-edit-form-${role.id}`}
      title="编辑角色"
      trigger={<Button type="primary">编辑</Button>}
      form={form}
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      onOpenChange={(open) => {
        if (open) form.setFieldsValue(toInitialValues(role))
      }}
      submitTimeout={2000}
      layout="vertical"
      initialValues={toInitialValues(role)}
      submitter={{
        searchConfig: { submitText: '保存', resetText: '取消' },
        submitButtonProps: { loading: saving },
      }}
      onFinish={async (values) => {
        await onSubmit({
          roleName: values.roleName.trim(),
          status: values.status,
        })
        return true
      }}
    >
      <RoleFormFields />
    </ModalForm>
  )
}
