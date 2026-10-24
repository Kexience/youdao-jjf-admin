import { ProFormDependency, ProFormRadio, ProFormTextArea, ModalForm } from '@ant-design/pro-components'
import { Alert, Button, Descriptions, Form } from 'antd'

import { ApplyImages } from './ApplyImages'
import {
  renderShopApplyStatus,
  shopApplyImages,
} from './columns'

/** 终审表单值：approved=true 通过开通 / false 驳回终态 */
interface ShopApplyAuditFormValues {
  approved: boolean
  reason?: string
}

interface ShopApplyAuditModalProps {
  application: ShopApplyVo
  saving: boolean
  onSubmit: (params: ShopAuditParams) => Promise<unknown>
}

/**
 * 终审店铺申请单弹窗：每行独立实例，trigger 为行内「终审」。
 * - 通过 = 开通店铺（approved=true）；
 * - 驳回 = 终态 rejected_admin（approved=false，reason 必填）；
 * - rejected_agent（区代驳回待复核）单可一键推翻：直接选「通过」提交。
 * 提交走 POST /admin/shop/audits/shop-applications/{applyId}/audit。
 */
export function ShopApplyAuditModal({
  application,
  saving,
  onSubmit,
}: ShopApplyAuditModalProps) {
  const [form] = Form.useForm<ShopApplyAuditFormValues>()
  const overturnable = application.status === 'rejected_agent'

  return (
    <ModalForm<ShopApplyAuditFormValues>
      name={`shop-apply-audit-form-${application.id}`}
      title={`终审店铺申请 #${application.id}`}
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
      onOpenChange={(open) => {
        if (open) form.setFieldsValue({ approved: true, reason: undefined })
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
          message="区代已驳回该申请，终审可复核：选择「通过」即推翻区代驳回并开通店铺。"
        />
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
            key: 'owner',
            label: '申请人',
            children: application.ownerName
              ? `${application.ownerName}（会员 ${application.ownerMemberId ?? '-'}）`
              : (application.ownerMemberId ?? '-'),
          },
          {
            key: 'contactPhone',
            label: '联系电话',
            children: application.contactPhone || '-',
          },
          {
            key: 'shopName',
            label: '店铺名称',
            children: application.shopName || '-',
          },
          {
            key: 'category',
            label: '行业分类',
            children: application.categoryName || '-',
          },
          {
            key: 'address',
            label: '营业地址',
            span: 2,
            children:
              [application.regionName, application.addressDetail]
                .filter(Boolean)
                .join(' ') || '-',
          },
          {
            key: 'labels',
            label: '标签',
            children: application.labelNames || '-',
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
            label: '店铺介绍',
            span: 2,
            children: application.content || '-',
          },
          {
            key: 'materials',
            label: '申请材料',
            span: 2,
            children: <ApplyImages images={shopApplyImages(application)} />,
          },
        ]}
      />

      <ProFormRadio.Group
        name="approved"
        label="终审结论"
        radioType="button"
        options={[
          { label: overturnable ? '通过（推翻区代驳回）' : '通过（开通店铺）', value: true },
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
