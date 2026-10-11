import { ContactsOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import { Avatar, Card, Divider, Tag } from 'antd'

interface AccountProfileCardProps {
  /** 当前登录管理员画像（useMyProfile 的 data） */
  profile?: AdminUser
  /** 画像加载中 */
  loading: boolean
}

/** 手机号脱敏：138****8293，无值时返回 - */
function maskPhone(phone?: string): string {
  if (!phone || phone.length < 7) return phone || '-'
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

/**
 * 个人中心左侧画像卡（对照 ant-design-pro account/center 左侧卡）：
 * 头像 + 用户名 + 昵称/真实姓名 + 角色/联系方式/登录时间，
 * 全部字段来自 GET /admin/users/me，不做 mock。
 */
export function AccountProfileCard({ profile, loading }: AccountProfileCardProps) {
  const displayName = profile?.nickname || profile?.realname || profile?.username || '-'

  return (
    <Card bordered={false} style={{ marginBottom: 24 }} loading={loading}>
      {profile && (
        <>
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <Avatar
              size={104}
              src={profile.avatar || undefined}
              icon={!profile.avatar ? displayName.slice(0, 1) : undefined}
              style={{ marginBottom: 16 }}
            />
            <div style={{ fontSize: 20, fontWeight: 500 }}>{displayName}</div>
            <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>@{profile.username}</div>
          </div>
          <div>
            <p>
              <ContactsOutlined style={{ marginRight: 8 }} />
              {profile.roleName || '无角色'}
              {profile.status === 0 && (
                <Tag color="error" style={{ marginLeft: 8 }}>
                  已禁用
                </Tag>
              )}
              {profile.status === 1 && (
                <Tag color="success" style={{ marginLeft: 8 }}>
                  正常
                </Tag>
              )}
            </p>
            <p>
              <PhoneOutlined style={{ marginRight: 8 }} />
              {maskPhone(profile.phone)}
            </p>
            <p>
              <MailOutlined style={{ marginRight: 8 }} />
              {profile.email || '-'}
            </p>
          </div>
          <Divider dashed />
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>登录信息</div>
            <p style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
              最近登录：{profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : '-'}
            </p>
            {profile.remark && (
              <p style={{ color: 'rgba(0, 0, 0, 0.45)' }}>备注：{profile.remark}</p>
            )}
          </div>
        </>
      )}
    </Card>
  )
}
