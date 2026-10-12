import { ModalForm, ProFormText } from '@ant-design/pro-components'
import { App, Form } from 'antd'
import type { ReactElement } from 'react'

import { useResetAdminUserPassword } from '../../api/adminUsers'
import { ApiError } from '../../lib/request'

interface Props {
  user: AdminUser
  /** 触发按钮由调用方传入（列表列内用 link 按钮，详情页头用 danger 按钮） */
  trigger: ReactElement
}

/**
 * 重置他人密码弹窗：内部调 PUT /admin/users/{id}/password，成功自动关闭。
 * 不许重置自己/超管由后端拦截，报错由 mutation onError 透出；口令变更无需刷新页面。
 */
export function AdminUserResetPasswordModal({ user, trigger }: Props) {
  const { message } = App.useApp()
  const [form] = Form.useForm<{ newPassword: string }>()

  const resetMutation = useResetAdminUserPassword({
    onSuccess: () => message.success('密码重置成功'),
    onError: (error) =>
      message.error(error instanceof ApiError ? error.message : '操作失败，请重试'),
  })

  return (
    <ModalForm<{ newPassword: string }>
      name={`admin-user-reset-password-${user.id}`}
      title={`重置密码（${user.username}）`}
      trigger={trigger}
      form={form}
      modalProps={{ destroyOnHidden: true }}
      layout="vertical"
      submitter={{
        searchConfig: { submitText: '重置', resetText: '取消' },
        submitButtonProps: { loading: resetMutation.isPending },
      }}
      onFinish={async (values) => {
        await resetMutation.mutateAsync({ id: user.id, params: { newPassword: values.newPassword } })
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
