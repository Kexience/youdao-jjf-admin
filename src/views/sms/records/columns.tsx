import type { ProColumns } from '@ant-design/pro-components'

/** 发送状态枚举（展示与检索共用） */
export const SMS_RECORD_STATUS_ENUM = {
  SUCCESS: { text: '成功', status: 'Success' },
  FAILED: { text: '失败', status: 'Error' },
} as const

/** 发送记录列表列定义（展示用，与 SmsSendRecordVo 字段对齐） */
export const SMS_RECORD_COLUMNS: ProColumns<SmsSendRecord>[] = [
  {
    title: '手机号',
    dataIndex: 'mobile',
    ellipsis: true,
  },
  {
    title: '场景',
    dataIndex: 'scene',
    ellipsis: true,
  },
  {
    title: '投递厂商',
    dataIndex: 'vendor',
    ellipsis: true,
    search: false,
  },
  {
    title: '厂商模板 code',
    dataIndex: 'templateCode',
    ellipsis: true,
    search: false,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    valueType: 'select',
    valueEnum: SMS_RECORD_STATUS_ENUM,
  },
  {
    title: '失败原因',
    dataIndex: 'errorMessage',
    ellipsis: true,
    search: false,
    render: (_, record) => record.errorMessage || record.rejectRule || '-',
  },
  {
    title: '估算成本',
    dataIndex: 'cost',
    width: 110,
    search: false,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 180,
    valueType: 'dateTime',
    search: false,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAtRange',
    valueType: 'dateRange',
    hideInTable: true,
  },
]
