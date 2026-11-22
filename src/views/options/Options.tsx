import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { Button } from 'antd'
import { useRef, useState } from 'react'

import { fetchSysOptions } from '../../api/options'
import { ApiError } from '../../lib/request'
import { SYS_OPTION_COLUMNS } from './columns'
import { OptionEditModal } from './OptionEditModal'

/**
 * 设置项页：GET 分页列表 /admin/options，行内编辑走
 * GET 单查 + PUT /admin/options/{scope}/{optionKey}。
 * 设置项由后端登记项驱动，因此没有新增/删除入口，只能修改已登记项的值。
 */
export function Options() {
  const actionRef = useRef<ActionType>(null)
  const [editing, setEditing] = useState<SysOption | null>(null)

  const columns: ProColumns<SysOption>[] = [
    ...SYS_OPTION_COLUMNS,
    {
      title: '操作',
      key: 'action',
      width: 90,
      valueType: 'option',
      render: (_, record) => [
        <Button key="edit" type="link" size="small" onClick={() => setEditing(record)}>
          编辑
        </Button>,
      ],
    },
  ]

  return (
    <PageContainer
      header={{
        title: '设置项',
        subTitle: '扁平全局设置，按归属域检索；设置项由后端登记，仅支持修改值。',
      }}
    >
      <ProTable<SysOption>
        rowKey={(record) => `${record.scope}/${record.optionKey}`}
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          try {
            const data = await fetchSysOptions({
              page: params.current ?? 1,
              size: params.pageSize ?? 10,
              scope: (params.scope as string | undefined)?.trim() || undefined,
            })
            return { data: data.records, total: data.total, success: true }
          } catch (error) {
            return {
              data: [],
              total: 0,
              success: false,
              errorMessage: error instanceof ApiError ? error.message : '加载失败，请重试',
            }
          }
        }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        dateFormatter={false}
        headerTitle="设置项列表"
        options={{ density: true }}
        locale={{ emptyText: '暂无设置项' }}
      />

      <OptionEditModal
        option={editing}
        onClose={() => setEditing(null)}
        onSaved={() => actionRef.current?.reload()}
      />
    </PageContainer>
  )
}
