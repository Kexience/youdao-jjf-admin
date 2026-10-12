import { DownloadOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-components'
import { App, Button, Tabs } from 'antd'
import { useState } from 'react'

import { downloadLatestRegionExport } from '../../api/regions'
import { ApiError } from '../../lib/request'
import { RegionSyncChanges } from './RegionSyncChanges'
import { RegionSyncJobs } from './RegionSyncJobs'

/**
 * 行政区划管理页（/region/sync）：同步任务 + 变动清单放在同一页。
 * Tab 1 同步任务：GET /admin/region/sync-jobs、POST 触发、GET /{id} 详情；
 * Tab 2 变动清单：GET /admin/region/sync-changes、PATCH /{id} 审批；
 * 页头导出：GET /admin/region/exports/latest（省市区树 JSON 文件流）。
 */
export function Regions() {
  const { message } = App.useApp()
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await downloadLatestRegionExport()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `region-tree-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      message.error(error instanceof ApiError ? error.message : '导出失败，请重试')
    } finally {
      setExporting(false)
    }
  }

  return (
    <PageContainer
      header={{
        title: '行政区划管理',
        subTitle: '同步最新国标省市区数据，审批市辖区变动，导出省市区树。',
        extra: [
          <Button
            key="export"
            icon={<DownloadOutlined />}
            loading={exporting}
            onClick={handleExport}
          >
            导出省市区树
          </Button>,
        ],
      }}
    >
      <Tabs
        destroyOnHidden
        items={[
          { key: 'jobs', label: '同步任务', children: <RegionSyncJobs /> },
          { key: 'changes', label: '变动清单', children: <RegionSyncChanges /> },
        ]}
      />
    </PageContainer>
  )
}
