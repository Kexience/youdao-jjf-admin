import type { ProColumns } from '@ant-design/pro-components'
import { Tag } from 'antd'

/** 等级状态枚举（展示与检索共用，见文档 MemberLevelVo.status：1正常 0停用） */
export const MEMBER_LEVEL_STATUS_ENUM = {
  1: { text: '正常', status: 'Success' },
  0: { text: '停用', status: 'Error' },
} as const

/** 消费折扣展示：100=不打折，其余按原值展示（如 90 表示九折，口径以后端为准） */
function formatDiscount(discount?: number): string {
  if (discount === undefined || discount === null) return '-'
  return discount >= 100 ? '不打折' : String(discount)
}

/** 会员等级列定义（展示用，与 MemberLevelVo 字段对齐） */
export const MEMBER_LEVEL_COLUMNS: ProColumns<MemberLevel>[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
    search: false,
    hidden: true,
  },
  {
    title: '等级名称',
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
    title: '状态',
    dataIndex: 'status',
    width: 100,
    valueType: 'select',
    valueEnum: MEMBER_LEVEL_STATUS_ENUM,
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
