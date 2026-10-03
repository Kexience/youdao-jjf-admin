import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { LoginForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-components'
import { App, Alert, Space, theme } from 'antd'
import type { ReactNode } from 'react'

/** 登录表单值类型 */
interface LoginParams {
  username: string
  password: string
  autoLogin?: boolean
}

interface LoginProps {
  logo?: ReactNode
}

/**
 * 登录页（演示：未对接接口，提交仅本地提示）
 * 注意：全局已有 ThemeProvider 内置的 <App>，此处直接用 App.useApp() 即可。
 */
export function Login({ logo }: LoginProps) {
  return <LoginContent logo={logo} />
}

function LoginContent({ logo }: LoginProps) {
  const { token } = theme.useToken()
  const { message } = App.useApp()

  // TODO: 未对接接口，后续在此调用登录 API
  const onFinish = async (values: LoginParams) => {
    console.log('登录提交（演示，未对接接口）：', values)
    message.success('登录成功（演示环境，未对接接口）')
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
      <LoginForm<LoginParams>
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
        message={
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message="演示环境：账号密码任意填写即可登录"
          />
        }
        onFinish={onFinish}
        actions={
          <Space>
            还没有账号？
            <a>立即注册</a>
          </Space>
        }
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
            justifyContent: 'space-between',
            marginBlockEnd: 24,
          }}
        >
          <ProFormCheckbox name="autoLogin" noStyle>
            记住我
          </ProFormCheckbox>
          <a>忘记密码</a>
        </div>
      </LoginForm>
    </div>
  )
}
