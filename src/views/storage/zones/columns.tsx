import type { ProColumns } from '@ant-design/pro-components'
import { Tag } from 'antd'

import { readPolicyLabel, writePolicyLabel } from './policies'

/** Zone 列表列定义（展示用，与 StorageZoneVo 字段对齐） */
export const STORAGE_ZONE_COLUMNS: ProColumns<StorageZone>[] = [
  {
    title: '地址前缀',
    dataIndex: 'prefix',
    ellipsis: true,
  },
  {
    title: '写策略',
    dataIndex: 'writePolicy',
    render: (_, record) => writePolicyLabel(record.writePolicy),
  },
  {
    title: '读策略',
    dataIndex: 'readPolicy',
    render: (_, record) => readPolicyLabel(record.readPolicy),
  },
  {
    title: '单文件上限（字节）',
    dataIndex: 'maxSizeBytes',
    render: (_, record) => record.maxSizeBytes ?? '-',
  },
  {
    title: '启用状态',
    dataIndex: 'enabled',
    render: (_, record) =>
      record.enabled === undefined ? (
        '-'
      ) : record.enabled ? (
        <Tag color="success">启用</Tag>
      ) : (
        <Tag>停用</Tag>
      ),
  },
]
