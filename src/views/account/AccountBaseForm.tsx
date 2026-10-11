import { UploadOutlined } from '@ant-design/icons'
import type { ProFormInstance } from '@ant-design/pro-components'
import { ProForm, ProFormDependency } from '@ant-design/pro-components'
import { App, Avatar, Button, Upload } from 'antd'
import { useRef, useState } from 'react'

import { useUpdateAdminUser } from '../../api/adminUsers'
import { AVATAR_ZONE, uploadImageViaCredential } from '../../api/storageUpload'
import { ApiError } from '../../lib/request'
import { AdminUserFormFields } from '../adminUsers/AdminUserFormFields'

interface AccountBaseFormProps {
  /** 当前登录管理员画像，表单初始值来源 */
  profile: AdminUser
  /** 资料保存成功后刷新画像 */
  onSaved: () => void
}

/**
 * 基本设置（对照 ant-design-pro account/settings/components/base）：
 * 左侧 ProForm 编辑资料 + 右侧头像预览。
 * 可编辑项以文档 AdminUserUpdateRequest 为准，
 * 用户名 / 密码 / 状态 / 角色不在此改。
 */
export function AccountBaseForm({ profile, onSaved }: AccountBaseFormProps) {
  const { message } = App.useApp()
  const formRef = useRef<ProFormInstance>(undefined)
  const [uploading, setUploading] = useState(false)

  const updateMutation = useUpdateAdminUser({
    onSuccess: () => {
      message.success('基本信息更新成功')
      onSaved()
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  /**
   * 更换头像：申请上传凭证 → 直传 OSS → 确认 → 回写资料并刷新。
   * 传完直接保存（对照 Pro 版 AvatarView 的“更换头像”即时生效），
   * 同时同步左侧表单的 avatar 字段，保持两边一致。
   */
  const handleAvatarFile = async (file: File) => {
    setUploading(true)
    try {
      const url = await uploadImageViaCredential(file, AVATAR_ZONE)
      formRef.current?.setFieldValue('avatar', url)
      await updateMutation.mutateAsync({ id: profile.id, params: { avatar: url } })
    } catch (error) {
      message.error(error instanceof ApiError ? error.message : '头像上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 32 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <ProForm<Record<string, string | undefined>>
          formRef={formRef}
          layout="vertical"
          requiredMark={false}
          submitter={{
            searchConfig: { submitText: '更新基本信息' },
            render: (_, dom) => dom[1],
          }}
          initialValues={{
            realname: profile.realname || undefined,
            nickname: profile.nickname || undefined,
            phone: profile.phone || undefined,
            email: profile.email || undefined,
            avatar: profile.avatar || undefined,
            remark: profile.remark || undefined,
          }}
          onFinish={async (values) => {
            await updateMutation.mutateAsync({
              id: profile.id,
              params: {
                realname: values.realname?.trim() || undefined,
                nickname: values.nickname?.trim() || undefined,
                phone: values.phone?.trim() || undefined,
                email: values.email?.trim() || undefined,
                avatar: values.avatar?.trim() || undefined,
                remark: values.remark?.trim() || undefined,
              },
            })
          }}
        >
          <AdminUserFormFields />
        </ProForm>
      </div>
      <div style={{ width: 200, flexShrink: 0, textAlign: 'center' }}>
        <div style={{ marginBottom: 12 }}>头像</div>
        <ProFormDependency name={['avatar']}>
          {({ avatar }) => (
            <Avatar
              size={144}
              src={(typeof avatar === 'string' && avatar) || profile.avatar || undefined}
              icon={displayNameOf(profile).slice(0, 1)}
              style={{ marginBottom: 16 }}
            />
          )}
        </ProFormDependency>
        <Upload
          accept="image/*"
          showUploadList={false}
          disabled={uploading}
          beforeUpload={(file) => {
            void handleAvatarFile(file)
            return false
          }}
        >
          <Button icon={<UploadOutlined />} loading={uploading}>
            {uploading ? '上传中' : '更换头像'}
          </Button>
        </Upload>
        <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: 12, marginTop: 12 }}>
          图片直传到 {AVATAR_ZONE} 存储区，上传成功即时生效。
        </div>
      </div>
    </div>
  )
}

function displayNameOf(profile: AdminUser): string {
  return profile.nickname || profile.realname || profile.username || '管'
}
