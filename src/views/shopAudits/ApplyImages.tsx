import { Image, Space, Typography } from 'antd'

import type { ApplyImageItem } from './columns'

/**
 * 图片材料展示组件（店铺/门店申请单共用）。
 * 独立成文件：columns.tsx 只保留列定义与纯函数，
 * 避免 react-refresh/only-export-components 规则报错。
 */
export function ApplyImages({ images }: { images: ApplyImageItem[] }) {
  if (!images.length) return <Typography.Text type="secondary">未上传材料</Typography.Text>
  return (
    <Space size={8} wrap>
      {images.map((image) => (
        <div key={image.url} style={{ textAlign: 'center' }}>
          <Image
            src={image.url}
            width={64}
            height={64}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            alt={image.label}
          />
          <div style={{ fontSize: 12, marginTop: 4 }}>{image.label}</div>
        </div>
      ))}
    </Space>
  )
}
