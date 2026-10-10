import { PlusOutlined } from '@ant-design/icons'
import { ModalForm } from '@ant-design/pro-components'
import { Button, Form } from 'antd'

import { RoleFormFields } from './RoleFormFields'

/** 新建角色弹窗表单值：与 AdminRoleSaveParams 一一对应 */
export interface RoleFormValues {
  roleName: string
  status?: 0 | 1
}

interface RoleModalProps {
  saving: boolean
  onSubmit: (params: AdminRoleSaveParams) => Promise<unknown>
}

/**
 * 新增角色弹窗：按钮即 trigger，提交成功自动关闭。
 * 成功提示与失败提示由父组件的 mutation 回调负责。
 */
export function RoleModal({ saving, onSubmit }: RoleModalProps) {
  const [form] = Form.useForm<RoleFormValues>()

  return (
    <ModalForm<RoleFormValues>
      name="role-modal-form"
      title="新增角色"
      trigger={
        <Button type="primary">
          <PlusOutlined />
          新增角色
        </Button>
      }
      form={form}
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      submitTimeout={2000}
      layout="vertical"
      initialValues={{ status: 1 as const }}
      submitter={{
        searchConfig: { submitText: '保存', resetText: '取消' },
        submitButtonProps: { loading: saving },
      }}
      onFinish={async (values) => {
        await onSubmit({
          roleName: values.roleName.trim(),
          status: values.status,
        })
        return true
      }}
    >
      <RoleFormFields />
    </ModalForm>
  )
}
