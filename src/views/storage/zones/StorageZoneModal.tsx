import { PlusOutlined } from '@ant-design/icons'
import { ModalForm } from '@ant-design/pro-components'
import { Button, Form } from 'antd'

import { StorageZoneFormFields } from './StorageZoneFormFields'
import { splitList } from './list'

/** Zone 弹窗表单值：数组白名单用逗号分隔字符串表达，提交时拆分 */
export interface StorageZoneFormValues {
  prefix?: string
  writePolicy: string
  readPolicy: string
  maxSizeBytes: number
  allowContentTypes?: string
  allowExts?: string
  processStyles?: string
  uploadPolicyExpireSeconds?: number
  viewUrlExpireSeconds?: number
  enabled?: boolean
}

interface StorageZoneModalProps {
  saving: boolean
  onSubmit: (params: StorageZoneCreateParams) => Promise<unknown>
}

/**
 * 新增 zone 弹窗：按钮即 trigger，提交成功自动关闭。
 * 成功提示与失败提示由父组件的 mutation 回调负责。
 */
export function StorageZoneModal({ saving, onSubmit }: StorageZoneModalProps) {
  const [form] = Form.useForm<StorageZoneFormValues>()

  return (
    <ModalForm<StorageZoneFormValues>
      name="storage-zone-modal-form"
      title="新增 Zone"
      trigger={
        <Button type="primary">
          <PlusOutlined />
          新增 Zone
        </Button>
      }
      form={form}
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      submitTimeout={2000}
      layout="vertical"
      submitter={{
        searchConfig: { submitText: '保存', resetText: '取消' },
        submitButtonProps: { loading: saving },
      }}
      onFinish={async (values) => {
        await onSubmit({
          prefix: values.prefix?.trim() ?? '',
          writePolicy: values.writePolicy,
          readPolicy: values.readPolicy,
          maxSizeBytes: values.maxSizeBytes,
          allowContentTypes: splitList(values.allowContentTypes),
          allowExts: splitList(values.allowExts),
          processStyles: splitList(values.processStyles),
          uploadPolicyExpireSeconds: values.uploadPolicyExpireSeconds,
          viewUrlExpireSeconds: values.viewUrlExpireSeconds,
        })
        return true
      }}
    >
      <StorageZoneFormFields isEdit={false} />
    </ModalForm>
  )
}
