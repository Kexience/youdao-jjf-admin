import { ModalForm, ProFormText } from '@ant-design/pro-components'
import { App, Button, Form, List } from 'antd'

import { useChangeMyPassword } from '../../api/account'
import { ApiError } from '../../lib/request'

/** 自助改密表单值：旧口令 + 新口令 + 确认口令（确认口令不进接口） */
interface ChangePasswordFormValues {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

interface AccountSecurityProps {
  /** 当前登录管理员画像（展示手机/邮箱/角色等只读信息） */
  profile: AdminUser
  /** 跳到「基本设置」修改手机/邮箱 */
  onGotoBase: () => void
}

/**
 * 安全设置（对照 ant-design-pro account/settings/components/security 的 List 写法）：
 * - 账户密码：ModalForm 调 PUT /admin/users/me/password（验旧口令）；
 * - 密保手机 / 备用邮箱：展示 me 接口的真实值，修改走基本设置；
 * - 所属角色 / 登录信息：只读展示，不做 mock 的密保问题/MFA。
 */
export function AccountSecurity({ profile, onGotoBase }: AccountSecurityProps) {
  const { message } = App.useApp()
  const [form] = Form.useForm<ChangePasswordFormValues>()

  const passwordMutation = useChangeMyPassword({
    onSuccess: () => {
      message.success('密码修改成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '修改失败，请重试')
    },
  })

  const data = [
    {
      key: 'password',
      title: '账户密码',
      description: '定期更换密码可以有效保护账户安全',
      actions: [
        <ModalForm<ChangePasswordFormValues>
          key="change-password"
          name="account-change-password-form"
          title="修改密码"
          trigger={
            <Button type="link" key="modify">
              修改
            </Button>
          }
          form={form}
          autoFocusFirstInput
          modalProps={{ destroyOnHidden: true }}
          layout="vertical"
          submitter={{
            searchConfig: { submitText: '确认修改', resetText: '取消' },
            submitButtonProps: { loading: passwordMutation.isPending },
          }}
          onFinish={async (values) => {
            await passwordMutation.mutateAsync({
              oldPassword: values.oldPassword,
              newPassword: values.newPassword,
            })
            return true
          }}
        >
          <ProFormText.Password
            width="md"
            name="oldPassword"
            label="旧口令"
            placeholder="请输入当前登录密码"
            rules={[{ required: true, message: '请输入旧口令' }]}
          />
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
          <ProFormText.Password
            width="md"
            name="confirmPassword"
            label="确认新口令"
            placeholder="再次输入新口令"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请再次输入新口令' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的新口令不一致'))
                },
              }),
            ]}
            fieldProps={{ maxLength: 32 }}
          />
        </ModalForm>,
      ],
    },
    {
      key: 'phone',
      title: '密保手机',
      description: profile.phone ? `已绑定手机：${profile.phone}` : '未绑定手机，绑定后可用于找回与通知',
      actions: [
        <Button type="link" key="modify" onClick={onGotoBase}>
          {profile.phone ? '修改' : '去绑定'}
        </Button>,
      ],
    },
    {
      key: 'email',
      title: '备用邮箱',
      description: profile.email ? `已绑定邮箱：${profile.email}` : '未绑定邮箱，绑定后可用于找回与通知',
      actions: [
        <Button type="link" key="modify" onClick={onGotoBase}>
          {profile.email ? '修改' : '去绑定'}
        </Button>,
      ],
    },
    {
      key: 'role',
      title: '所属角色',
      description: profile.roleName || '无角色（请联系超级管理员分配）',
      actions: [],
    },
  ]

  return (
    <List
      itemLayout="horizontal"
      dataSource={data}
      renderItem={(item) => (
        <List.Item actions={item.actions}>
          <List.Item.Meta title={item.title} description={item.description} />
        </List.Item>
      )}
    />
  )
}
