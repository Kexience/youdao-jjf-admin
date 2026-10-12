import type { ProColumns } from '@ant-design/pro-components'
import { Tag } from 'antd'

/** 黑名单维度枚举（展示与检索共用，取值见文档 SmsBlacklistVo.type） */
export const SMS_BLACKLIST_TYPE_ENUM = {
  MOBILE: { text: '手机号' },
  IP: { text: 'IP' },
  DEVICE: { text: '设备标识' },
} as const

/** 启用状态枚举（仅展示，无修改接口） */
export const SMS_BLACKLIST_ENABLED_ENUM = {
  true: { text: '生效中', status: 'Success' },
  false: { text: '已停用', status: 'Default' },
} as const

/** 维度值列渲染：维度打标 + 值（检索维度时列内展示枚举标签更直观） */
export const SMS_BLACKLIST_COLUMNS: ProColumns<SmsBlacklist>[] = [
  {
    title: '维度',
    dataIndex: 'type',
    width: 110,
    valueType: 'select',
    valueEnum: SMS_BLACKLIST_TYPE_ENUM,
    render: (_, record) => (
      <Tag color={record.type === 'MOBILE' ? 'blue' : record.type === 'IP' ? 'geekblue' : 'purple'}>
        {SMS_BLACKLIST_TYPE_ENUM[record.type as keyof typeof SMS_BLACKLIST_TYPE_ENUM]?.text ??
          record.type}
      </Tag>
    ),
  },
  {
    title: '维度值',
    dataIndex: 'value',
    ellipsis: true,
    copyable: true,
  },
  {
    title: '原因备注',
    dataIndex: 'reason',
    ellipsis: true,
    search: false,
    render: (_, record) => record.reason || '-',
  },
  {
    title: '状态',
    dataIndex: 'enabled',
    width: 100,
    search: false,
    valueEnum: SMS_BLACKLIST_ENABLED_ENUM,
  },
  {
    title: '加入时间',
    dataIndex: 'createdAt',
    width: 180,
    valueType: 'dateTime',
    search: false,
  },
]
