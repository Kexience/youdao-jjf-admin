import { UploadOutlined } from '@ant-design/icons'
import { ProForm } from '@ant-design/pro-components'
import { App, Avatar, Button, Form, Upload } from 'antd'
import { useState } from 'react'

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
  const [form] = Form.useForm<Record<string, string | undefined>>()
  // 右侧头像预览需订阅 avatar 字段：必须用带 form 实例的 useWatch，
  // 不能用 ProFormDependency（它依赖 FormContext，只能写在 ProForm 内部，
  // 放在右侧预览列会导致 "Can not find FormContext" 警告）。
  const avatarKey = Form.useWatch('avatar', form)
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
   * 落库用对象 key（读接口会按 key 解析出可读地址），
   * 同时同步左侧表单的 avatar 字段，保持两边一致。
   */
  const handleAvatarFile = async (file: File) => {
    setUploading(true)
    try {
      const { key } = await uploadImageViaCredential(file, AVATAR_ZONE)
      form.setFieldValue('avatar', key)
      await updateMutation.mutateAsync({ id: profile.id, params: { avatar: key } })
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
          form={form}
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
            // 保存只提交文本资料，avatar 只走上传按钮直写，这里不提交
            await updateMutation.mutateAsync({
              id: profile.id,
              params: {
                realname: values.realname?.trim() || undefined,
                nickname: values.nickname?.trim() || undefined,
                phone: values.phone?.trim() || undefined,
                email: values.email?.trim() || undefined,
                remark: values.remark?.trim() || undefined,
              },
            })
          }}
        >
          <AdminUserFormFields avatarReadOnly />
        </ProForm>
      </div>
      <div style={{ width: 200, flexShrink: 0, textAlign: 'center' }}>
        <div style={{ marginBottom: 12 }}>头像</div>
        <Avatar
          size={144}
          // 表单 avatar 字段是只读展示：可能是对象 key（上传后写入），
          // 也可能是老数据里的完整 URL；只有 http(s) 才直接预览，
          // 否则用画像里后端解析好的地址
          src={isHttpUrl(avatarKey) ? avatarKey : profile.avatar || undefined}
          icon={displayNameOf(profile).slice(0, 1)}
          style={{ marginBottom: 16 }}
        />
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

/** 是否完整 URL（对象 key 不算，预览不了） */
function isHttpUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https?:\/\//.test(value)
}
