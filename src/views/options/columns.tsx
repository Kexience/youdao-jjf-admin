import type { ProColumns } from '@ant-design/pro-components'
import { Tag, Typography } from 'antd'

/** 设置项列表列定义（展示用，与 SysOptionVo 字段对齐） */
export const SYS_OPTION_COLUMNS: ProColumns<SysOption>[] = [
  {
    title: '归属域',
    dataIndex: 'scope',
    width: 160,
    ellipsis: true,
    copyable: true,
  },
  {
    title: '设置键',
    dataIndex: 'optionKey',
    width: 220,
    ellipsis: true,
    copyable: true,
  },
  {
    title: '取值类型',
    dataIndex: 'valueType',
    width: 110,
    search: false,
    render: (_, record) =>
      record.valueType ? <Tag color="blue">{record.valueType}</Tag> : '-',
  },
  {
    title: '当前值',
    dataIndex: 'value',
    ellipsis: true,
    search: false,
    render: (_, record) =>
      record.value ? (
        <Typography.Text code ellipsis={{ tooltip: record.value }}>
          {record.value}
        </Typography.Text>
      ) : (
        <Typography.Text type="secondary">未配置</Typography.Text>
      ),
  },
  {
    title: '版本',
    dataIndex: 'version',
    width: 80,
    search: false,
    render: (_, record) => record.version ?? '-',
  },
  {
    title: '最后更新人',
    dataIndex: 'operatorId',
    width: 110,
    search: false,
    render: (_, record) => record.operatorId ?? '-',
  },
  {
    title: '最后更新时间',
    dataIndex: 'updatedAt',
    width: 180,
    valueType: 'dateTime',
    search: false,
    render: (_, record) => record.updatedAt || '-',
  },
]
