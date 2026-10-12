import { ProFormSelect, ProFormTextArea } from '@ant-design/pro-components'
import { ModalForm } from '@ant-design/pro-components'
import { Button } from 'antd'

import { useGetMemberLevels } from '../../api/memberLevels'

interface MemberLevelAssignModalProps {
  memberId: number
  /** 当前等级 id，用于默认选中并标注「当前」 */
  currentLevelId?: number
  saving: boolean
  onSubmit: (params: MemberLevelAssignParams) => Promise<unknown>
}

interface AssignFormValues {
  levelId: number
  remark?: string
}

/**
 * 调整会员等级弹窗：选项来自等级列表（含停用，停用档不可再选）。
 * 同等级重复提交后端幂等返回，这里不额外拦截。
 */
export function MemberLevelAssignModal({
  memberId,
  currentLevelId,
  saving,
  onSubmit,
}: MemberLevelAssignModalProps) {
  const levelsQuery = useGetMemberLevels()

  const options = (levelsQuery.data ?? [])
    .filter((level) => level.status !== 0)
    .map((level) => ({
      value: level.id,
      label:
        level.id === currentLevelId
          ? `${level.levelName ?? `等级 ${level.id}`}（当前）`
          : (level.levelName ?? `等级 ${level.id}`),
    }))

  return (
    <ModalForm<AssignFormValues>
      name={`member-level-assign-form-${memberId}`}
      title="调整会员等级"
      trigger={
        <Button type="primary" disabled={levelsQuery.isError}>
          调整等级
        </Button>
      }
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      submitTimeout={2000}
      layout="vertical"
      initialValues={{ levelId: currentLevelId }}
      submitter={{
        searchConfig: { submitText: '确认调整', resetText: '取消' },
        submitButtonProps: { loading: saving },
      }}
      onFinish={async (values) => {
        await onSubmit({
          levelId: values.levelId,
          remark: values.remark?.trim() || undefined,
        })
        return true
      }}
    >
      <ProFormSelect
        width="md"
        name="levelId"
        label="目标等级"
        placeholder="请选择目标等级"
        options={options}
        rules={[{ required: true, message: '请选择目标等级' }]}
        fieldProps={{ loading: levelsQuery.isLoading }}
      />
      <ProFormTextArea
        name="remark"
        label="调整备注"
        placeholder="调整原因（可选）"
        rules={[{ max: 255, message: '备注最多 255 个字符' }]}
        fieldProps={{ maxLength: 255, rows: 2 }}
      />
    </ModalForm>
  )
}
