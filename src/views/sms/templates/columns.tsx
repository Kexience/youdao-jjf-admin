import type { ProColumns } from '@ant-design/pro-components'
import { Tag } from 'antd'

/** 模板列表列定义（展示用，与 SmsTemplateVo 字段对齐） */
export const SMS_TEMPLATE_COLUMNS: ProColumns<SmsTemplate>[] = [
  {
    title: '场景',
    dataIndex: 'scene',
    ellipsis: true,
  },
  {
    title: '厂商',
    dataIndex: 'vendor',
    ellipsis: true,
  },
  {
    title: '厂商模板 code',
    dataIndex: 'templateCode',
    ellipsis: true,
  },
  {
    title: '启用状态',
    dataIndex: 'enabled',
    width: 100,
    render: (_, record) =>
      record.enabled ? <Tag color="success">启用</Tag> : <Tag>停用</Tag>,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    ellipsis: true,
    render: (_, record) => record.remark || '-',
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 180,
    valueType: 'dateTime',
  },
]
