import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { LoginForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-components'
import { useNavigate } from '@tanstack/react-router'
import { App, theme } from 'antd'
import type { ReactNode } from 'react'

import { login } from '../api/auth'
import { ApiError } from '../lib/request'

/** 登录表单值：全局 AdminLoginParams + 记住我（仅 UI，不影响 token 持久化） */
type LoginFormValues = AdminLoginParams & {
  autoLogin?: boolean
}

interface LoginProps {
  logo?: ReactNode
}

/**
 * 登录页：调用 POST /admin/auth/login，成功后持久化 token 并跳首页。
 * 注意：全局已有 ThemeProvider 内置的 <App>，此处直接用 App.useApp() 即可。
 */
export function Login({ logo }: LoginProps) {
  return <LoginContent logo={logo} />
}

function LoginContent({ logo }: LoginProps) {
  const { token } = theme.useToken()
  const { message } = App.useApp()
  const navigate = useNavigate()

  const onFinish = async (values: LoginFormValues) => {
    try {
      await login({ username: values.username, password: values.password })
      message.success('登录成功')
      await navigate({ to: '/' })
    } catch (error) {
      message.error(error instanceof ApiError ? error.message : '登录失败，请重试')
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: token.colorBgLayout,
      }}
    >
      <LoginForm<LoginFormValues>
        logo={
          logo ?? (
            <span
              style={{
                display: 'inline-flex',
                width: 32,
                height: 32,
                borderRadius: 6,
                alignItems: 'center',
                justifyContent: 'center',
                background: token.colorPrimary,
                color: token.colorTextLightSolid,
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              优
            </span>
          )
        }
        title="优道管理端"
        subTitle="Youdao JJF Admin Console"
        onFinish={onFinish}
      >
        <ProFormText
          name="username"
          fieldProps={{
            size: 'large',
            prefix: <UserOutlined style={{ color: token.colorTextQuaternary }} />,
            placeholder: '请输入用户名',
          }}
          rules={[{ required: true, message: '请输入用户名!' }]}
        />
        <ProFormText.Password
          name="password"
          fieldProps={{
            size: 'large',
            prefix: <LockOutlined style={{ color: token.colorTextQuaternary }} />,
            placeholder: '请输入密码',
          }}
          rules={[{ required: true, message: '请输入密码！' }]}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBlockEnd: 24,
          }}
        >
          <ProFormCheckbox name="autoLogin" noStyle>
            记住我
          </ProFormCheckbox>
        </div>
      </LoginForm>
    </div>
  )
}
