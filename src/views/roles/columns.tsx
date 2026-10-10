import type { ProColumns } from '@ant-design/pro-components'
import { Tag } from 'antd'

/** 角色列表列定义（展示用，与 AdminRoleVo 字段对齐） */
export const ROLE_COLUMNS: ProColumns<AdminRole>[] = [
  {
    title: '角色名',
    dataIndex: 'roleName',
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'builtin',
    width: 120,
    render: (_, record) =>
      record.builtin ? <Tag color="gold">内置</Tag> : <Tag color="blue">自建</Tag>,
  },
  {
    title: '内置标识',
    dataIndex: 'keyword',
    ellipsis: true,
    render: (_, record) => record.keyword || '-',
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: (_, record) =>
      record.status === undefined ? (
        '-'
      ) : record.status === 1 ? (
        <Tag color="success">启用</Tag>
      ) : (
        <Tag>停用</Tag>
      ),
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 180,
    valueType: 'dateTime',
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    width: 180,
    valueType: 'dateTime',
  },
]
