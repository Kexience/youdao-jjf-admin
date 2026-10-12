import { Popconfirm } from 'antd'
import type { ReactNode } from 'react'
import { useState } from 'react'

/** 前端生成本地日期版本号：8 位 YYYYMMDD（文档 RegionSyncJobCreateDto.version 要求 \d{8}） */
function currentRegionVersion(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

interface TriggerSyncActionProps {
  /** 固定版本号（如「再次同步」沿用原任务版本）；不传则打开确认框时按当天日期生成 */
  version?: string
  saving: boolean
  onConfirm: (params: RegionSyncJobCreateParams) => Promise<unknown>
  /** 触发元素（按钮），作为 Popconfirm 的唯一子元素 */
  children: ReactNode
}

/**
 * 触发行政区划同步的确认包装：点击子元素弹出 Popconfirm，确认后 POST /admin/region/sync-jobs。
 * 工具条的「触发同步」不传 version（按当天日期生成）；行内「再次同步」传原任务版本号。
 */
export function TriggerSyncAction({ version, saving, onConfirm, children }: TriggerSyncActionProps) {
  const [generated, setGenerated] = useState(currentRegionVersion)
  const effectiveVersion = version ?? generated

  return (
    <Popconfirm
      title="确认触发行政区划同步吗？"
      description={`将以版本号 ${effectiveVersion} 拉取最新国标省市区数据`}
      onOpenChange={(open) => {
        // 仅动态生成场景下在打开时刷新，避免跨天仍用旧值
        if (open && version === undefined) setGenerated(currentRegionVersion())
      }}
      onConfirm={() => onConfirm({ version: effectiveVersion })}
      okButtonProps={{ loading: saving }}
      okText="开始同步"
      cancelText="取消"
    >
      {children}
    </Popconfirm>
  )
}
