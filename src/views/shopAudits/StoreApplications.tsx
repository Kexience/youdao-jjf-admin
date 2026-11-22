import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { App } from 'antd'
import { useRef } from 'react'

import { fetchStoreApplyAudits, useAuditStoreApply } from '../../api/shopAudits'
import { ApiError } from '../../lib/request'
import { STORE_APPLY_COLUMNS } from './columns'
import { StoreApplyAuditModal } from './StoreApplyAuditModal'

/**
 * 门店申请单终审页（/shop/audit/store-applications）：
 * - 列表：GET /admin/shop/audit/store-applications（page/pageSize 分页）
 *   statuses 不传时后端默认查全部非 approved 单（口径同店铺单）；
 * - 终审：POST /admin/shop/audit/store-applications/{applyId}/audit
 *   通过前须保证金缴清（后端校验），通过后同事务建 store 并回填 storeId；
 *   驳回=终态（必填原因）；rejected_agent 单通过即推翻区代驳回。
 */
export function StoreApplications() {
  const { message } = App.useApp()
  const actionRef = useRef<ActionType>(null)

  const auditMutation = useAuditStoreApply({
    onSuccess: (_data, variables) => {
      message.success(
        variables.params.approved ? '已通过，门店已开通' : '已驳回该申请（终态）',
      )
      actionRef.current?.reload()
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '终审失败，请重试')
    },
  })

  const columns: ProColumns<StoreApplyVo>[] = [
    ...STORE_APPLY_COLUMNS,
    {
      title: '操作',
      key: 'action',
      valueType: 'option',
      width: 80,
      fixed: 'right',
      render: (_, record) => [
        <StoreApplyAuditModal
          key="audit"
          application={record}
          saving={auditMutation.isPending}
          onSubmit={(params) =>
            auditMutation.mutateAsync({ applyId: record.id, params })
          }
        />,
      ],
    },
  ]

  return (
    <PageContainer
      header={{
        title: '门店申请终审',
        subTitle:
          '通过前须保证金缴清（通过时同事务建门店）；驳回为终态且必须填写原因；区代驳回单可复核推翻。',
      }}
    >
      <ProTable<StoreApplyVo>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        headerTitle="门店申请单"
        scroll={{ x: 'max-content' }}
        pagination={{ defaultPageSize: 20, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        dateFormatter={false}
        search={{ labelWidth: 'auto' }}
        request={async (params) => {
          try {
            // 状态多选已在列的 search.transform 里拼成逗号分隔串；未选时不传（后端默认查全部非 approved）
            const data = await fetchStoreApplyAudits({
              page: params.current ?? 1,
              pageSize: params.pageSize ?? 20,
              statuses: params.statuses as string | undefined,
            })
            return { data: data.records, total: data.total, success: true }
          } catch (error) {
            message.error(
              error instanceof ApiError ? error.message : '门店申请单加载失败，请重试',
            )
            return { data: [], total: 0, success: false }
          }
        }}
        locale={{ emptyText: '暂无待终审的门店申请单' }}
        options={{ density: true, reload: true }}
      />
    </PageContainer>
  )
}
