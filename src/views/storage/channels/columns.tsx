import type { ProColumns } from '@ant-design/pro-components'
import { Tag } from 'antd'

/** 存储通道列表列定义（展示用，与 StorageChannelVo 字段对齐） */
export const STORAGE_CHANNEL_COLUMNS: ProColumns<StorageChannel>[] = [
  {
    title: '厂商',
    dataIndex: 'vendor',
    ellipsis: true,
  },
  {
    title: 'endpoint',
    dataIndex: 'endpoint',
    ellipsis: true,
    render: (_, record) => record.endpoint || '-',
  },
  {
    title: 'bucket',
    dataIndex: 'bucket',
    ellipsis: true,
    render: (_, record) => record.bucket || '-',
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
