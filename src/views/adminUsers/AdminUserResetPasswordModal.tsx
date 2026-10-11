import { ModalForm, ProFormText } from '@ant-design/pro-components'
import { Form } from 'antd'
import type { ReactElement } from 'react'

/** 重置密码表单值：与文档 AdminUserResetPasswordRequest 对应（8~32 字符） */
export interface AdminUserResetPasswordFormValues {
  newPassword: string
}

interface AdminUserResetPasswordModalProps {
  user: AdminUser
  /** 列表页传 link 按钮，详情页传页头按钮 */
  trigger: ReactElement
  saving: boolean
  onSubmit: (params: { newPassword: string }) => Promise<unknown>
}

/**
 * 重置他人密码弹窗：提交后成功自动关闭。
 * 不许重置自己/超管由后端拦截，报错由父组件的 mutation 回调透出。
 */
export function AdminUserResetPasswordModal({
  user,
  trigger,
  saving,
  onSubmit,
}: AdminUserResetPasswordModalProps) {
  const [form] = Form.useForm<AdminUserResetPasswordFormValues>()

  return (
    <ModalForm<AdminUserResetPasswordFormValues>
      name={`admin-user-reset-password-form-${user.id}`}
      title={`重置密码（${user.username}）`}
      trigger={trigger}
      form={form}
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      submitTimeout={2000}
      layout="vertical"
      submitter={{
        searchConfig: { submitText: '重置', resetText: '取消' },
        submitButtonProps: { loading: saving, danger: true },
      }}
      onFinish={async (values) => {
        await onSubmit({ newPassword: values.newPassword })
        return true
      }}
    >
      <ProFormText.Password
        width="md"
        name="newPassword"
        label="新口令"
        placeholder="8~32 个字符"
        rules={[
          { required: true, message: '请输入新口令' },
          { min: 8, message: '新口令至少 8 个字符' },
          { max: 32, message: '新口令最多 32 个字符' },
        ]}
        fieldProps={{ maxLength: 32 }}
      />
    </ModalForm>
  )
}
