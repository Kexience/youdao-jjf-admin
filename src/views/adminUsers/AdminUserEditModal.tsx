import { ModalForm } from '@ant-design/pro-components'
import { Button, Form } from 'antd'

import { AdminUserFormFields } from './AdminUserFormFields'

/** 编辑管理员资料表单值：与 AdminUserUpdateParams 一一对应 */
export interface AdminUserFormValues {
  realname?: string
  nickname?: string
  phone?: string
  email?: string
  avatar?: string
  remark?: string
}

interface AdminUserEditModalProps {
  user: AdminUser
  saving: boolean
  onSubmit: (params: AdminUserUpdateParams) => Promise<unknown>
}

/** 详情初始值：取详情数据，未填字段转 undefined（空字符串提交后อย่างยิ่ง） */
function toInitialValues(user: AdminUser): AdminUserFormValues {
  return {
    realname: user.realname || undefined,
    nickname: user.nickname || undefined,
    phone: user.phone || undefined,
    email: user.email || undefined,
    avatar: user.avatar || undefined,
    remark: user.remark || undefined,
  }
}

/**
 * 编辑管理员资料弹窗：trigger 为详情页头「编辑」按钮。
 * 打开时用最新详情数据同步表单（编辑成功后详情刷新，实例复用，
 * initialValues 只在挂载时生效一次）。
 */
export function AdminUserEditModal({ user, saving, onSubmit }: AdminUserEditModalProps) {
  const [form] = Form.useForm<AdminUserFormValues>()

  return (
    <ModalForm<AdminUserFormValues>
      name={`admin-user-edit-form-${user.id}`}
      title="编辑管理员资料"
      trigger={<Button type="primary">编辑</Button>}
      form={form}
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      onOpenChange={(open) => {
        if (open) form.setFieldsValue(toInitialValues(user))
      }}
      submitTimeout={2000}
      layout="vertical"
      initialValues={toInitialValues(user)}
      submitter={{
        searchConfig: { submitText: '保存', resetText: '取消' },
        submitButtonProps: { loading: saving },
      }}
      onFinish={async (values) => {
        await onSubmit({
          realname: values.realname?.trim() || undefined,
          nickname: values.nickname?.trim() || undefined,
          phone: values.phone?.trim() || undefined,
          email: values.email?.trim() || undefined,
          avatar: values.avatar?.trim() || undefined,
          remark: values.remark?.trim() || undefined,
        })
        return true
      }}
    >
      <AdminUserFormFields />
    </ModalForm>
  )
}
