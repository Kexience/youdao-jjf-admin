import { Button, Col, Descriptions, Modal, Row } from 'antd'
import { useState } from 'react'
import type { CSSProperties } from 'react'

import { renderRegionChangeStatus } from './columns'

interface ChangeDetailModalProps {
  change: RegionSyncChange
}

/** 尝试把快照 JSON 格式化，失败时原样返回 */
function prettify(json?: string): string {
  if (!json) return '（空）'
  try {
    return JSON.stringify(JSON.parse(json), null, 2)
  } catch {
    return json
  }
}

/** 快照展示块样式：等宽、限高滚动 */
const PRE_STYLE: CSSProperties = {
  margin: 0,
  padding: 12,
  maxHeight: 320,
  overflow: 'auto',
  background: 'rgba(0, 0, 0, 0.04)',
  borderRadius: 6,
  fontSize: 12,
  lineHeight: 1.6,
}

/**
 * 变动详情弹窗：展示清单项元信息与变动前 / 变动后 JSON 快照。
 * beforeJson / afterJson 由后端以字符串返回，这里尽量格式化后展示。
 */
export function ChangeDetailModal({ change }: ChangeDetailModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button type="link" size="small" onClick={() => setOpen(true)}>
        详情
      </Button>
      <Modal
        title={`变动详情${change.code ? `（${change.code}）` : ''}`}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={760}
        destroyOnHidden
      >
        <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
          <Descriptions.Item label="清单 id">{change.id}</Descriptions.Item>
          <Descriptions.Item label="任务 id">{change.jobId ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="国标码">{change.code || '-'}</Descriptions.Item>
          <Descriptions.Item label="层级">{change.level ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="变动类型">{change.changeType || '-'}</Descriptions.Item>
          <Descriptions.Item label="审核状态">
            {renderRegionChangeStatus(change.status)}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">{change.createdAt || '-'}</Descriptions.Item>
          <Descriptions.Item label="审核时间">{change.reviewedAt || '-'}</Descriptions.Item>
        </Descriptions>
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>变动前</div>
            <pre style={PRE_STYLE}>{prettify(change.beforeJson)}</pre>
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>变动后</div>
            <pre style={PRE_STYLE}>{prettify(change.afterJson)}</pre>
          </Col>
        </Row>
      </Modal>
    </>
  )
}
