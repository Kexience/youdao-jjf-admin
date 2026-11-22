import {
  ModalForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components'
import { Button, Typography } from 'antd'

import { DEPOSIT_ACTION_OPTIONS } from './depositColumns'

/** 登记表单值（action 必填，金额正数，凭证 / 备注可空） */
interface DepositRegisterFormValues {
  action: StoreDepositAction
  amount: number
  voucherUrl?: string
  remark?: string
}

interface DepositRegisterModalProps {
  application: StoreApplyVo
  /** 当前余额，用于金额提示（后端仍为最终校验方） */
  balance?: number
  saving: boolean
  onSubmit: (params: StoreDepositRegisterParams) => Promise<unknown>
}

/**
 * 保证金登记弹窗：缴纳 / 退还 / 扣减三动作共用。
 * 对应 POST /admin/shop/deposits/apply/{applyId}/records。
 * 金额只做正数与精度校验，余额是否足够由后端校验。
 */
export function DepositRegisterModal({
  application,
  balance,
  saving,
  onSubmit,
}: DepositRegisterModalProps) {
  const balanceText =
    typeof balance === 'number' ? `¥${balance.toFixed(2)}` : '加载中'

  return (
    <ModalForm<DepositRegisterFormValues>
      name={`deposit-register-form-${application.id}`}
      title={`登记保证金 · ${application.storeName || `申请单 #${application.id}`}`}
      trigger={
        <Button type="primary">
          登记保证金
        </Button>
      }
      width={520}
      layout="vertical"
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      initialValues={{ action: 'pay' }}
      submitTimeout={2000}
      submitter={{
        searchConfig: { submitText: '提交登记', resetText: '取消' },
        submitButtonProps: { loading: saving },
      }}
      onFinish={async (values) => {
        await onSubmit({
          action: values.action,
          amount: values.amount,
          voucherUrl: values.voucherUrl?.trim() || undefined,
          remark: values.remark?.trim() || undefined,
        })
        return true
      }}
    >
      <ProFormSelect
        name="action"
        label="动作"
        rules={[{ required: true, message: '请选择保证金动作' }]}
        options={[...DEPOSIT_ACTION_OPTIONS]}
      />
      <ProFormDigit
        name="amount"
        label="动作金额（元）"
        placeholder="请输入金额，最小 0.01"
        min={0.01}
        fieldProps={{ precision: 2, style: { width: '100%' } }}
        rules={[
          { required: true, message: '请输入动作金额' },
          { type: 'number', min: 0.01, message: '金额必须不小于 0.01' },
        ]}
        extra={
          <Typography.Text type="secondary">
            {`当前余额 ${balanceText}；退还 / 扣减金额不应超过余额，最终以系统校验为准。`}
          </Typography.Text>
        }
      />
      <ProFormText
        name="voucherUrl"
        label="线下凭证图片 URL"
        placeholder="可选，填写凭证图片地址"
        fieldProps={{ allowClear: true, maxLength: 2048 }}
        rules={[{ max: 2048, message: '凭证地址不能超过 2048 个字符' }]}
      />
      <ProFormTextArea
        name="remark"
        label="备注"
        placeholder="可选，如转账单号、扣减原因"
        fieldProps={{ maxLength: 255, showCount: true, rows: 3 }}
        rules={[{ max: 255, message: '备注不能超过 255 个字符' }]}
      />
    </ModalForm>
  )
}
