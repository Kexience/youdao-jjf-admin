import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { App } from 'antd'
import { useRef } from 'react'

import {
  fetchDistrictAgentPendings,
  useAuditDistrictAgent,
  useUpdateDistrictAgentAttachments,
} from '../../api/districtAgents'
import { ApiError } from '../../lib/request'
import { DISTRICT_AGENT_PENDING_COLUMNS } from './columns'
import { DistrictAgentAttachmentsModal } from './DistrictAgentAttachmentsModal'
import { DistrictAgentAuditModal } from './DistrictAgentAuditModal'

/**
 * 待审区代页（/agent/district-agents/pendings）：
 * - 列表：GET /admin/agent/district-agents/pendings（page/pageSize 分页）
 * - 审核：POST /admin/agent/district-agents/{agentId}/audit（过审/驳回）
 * - 附件：PUT /admin/agent/district-agents/{agentId}/attachments（仅待审，全量覆盖）
 *
 * 列表只有待审数据，检索暂不提供（区域过滤参数 regionId 由接口按区 id 支持，
 * 当前无按区划码反查区 id 的接口，故页面不做区域下拉）。
 */
export function DistrictAgentPendings() {
  const { message } = App.useApp()
  const actionRef = useRef<ActionType>(null)

  const auditMutation = useAuditDistrictAgent({
    onSuccess: (_data, variables) => {
      message.success(
        variables.params.approved ? '已通过该区代申请' : '已驳回该区代申请',
      )
      actionRef.current?.reload()
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '审核失败，请重试')
    },
  })

  const attachmentsMutation = useUpdateDistrictAgentAttachments({
    onSuccess: () => {
      message.success('附件已更新')
      actionRef.current?.reload()
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '附件保存失败，请重试')
    },
  })

  const columns: ProColumns<DistrictAgent>[] = [
    ...DISTRICT_AGENT_PENDING_COLUMNS,
    {
      title: '操作',
      key: 'action',
      valueType: 'option',
      width: 140,
      fixed: 'right',
      render: (_, record) => [
        <DistrictAgentAuditModal
          key="audit"
          agent={record}
          saving={auditMutation.isPending}
          onSubmit={(params) =>
            auditMutation.mutateAsync({ agentId: record.id, params })
          }
        />,
        <DistrictAgentAttachmentsModal
          key="attachments"
          agent={record}
          saving={attachmentsMutation.isPending}
          onSubmit={(params) =>
            attachmentsMutation.mutateAsync({ agentId: record.id, params })
          }
        />,
      ],
    },
  ]

  return (
    <PageContainer
      header={{
        title: '待审区代',
        subTitle:
          '审核通过后区代立即上任，驳回必须填写原因；附件仅在待审阶段可修改。',
      }}
    >
      <ProTable<DistrictAgent>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        headerTitle="待审列表"
        search={false}
        dateFormatter={false}
        scroll={{ x: 'max-content' }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        request={async (params) => {
          try {
            const data = await fetchDistrictAgentPendings({
              page: params.current ?? 1,
              pageSize: params.pageSize ?? 10,
            })
            return { data: data.records, total: data.total, success: true }
          } catch (error) {
            message.error(
              error instanceof ApiError ? error.message : '待审区代加载失败，请重试',
            )
            return { data: [], total: 0, success: false }
          }
        }}
      />
    </PageContainer>
  )
}
