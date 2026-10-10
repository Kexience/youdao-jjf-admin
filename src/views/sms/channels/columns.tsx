import type { ProColumns } from '@ant-design/pro-components'
import { Tag } from 'antd'

/** 通道列表列定义（展示用，与 SmsChannelVo 字段对齐） */
export const SMS_CHANNEL_COLUMNS: ProColumns<SmsChannel>[] = [
  {
    title: '厂商',
    dataIndex: 'vendor',
    ellipsis: true,
  },
  {
    title: '短信签名',
    dataIndex: 'signName',
    ellipsis: true,
    render: (_, record) => record.signName || '-',
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    width: 100,
  },
  {
    title: '单价（元）',
    dataIndex: 'unitPrice',
    width: 120,
    render: (_, record) => record.unitPrice ?? '-',
  },
  {
    title: '启用状态',
    dataIndex: 'enabled',
    width: 100,
    render: (_, record) =>
      record.enabled ? <Tag color="success">启用</Tag> : <Tag>停用</Tag>,
  },
  {
    title: 'Secret 存储',
    dataIndex: 'secretStoredEncrypted',
    width: 120,
    render: (_, record) =>
      record.secretStoredEncrypted === undefined
        ? '-'
        : record.secretStoredEncrypted
          ? '密文'
          : '明文',
  },
]
