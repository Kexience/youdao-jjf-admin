import { ProFormText, ProFormTextArea } from '@ant-design/pro-components'

/** 手机号校验：文档 pattern ^$|^1[3-9]\d{9}$（空=不填） */
const PHONE_PATTERN = /^$|^1[3-9]\d{9}$/

/**
 * 管理员资料表单公共字段（详情页编辑用）。
 * 可编辑项以文档 AdminUserUpdateRequest 为准：
 * realname / nickname / phone / email / avatar / remark，
 * 用户名 / 密码 / 状态 / 角色不在此改。
 *
 * avatarReadOnly：个人中心场景传 true（头像只走上传按钮直写，
 * 点保存不再提交 avatar 字段，文本框仅展示当前 key）。
 * hideAvatar：新建场景传 true（头像不在创建时设置，详情/编辑再补）。
 */
export function AdminUserFormFields({
  avatarReadOnly,
  hideAvatar,
}: {
  avatarReadOnly?: boolean
  hideAvatar?: boolean
}) {
  return (
    <>
      <ProFormText
        width="md"
        name="realname"
        label="真实姓名"
        placeholder="真实姓名（可选）"
        rules={[{ max: 64, message: '真实姓名最多 64 个字符' }]}
        fieldProps={{ maxLength: 64 }}
      />
      <ProFormText
        width="md"
        name="nickname"
        label="昵称"
        placeholder="昵称（可选）"
        rules={[{ max: 64, message: '昵称最多 64 个字符' }]}
        fieldProps={{ maxLength: 64 }}
      />
      <ProFormText
        width="md"
        name="phone"
        label="手机号"
        placeholder="手机号（可选）"
        rules={[{ pattern: PHONE_PATTERN, message: '手机号格式不正确' }]}
        fieldProps={{ maxLength: 11 }}
      />
      <ProFormText
        width="md"
        name="email"
        label="邮箱"
        placeholder="邮箱（可选）"
        rules={[
          { type: 'email', message: '邮箱格式不正确' },
          { max: 128, message: '邮箱最多 128 个字符' },
        ]}
        fieldProps={{ maxLength: 128 }}
      />
      {!hideAvatar && (
        <ProFormText
          width="lg"
          name="avatar"
          label="头像 key"
          placeholder="对象 key，如 admin-avatar/2026/10/11/xx/xxx.png"
          rules={[{ max: 512, message: '头像 key 最多 512 个字符' }]}
          fieldProps={{ maxLength: 512, readOnly: avatarReadOnly }}
        />
      )}
      <ProFormTextArea
        width="lg"
        name="remark"
        label="备注"
        placeholder="备注（可选）"
        rules={[{ max: 500, message: '备注最多 500 个字符' }]}
        fieldProps={{ maxLength: 500, showCount: true }}
      />
    </>
  )
}
