import { ProFormDependency, ProFormRadio, ProFormTextArea, ModalForm } from '@ant-design/pro-components'
import { Button, Descriptions, Form, Space, Typography } from 'antd'

import { renderDistrictAgentStatus } from './columns'

/** 审核表单值：approved=true 过审 / false 驳回 */
interface DistrictAgentAuditFormValues {
  approved: boolean
  reason?: string
}

interface DistrictAgentAuditModalProps {
  agent: DistrictAgent
  saving: boolean
  onSubmit: (params: DistrictAgentAuditParams) => Promise<unknown>
}

/** 区代附件只读展示（审核时确认材料） */
function AttachmentsPreview({ attachments }: { attachments?: DistrictAgentAttachment[] }) {
  if (!attachments?.length) return <Typography.Text type="secondary">未上传附件</Typography.Text>
  return (
    <Space direction="vertical" size={2}>
      {attachments.map((attachment) => (
        <a
          key={attachment.id}
          href={attachment.fileUrl || undefined}
          target="_blank"
          rel="noreferrer"
        >
          {attachment.fileType || '附件'} · {attachment.fileUrl}
        </a>
      ))}
    </Space>
  )
}

/**
 * 审核区代申请弹窗：每行独立实例，trigger 为行内「审核」。
 * 过审后区代立即上任；驳回必须填写原因（≤255）。
 * 提交走 POST /admin/agent/district-agents/{agentId}/audit。
 */
export function DistrictAgentAuditModal({
  agent,
  saving,
  onSubmit,
}: DistrictAgentAuditModalProps) {
  const [form] = Form.useForm<DistrictAgentAuditFormValues>()

  return (
    <ModalForm<DistrictAgentAuditFormValues>
      name={`district-agent-audit-form-${agent.id}`}
      title="审核区代申请"
      trigger={
        <Button type="link" size="small">
          审核
        </Button>
      }
      form={form}
      width={640}
      layout="vertical"
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      initialValues={{ approved: true }}
      onOpenChange={(open) => {
        if (open) form.setFieldsValue({ approved: true, reason: undefined })
      }}
      submitTimeout={2000}
      submitter={{
        searchConfig: { submitText: '提交审核', resetText: '取消' },
        submitButtonProps: { loading: saving },
      }}
      onFinish={async (values) => {
        await onSubmit({
          approved: values.approved,
          reason: values.approved ? undefined : values.reason?.trim(),
        })
        return true
      }}
    >
      <Descriptions
        size="small"
        column={2}
        style={{ marginBottom: 16 }}
        items={[
          {
            key: 'member',
            label: '会员',
            children: agent.member
              ? `${agent.member.nickname || agent.member.username || agent.member.mobile || agent.member.id}${
                  agent.member.mobile ? `（${agent.member.mobile}）` : ''
                }`
              : (agent.memberId ?? '-'),
          },
          {
            key: 'region',
            label: '所属区域',
            children: agent.region?.name
              ? `${agent.region.name}${agent.region.code ? `（${agent.region.code}）` : ''}`
              : (agent.regionId ?? '-'),
          },
          {
            key: 'status',
            label: '当前状态',
            children: renderDistrictAgentStatus(agent.status),
          },
          {
            key: 'createdAt',
            label: '提交时间',
            children: agent.createdAt || '-',
          },
          {
            key: 'remark',
            label: '备注',
            span: 2,
            children: agent.remark || '-',
          },
          {
            key: 'attachments',
            label: '附件',
            span: 2,
            children: <AttachmentsPreview attachments={agent.attachments} />,
          },
        ]}
      />

      <ProFormRadio.Group
        name="approved"
        label="审核结论"
        radioType="button"
        options={[
          { label: '通过', value: true },
          { label: '驳回', value: false },
        ]}
        rules={[{ required: true, message: '请选择审核结论' }]}
      />
      <ProFormDependency name={['approved']}>
        {({ approved }) => (
          <ProFormTextArea
            name="reason"
            label="驳回原因"
            placeholder={approved === false ? '驳回时必须填写原因' : '可选，仅驳回时生效'}
            fieldProps={{ maxLength: 255, showCount: true, rows: 3 }}
            rules={
              approved === false
                ? [
                    { required: true, message: '驳回时必须填写原因' },
                    { max: 255, message: '驳回原因不能超过 255 个字符' },
                  ]
                : [{ max: 255, message: '驳回原因不能超过 255 个字符' }]
            }
          />
        )}
      </ProFormDependency>
    </ModalForm>
  )
}
