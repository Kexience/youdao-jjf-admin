import type { ProColumns } from '@ant-design/pro-components'

/** 行业分类树列定义（展示用，与 CategoryNodeVo 字段对齐） */
export const SHOP_CATEGORY_COLUMNS: ProColumns<ShopCategoryNode>[] = [
  {
    title: '分类名称',
    dataIndex: 'categoryName',
    ellipsis: true,
    render: (_, record) => record.categoryName || '-',
  },
  {
    title: '图标',
    dataIndex: 'icon',
    width: 200,
    ellipsis: true,
    // 后端为「图标 URL/标识」字符串，可空
    render: (_, record) => record.icon || '-',
  },
  {
    title: '排序',
    dataIndex: 'sort',
    width: 100,
    // 后端可空默认 0，展示时把 undefined 归为 0
    render: (_, record) => record.sort ?? 0,
  },
]
