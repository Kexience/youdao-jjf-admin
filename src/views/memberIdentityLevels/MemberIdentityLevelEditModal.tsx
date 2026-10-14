import { ModalForm } from '@ant-design/pro-components'
import { Button, Form } from 'antd'

import { MemberIdentityLevelFormFields } from './MemberIdentityLevelFormFields'
import type { MemberIdentityLevelRankOption } from './MemberIdentityLevelFormFields'
import type { MemberIdentityLevelFormValues } from './MemberIdentityLevelModal'

interface MemberIdentityLevelEditModalProps {
  level: MemberIdentityLevel
  saving: boolean
  /** 方式2锚点档位候选（启用档位的 levelCode），透传给表单字段 */
  levelOptions?: MemberIdentityLevelRankOption[]
  onSubmit: (params: MemberIdentityLevelUpdateParams) => Promise<unknown>
}

/** 行内初始值：取行数据，数值为空时给 0 兜底避免 Digit 受控告警 */
function toInitialValues(level: MemberIdentityLevel): MemberIdentityLevelFormValues {
  return {
    levelName: level.levelName ?? '',
    sort: level.sort ?? 0,
    growthRequired: level.growthRequired ?? 0,
    consumeDiscount: level.consumeDiscount ?? 100,
    status: (level.status === 0 ? 0 : 1) as 0 | 1,
    remark: level.remark,
    levelCode: level.levelCode,
    upgradeType: level.upgradeType === 1 || level.upgradeType === 2 ? level.upgradeType : undefined,
    upgradeConsumeAmount: level.upgradeConsumeAmount,
    upgradeReferralCount: level.upgradeReferralCount,
    upgradeReferralRank: level.upgradeReferralRank,
    upgradeRewardPoint: level.upgradeRewardPoint,
  }
}

/** 按升级方式归一化升级配置：无关字段清空，绝对不存在「方式1+方式2字段混报」 */
function normalizeUpgrade(
  values: Pick<
    MemberIdentityLevelFormValues,
    | 'upgradeType'
    | 'upgradeConsumeAmount'
    | 'upgradeReferralCount'
    | 'upgradeReferralRank'
    | 'upgradeRewardPoint'
  >,
): MemberIdentityLevelUpgradeConfig {
  if (!values.upgradeType) {
    // 升级方式为空：整体替换为「仅后台手动」（组内字段全部为空）
    return { upgradeRewardPoint: values.upgradeRewardPoint }
  }
  return {
    upgradeType: values.upgradeType,
    upgradeConsumeAmount:
      values.upgradeType === 1 ? values.upgradeConsumeAmount : undefined,
    upgradeReferralCount:
      values.upgradeType === 2 ? values.upgradeReferralCount : undefined,
    upgradeReferralRank: values.upgradeType === 2 ? values.upgradeReferralRank : undefined,
    upgradeRewardPoint: values.upgradeRewardPoint,
  }
}

/** 行数据归一化为升级配置，与表单归一化结果同构，用于「未修改就不传 upgrade」的对比 */
function toLevelUpgrade(level: MemberIdentityLevel): MemberIdentityLevelUpgradeConfig {
  return normalizeUpgrade({
    upgradeType:
      level.upgradeType === 1 || level.upgradeType === 2 ? level.upgradeType : undefined,
    upgradeConsumeAmount: level.upgradeConsumeAmount,
    upgradeReferralCount: level.upgradeReferralCount,
    upgradeReferralRank: level.upgradeReferralRank,
    upgradeRewardPoint: level.upgradeRewardPoint,
  })
}

/**
 * 编辑身份档位弹窗：每行独立实例，trigger 为行内「编辑」。
 * 打开时用最新行数据同步表单（列表刷新后实例复用，initialValues 只在挂载时生效一次）。
 * UpdateDto.upgrade「空=保持原值，非空整体替换」：与本行原值相同（未改动）时不传该字段。
 */
export function MemberIdentityLevelEditModal({
  level,
  saving,
  levelOptions,
  onSubmit,
}: MemberIdentityLevelEditModalProps) {
  const [form] = Form.useForm<MemberIdentityLevelFormValues>()

  return (
    <ModalForm<MemberIdentityLevelFormValues>
      name={`member-identity-level-edit-form-${level.id}`}
      title="编辑身份档位"
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
        const upgrade = normalizeUpgrade(values)
        const upgradeChanged =
          JSON.stringify(upgrade) !== JSON.stringify(toLevelUpgrade(level))
        await onSubmit({
          levelName: values.levelName.trim(),
          sort: values.sort,
          consumeDiscount: values.consumeDiscount,
          growthRequired: values.growthRequired,
          status: values.status,
          remark: values.remark?.trim() || undefined,
          ...(upgradeChanged ? { upgrade } : {}),
        })
        return true
      }}
    >
      <MemberIdentityLevelFormFields isEdit levelCode={level.levelCode} levelOptions={levelOptions} />
    </ModalForm>
  )
}
