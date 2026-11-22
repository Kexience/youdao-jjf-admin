import type { ProColumns } from '@ant-design/pro-components'
import { Tag } from 'antd'

/** 店铺标签列表列定义（展示用，与 LabelVo 字段对齐） */
export const SHOP_LABEL_COLUMNS: ProColumns<ShopLabel>[] = [
  {
    title: '标签名称',
    dataIndex: 'labelName',
    ellipsis: true,
  },
  {
    title: '排序',
    dataIndex: 'sort',
    width: 100,
    // 后端可空默认 0，展示时把 undefined 归为 0
    render: (_, record) => record.sort ?? 0,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: (_, record) =>
      record.status === 1 ? <Tag color="success">启用</Tag> : <Tag>停用</Tag>,
  },
]
