import type { ProColumns } from '@ant-design/pro-components'
import { Image } from 'antd'

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
    width: 100,
    // icon 上传后是绝对 URL；历史数据可能是对象 key 或纯标识，只有 http(s) 才按图片预览
    render: (_, record) =>
      record.icon && /^https?:\/\//.test(record.icon) ? (
        <Image
          src={record.icon}
          alt="分类图标"
          width={40}
          height={40}
          style={{ objectFit: 'contain', borderRadius: 4 }}
        />
      ) : (
        (record.icon || '-')
      ),
  },
  {
    title: '排序',
    dataIndex: 'sort',
    width: 100,
    // 后端可空默认 0，展示时把 undefined 归为 0
    render: (_, record) => record.sort ?? 0,
  },
]
