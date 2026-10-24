import { ProFormDependency, ProFormRadio, ProFormTextArea, ModalForm } from '@ant-design/pro-components'
import { Alert, Button, Col, Descriptions, Form, Row, Spin, Statistic } from 'antd'
import { useState } from 'react'

import { useGetStoreDepositBalance } from '../../api/shopAudits'
import { ApplyImages } from './ApplyImages'
import {
  renderAmount,
  renderShopApplyStatus,
  renderStoreType,
  storeApplyImages,
} from './columns'

/** 终审表单值：approved=true 通过开通 / false 驳回终态 */
interface StoreApplyAuditFormValues {
  approved: boolean
  reason?: string
}

interface StoreApplyAuditModalProps {
  application: StoreApplyVo
  saving: boolean
  onSubmit: (params: ShopAuditParams) => Promise<unknown>
}

/**
 * 终审门店申请单弹窗：每行独立实例，trigger 为行内「终审」。
 * - 通过 = 建门店（approved=true）；后端校验保证金缴清，通过后同事务建 store 并回填 storeId；
 * - 驳回 = 终态 rejected_admin（approved=false，reason 必填）；
 * - rejected_agent（区代驳回待复核）单可一键推翻：直接选「通过」提交；
 * - 打开时按 applyId 查保证金余额（GET /admin/shop/deposits/apply/{applyId}/balance），
 *   未缴清时给出警示（后端仍是最终权威校验，提示仅供参考）。
 * 提交走 POST /admin/shop/audits/store-applications/{applyId}/audit。
 */
export function StoreApplyAuditModal({
  application,
  saving,
  onSubmit,
}: StoreApplyAuditModalProps) {
  const [form] = Form.useForm<StoreApplyAuditFormValues>()
  const overturnable = application.status === 'rejected_agent'

  // 仅在弹窗打开时查余额，避免列表每行都发请求
  const [open, setOpen] = useState(false)
  const balanceQuery = useGetStoreDepositBalance(application.id, { enabled: open })

  const depositAmount = application.depositAmount
  const balance = balanceQuery.data?.balance
  // 应缴金额未知（0/空）时不判定欠缴，只展示余额
  const needDeposit = typeof depositAmount === 'number' && depositAmount > 0
  const depositSettled =
    !needDeposit || (typeof balance === 'number' && balance >= depositAmount)

  return (
    <ModalForm<StoreApplyAuditFormValues>
      name={`store-apply-audit-form-${application.id}`}
      title={`终审门店申请 #${application.id}`}
      trigger={
        <Button type="link" size="small">
          终审
        </Button>
      }
      form={form}
      width={720}
      layout="vertical"
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      initialValues={{ approved: true }}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) form.setFieldsValue({ approved: true, reason: undefined })
      }}
      submitTimeout={2000}
      submitter={{
        searchConfig: { submitText: '提交终审', resetText: '取消' },
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
      {overturnable ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="区代已驳回该申请，终审可复核：选择「通过」即推翻区代驳回并开通门店。"
        />
      ) : null}
      {needDeposit && !depositSettled ? (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message="保证金未缴清，通过将被后端拒绝。请先在保证金管理登记缴清后再终审通过。"
        />
      ) : null}

      {needDeposit ? (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Statistic
              title="应缴保证金"
              value={depositAmount as number}
              precision={2}
              prefix="¥"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="当前余额"
              value={balance ?? 0}
              precision={2}
              prefix="¥"
              loading={balanceQuery.isLoading}
              valueStyle={!depositSettled ? { color: 'var(--ant-color-error)' } : undefined}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="缴纳累计"
              value={balanceQuery.data?.paid ?? 0}
              precision={2}
              prefix="¥"
              loading={balanceQuery.isLoading}
            />
          </Col>
        </Row>
      ) : null}
      {balanceQuery.isLoading ? (
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <Spin size="small" />
        </div>
      ) : null}

      <Descriptions
        size="small"
        column={2}
        style={{ marginBottom: 16 }}
        items={[
          {
            key: 'status',
            label: '当前状态',
            children: renderShopApplyStatus(application.status),
          },
          {
            key: 'createdAt',
            label: '提交时间',
            children: application.createdAt || '-',
          },
          {
            key: 'storeName',
            label: '门店名称',
            children: application.storeName || '-',
          },
          {
            key: 'storeType',
            label: '门店类型',
            children: renderStoreType(application.storeType),
          },
          {
            key: 'shop',
            label: '所属店铺',
            children: application.shopId ? `店铺 ${application.shopId}` : '-',
          },
          {
            key: 'applicant',
            label: '申请人',
            children: application.applicantId
              ? `会员 ${application.applicantId}`
              : '-',
          },
          {
            key: 'contactPhone',
            label: '联系电话',
            children: application.contactPhone || '-',
          },
          {
            key: 'category',
            label: '行业分类',
            children: application.categoryName || '-',
          },
          {
            key: 'address',
            label: '门店地址',
            span: 2,
            children:
              [application.regionName, application.addressDetail]
                .filter(Boolean)
                .join(' ') || '-',
          },
          {
            key: 'depositAmount',
            label: '应缴保证金',
            children: renderAmount(application.depositAmount),
          },
          {
            key: 'agent',
            label: '初审区代',
            children: application.agentId ? `区代行 ${application.agentId}` : '-',
          },
          {
            key: 'rejectReason',
            label: '区代驳回原因',
            span: 2,
            children: application.rejectReason || '-',
          },
          {
            key: 'content',
            label: '门店介绍',
            span: 2,
            children: application.content || '-',
          },
          {
            key: 'materials',
            label: '申请材料',
            span: 2,
            children: <ApplyImages images={storeApplyImages(application)} />,
          },
        ]}
      />

      <ProFormRadio.Group
        name="approved"
        label="终审结论"
        radioType="button"
        options={[
          { label: overturnable ? '通过（推翻区代驳回）' : '通过（开通门店）', value: true },
          { label: '驳回（终态）', value: false },
        ]}
        rules={[{ required: true, message: '请选择终审结论' }]}
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
