import type { ProColumns } from '@ant-design/pro-components'
import { Tag } from 'antd'

/** 身份档位状态枚举（展示与检索共用，见文档 MemberIdentityLevelVo.status：1正常 0停用） */
export const MEMBER_IDENTITY_LEVEL_STATUS_ENUM = {
  1: { text: '正常', status: 'Success' },
  0: { text: '停用', status: 'Error' },
} as const

/** 消费折扣展示：100=不打折，其余按原值展示（如 90 表示九折，口径以后端为准） */
function formatDiscount(discount?: number): string {
  if (discount === undefined || discount === null) return '-'
  return discount >= 100 ? '不打折' : String(discount)
}

/**
 * 自动升级方式展示（见文档 Vo.upgradeType：空/0=仅后台手动，1=消费达标，2=直推达标），
 * 附带达标条件与积分奖励摘要。
 */
export function formatUpgradeType(record: MemberIdentityLevel): string {
  const parts: string[] = []
  switch (record.upgradeType) {
    case 1:
      parts.push(
        record.upgradeConsumeAmount !== undefined && record.upgradeConsumeAmount !== null
          ? `消费达标：累计消费 ≥ ${record.upgradeConsumeAmount} 元`
          : '消费达标',
      )
      break
    case 2:
      parts.push(
        record.upgradeReferralCount !== undefined && record.upgradeReferralCount !== null
          ? `直推达标：${record.upgradeReferralCount} 人`
          : '直推达标',
      )
      if (record.upgradeReferralRank) parts.push(`锚点档位 ${record.upgradeReferralRank}`)
      break
    default:
      return record.upgradeRewardPoint != null ? '仅后台手动 + 升级奖励' : '仅后台手动'
  }
  if (record.upgradeRewardPoint != null) {
    parts.push(`升级奖励 ${record.upgradeRewardPoint} 积分`)
  }
  return parts.join('；')
}

/** 会员身份档位列定义（展示用，与 MemberIdentityLevelVo 字段对齐） */
export const MEMBER_IDENTITY_LEVEL_COLUMNS: ProColumns<MemberIdentityLevel>[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
    search: false,
    hidden: true,
  },
  {
    title: '档位名称',
    dataIndex: 'levelName',
    ellipsis: true,
    render: (_, record) => record.levelName || '-',
  },
  {
    title: '档位序位',
    dataIndex: 'sort',
    width: 100,
    search: false,
    tooltip: '升序即档位高低',
    render: (_, record) => record.sort ?? '-',
  },
  {
    title: '成长值门槛',
    dataIndex: 'growthRequired',
    width: 120,
    search: false,
    render: (_, record) => record.growthRequired ?? '-',
  },
  {
    title: '消费折扣',
    dataIndex: 'consumeDiscount',
    width: 110,
    search: false,
    tooltip: '100=不打折',
    render: (_, record) => formatDiscount(record.consumeDiscount),
  },
  {
    title: '默认档',
    dataIndex: 'isDefault',
    width: 90,
    search: false,
    render: (_, record) =>
      record.isDefault ? <Tag color="gold">默认</Tag> : '-',
  },
  {
    title: '自动升级',
    dataIndex: 'upgradeType',
    width: 220,
    search: false,
    tooltip: '空=仅后台手动；1=消费达标、2=直推达标时需配置达标条件；积分奖励可叠加',
    render: (_, record) => formatUpgradeType(record),
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    valueType: 'select',
    valueEnum: MEMBER_IDENTITY_LEVEL_STATUS_ENUM,
  },
  {
    title: '会员数',
    dataIndex: 'memberCount',
    width: 100,
    search: false,
    render: (_, record) => record.memberCount ?? '-',
  },
  {
    title: '备注',
    dataIndex: 'remark',
    ellipsis: true,
    search: false,
    render: (_, record) => record.remark || '-',
  },
]
