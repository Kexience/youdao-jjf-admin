import {
  ProForm,
  ProFormDependency,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components'
import { Tabs } from 'antd'

import { MEMBER_IDENTITY_LEVEL_STATUS_ENUM } from './columns'

/** 状态下拉选项：复用列枚举的文案，值转数字 */
const STATUS_OPTIONS = Object.entries(MEMBER_IDENTITY_LEVEL_STATUS_ENUM).map(
  ([value, item]) => ({
    value: Number(value),
    label: item.text,
  }),
)

/** 自动升级方式选项（见文档：空=仅后台手动，1=消费达标，2=直推达标） */
const UPGRADE_TYPE_OPTIONS = [
  { value: 1, label: '消费达标' },
  { value: 2, label: '直推达标' },
]

/** 锚点档位下拉选项：仅启用且有 levelCode 的档位（方式2需要，须命中同表启用档位） */
export interface MemberIdentityLevelRankOption {
  value: string
  label: string
}

interface MemberIdentityLevelFormFieldsProps {
  /** 编辑态：档位代码只读、默认档不可改（更新 DTO 无该字段） */
  isEdit?: boolean
  /** 编辑态展示的稳定档位代码（仅 migration 写入） */
  levelCode?: string
  /** 方式2锚点档位候选（启用档位的 levelCode），由父组件传入 */
  levelOptions?: MemberIdentityLevelRankOption[]
}

/**
 * 身份档位表单公共字段（新建 / 编辑共用，长度与取值上限以文档为准）。
 * Tab 分两栏：基本信息 / 自动升级配置，两栏 forceRender 确保
 * 未切到「自动升级」时字段也已注册（校验与提交取值完整）。
 * 新建：名称/序位/成长值门槛/折扣/状态必填，默认档与升级配置可选；
 * 编辑：基础字段全部「空=保留原值」，档位代码只读展示，
 * 升级配置组编辑时「非空整体替换」（见 UpdateDto.upgrade）。
 */
export function MemberIdentityLevelFormFields({
  isEdit,
  levelCode,
  levelOptions,
}: MemberIdentityLevelFormFieldsProps) {
  return (
    <Tabs
      defaultActiveKey="base"
      items={[
        {
          key: 'base',
          label: '基本信息',
          forceRender: true,
          children: (
            <>
              {isEdit && levelCode && (
                <ProFormText
                  width="md"
                  name="levelCode"
                  label="档位代码"
                  tooltip="稳定档位代码，仅 migration 写入，管理界面不可改"
                  disabled
                />
              )}
              <ProForm.Group>
                <ProFormText
                  width="md"
                  name="levelName"
                  label="档位名称"
                  placeholder="如 黄金会员"
                  rules={[
                    { required: !isEdit, message: '请输入档位名称' },
                    { max: 50, message: '档位名称最多 50 个字符' },
                  ]}
                  fieldProps={{ maxLength: 50 }}
                />
                <ProFormDigit
                  width="xs"
                  name="sort"
                  label="档位序位"
                  tooltip="升序即档位高低"
                  placeholder="如 1"
                  min={0}
                  fieldProps={{ precision: 0 }}
                  rules={[{ required: !isEdit, message: '请输入档位序位' }]}
                />
              </ProForm.Group>
              <ProForm.Group>
                <ProFormDigit
                  width="md"
                  name="growthRequired"
                  label="成长值门槛"
                  placeholder="如 1000"
                  min={0}
                  rules={[{ required: !isEdit, message: '请输入成长值门槛' }]}
                />
                <ProFormDigit
                  width="md"
                  name="consumeDiscount"
                  label="消费折扣"
                  tooltip="100=不打折，填 90 表示九折"
                  placeholder="如 100"
                  min={0}
                  max={100}
                  rules={[{ required: !isEdit, message: '请输入消费折扣' }]}
                />
              </ProForm.Group>
              <ProForm.Group>
                <ProFormSelect
                  width="xs"
                  name="status"
                  label="状态"
                  placeholder="请选择状态"
                  options={STATUS_OPTIONS}
                  rules={[{ required: !isEdit, message: '请选择状态' }]}
                />
                {!isEdit && (
                  <ProFormSwitch
                    name="isDefault"
                    label="默认档"
                    tooltip="已有默认档时再选将被后端拒绝"
                    checkedChildren="是"
                    unCheckedChildren="否"
                  />
                )}
              </ProForm.Group>
              <ProFormTextArea
                name="remark"
                label="备注"
                placeholder="备注（可选）"
                rules={[{ max: 255, message: '备注最多 255 个字符' }]}
                fieldProps={{ maxLength: 255, rows: 2 }}
              />
            </>
          ),
        },
        {
          key: 'upgrade',
          label: '自动升级',
          forceRender: true,
          children: (
            <>
              <ProForm.Group>
                <ProFormSelect
                  width="md"
                  name="upgradeType"
                  label="升级方式"
                  tooltip="留空=仅后台手动调整；1=消费达标自动升；2=直推达标自动升"
                  placeholder="仅后台手动（默认）"
                  allowClear
                  options={UPGRADE_TYPE_OPTIONS}
                />
                <ProFormDigit
                  width="md"
                  name="upgradeRewardPoint"
                  label="升级积分奖励"
                  tooltip="自动升到该档时发放的积分奖励，留空=无奖励"
                  placeholder="如 100"
                  min={0}
                />
              </ProForm.Group>
              <ProFormDependency name={['upgradeType']}>
                {({ upgradeType }) =>
                  upgradeType === 1 ? (
                    <ProFormDigit
                      key="upgradeConsumeAmount"
                      width="md"
                      name="upgradeConsumeAmount"
                      label="累计消费门槛"
                      tooltip="升级至本档所需的历史累计消费金额（元），须大于 0"
                      placeholder="如 5000"
                      min={0.01}
                      max={9999999999.99}
                      rules={[{ required: true, message: '消费达标方式必须填写累计消费门槛' }]}
                    />
                  ) : upgradeType === 2 ? (
                    <ProForm.Group key="upgradeReferral">
                      <ProFormDigit
                        width="sm"
                        name="upgradeReferralCount"
                        label="直推达标人数"
                        tooltip="须达到的直推会员人头数（≥1）"
                        placeholder="如 1"
                        min={1}
                        fieldProps={{ precision: 0 }}
                        rules={[{ required: true, message: '直推达标方式必须填写直推人数' }]}
                      />
                      <ProFormSelect
                        width="md"
                        name="upgradeReferralRank"
                        label="锚点档位"
                        tooltip="直推会员须达到的档位代码，仅限启用档位"
                        placeholder="请选择锚点档位"
                        showSearch
                        options={levelOptions ?? []}
                        rules={[{ required: true, message: '直推达标方式必须选择锚点档位' }]}
                      />
                    </ProForm.Group>
                  ) : null
                }
              </ProFormDependency>
            </>
          ),
        },
      ]}
    />
  )
}
