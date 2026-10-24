import type { ProColumns } from '@ant-design/pro-components'
import { Tag } from 'antd'

/** 地图通道列表列定义（展示用，与 GeoChannelVo 字段对齐） */
export const GEO_CHANNEL_COLUMNS: ProColumns<GeoChannel>[] = [
  {
    title: '厂商',
    dataIndex: 'vendor',
    width: 100,
    ellipsis: true,
  },
  {
    title: '服务端 Key',
    dataIndex: 'serverKey',
    ellipsis: true,
    render: (_, record) => record.serverKey || '-',
  },
  {
    title: '服务端 Secret',
    dataIndex: 'serverSecret',
    ellipsis: true,
    render: (_, record) => record.serverSecret || '-',
  },
  {
    title: '前端公开 Key',
    dataIndex: 'clientKey',
    ellipsis: true,
    render: (_, record) => record.clientKey || '-',
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    width: 100,
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
    dataIndex: 'serverSecretStoredEncrypted',
    width: 120,
    render: (_, record) =>
      record.serverSecretStoredEncrypted === undefined
        ? '-'
        : record.serverSecretStoredEncrypted
          ? '密文'
          : '明文',
  },
]
