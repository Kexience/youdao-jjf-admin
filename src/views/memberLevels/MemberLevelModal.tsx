import { PlusOutlined } from '@ant-design/icons'
import { ModalForm } from '@ant-design/pro-components'
import { Button, Form } from 'antd'

import { MemberLevelFormFields } from './MemberLevelFormFields'

/** 新建等级表单值：与 MemberLevelCreateParams 一一对应 */
export interface MemberLevelFormValues {
  levelName: string
  sort: number
  growthRequired: number
  consumeDiscount: number
  status: 0 | 1
  isDefault?: boolean
  remark?: string
  /** 仅编辑态回显，不参与提交 */
  levelCode?: string
}

interface MemberLevelModalProps {
  saving: boolean
  onSubmit: (params: MemberLevelCreateParams) => Promise<unknown>
}

/**
 * 新增等级弹窗：按钮即 trigger，提交成功自动关闭。
 * 成功提示与失败提示由父组件的 mutation 回调负责。
 */
export function MemberLevelModal({ saving, onSubmit }: MemberLevelModalProps) {
  const [form] = Form.useForm<MemberLevelFormValues>()

  return (
    <ModalForm<MemberLevelFormValues>
      name="member-level-modal-form"
      title="新增会员等级"
      trigger={
        <Button type="primary">
          <PlusOutlined />
          新增等级
        </Button>
      }
      form={form}
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      submitTimeout={2000}
      layout="vertical"
      initialValues={{ status: 1, isDefault: false, consumeDiscount: 100 }}
      submitter={{
        searchConfig: { submitText: '保存', resetText: '取消' },
        submitButtonProps: { loading: saving },
      }}
      onFinish={async (values) => {
        await onSubmit({
          levelName: values.levelName.trim(),
          sort: values.sort,
          consumeDiscount: values.consumeDiscount,
          growthRequired: values.growthRequired,
          status: values.status,
          isDefault: values.isDefault ?? false,
          remark: values.remark?.trim() || undefined,
        })
        return true
      }}
    >
      <MemberLevelFormFields />
    </ModalForm>
  )
}
