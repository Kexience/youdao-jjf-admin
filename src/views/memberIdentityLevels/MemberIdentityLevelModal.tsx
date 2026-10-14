import { PlusOutlined } from '@ant-design/icons'
import { ModalForm } from '@ant-design/pro-components'
import { Button, Form } from 'antd'

import { MemberIdentityLevelFormFields } from './MemberIdentityLevelFormFields'
import type { MemberIdentityLevelRankOption } from './MemberIdentityLevelFormFields'

/** 新建档位表单值：提交前组装为 MemberIdentityLevelCreateParams（upgrade 组平铺） */
export interface MemberIdentityLevelFormValues {
  levelName: string
  sort: number
  growthRequired: number
  consumeDiscount: number
  status: 0 | 1
  isDefault?: boolean
  remark?: string
  /** 升级配置组（升级方式为空=仅后台手动） */
  upgradeType?: 1 | 2
  upgradeConsumeAmount?: number
  upgradeReferralCount?: number
  upgradeReferralRank?: string
  upgradeRewardPoint?: number
  /** 仅编辑态回显，不参与提交 */
  levelCode?: string
}

interface MemberIdentityLevelModalProps {
  saving: boolean
  /** 方式2锚点档位候选（启用档位的 levelCode），透传给表单字段 */
  levelOptions?: MemberIdentityLevelRankOption[]
  onSubmit: (params: MemberIdentityLevelCreateParams) => Promise<unknown>
}

/**
 * 新增身份档位弹窗：按钮即 trigger，提交成功自动关闭。
 * 成功提示与失败提示由父组件的 mutation 回调负责。
 */
export function MemberIdentityLevelModal({
  saving,
  levelOptions,
  onSubmit,
}: MemberIdentityLevelModalProps) {
  const [form] = Form.useForm<MemberIdentityLevelFormValues>()

  return (
    <ModalForm<MemberIdentityLevelFormValues>
      name="member-identity-level-modal-form"
      title="新增身份档位"
      trigger={
        <Button type="primary">
          <PlusOutlined />
          新增档位
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
          upgrade: values.upgradeType
            ? {
                upgradeType: values.upgradeType,
                upgradeConsumeAmount:
                  values.upgradeType === 1 ? values.upgradeConsumeAmount : undefined,
                upgradeReferralCount:
                  values.upgradeType === 2 ? values.upgradeReferralCount : undefined,
                upgradeReferralRank:
                  values.upgradeType === 2 ? values.upgradeReferralRank : undefined,
                upgradeRewardPoint: values.upgradeRewardPoint,
              }
            : undefined,
        })
        return true
      }}
    >
      <MemberIdentityLevelFormFields levelOptions={levelOptions} />
    </ModalForm>
  )
}
