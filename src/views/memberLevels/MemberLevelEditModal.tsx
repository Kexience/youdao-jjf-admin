import { ModalForm } from '@ant-design/pro-components'
import { Button, Form } from 'antd'

import { MemberLevelFormFields } from './MemberLevelFormFields'
import type { MemberLevelFormValues } from './MemberLevelModal'

interface MemberLevelEditModalProps {
  level: MemberLevel
  saving: boolean
  onSubmit: (params: MemberLevelUpdateParams) => Promise<unknown>
}

/** 行内初始值：取行数据，数值为空时给 0 兜底避免 Digit 受控告警 */
function toInitialValues(level: MemberLevel): MemberLevelFormValues {
  return {
    levelName: level.levelName ?? '',
    sort: level.sort ?? 0,
    growthRequired: level.growthRequired ?? 0,
    consumeDiscount: level.consumeDiscount ?? 100,
    status: (level.status === 0 ? 0 : 1) as 0 | 1,
    remark: level.remark,
    levelCode: level.levelCode,
  }
}

/**
 * 编辑等级弹窗：每行独立实例，trigger 为行内「编辑」。
 * 打开时用最新行数据同步表单（列表刷新后实例复用，initialValues 只在挂载时生效一次）。
 */
export function MemberLevelEditModal({ level, saving, onSubmit }: MemberLevelEditModalProps) {
  const [form] = Form.useForm<MemberLevelFormValues>()

  return (
    <ModalForm<MemberLevelFormValues>
      name={`member-level-edit-form-${level.id}`}
      title="编辑会员等级"
      trigger={
        <Button type="link" size="small">
          编辑
        </Button>
      }
      form={form}
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      onOpenChange={(open) => {
        if (open) form.setFieldsValue(toInitialValues(level))
      }}
      submitTimeout={2000}
      layout="vertical"
      initialValues={toInitialValues(level)}
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
          remark: values.remark?.trim() || undefined,
        })
        return true
      }}
    >
      <MemberLevelFormFields isEdit levelCode={level.levelCode} />
    </ModalForm>
  )
}
