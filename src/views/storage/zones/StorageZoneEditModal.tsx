import { ModalForm } from '@ant-design/pro-components'
import { Button, Form } from 'antd'

import { StorageZoneFormFields } from './StorageZoneFormFields'
import type { StorageZoneFormValues } from './StorageZoneModal'
import { joinList, splitList } from './list'

interface StorageZoneEditModalProps {
  zone: StorageZone
  saving: boolean
  onSubmit: (params: StorageZoneUpdateParams) => Promise<unknown>
}

/** 行内初始值：数组 join 回逗号分隔文本，取行数据 */
function toInitialValues(zone: StorageZone): StorageZoneFormValues {
  return {
    writePolicy: zone.writePolicy ?? '',
    readPolicy: zone.readPolicy ?? '',
    maxSizeBytes: zone.maxSizeBytes ?? 0,
    allowContentTypes: joinList(zone.allowContentTypes),
    allowExts: joinList(zone.allowExts),
    processStyles: joinList(zone.processStyles),
    uploadPolicyExpireSeconds: zone.uploadPolicyExpireSeconds,
    viewUrlExpireSeconds: zone.viewUrlExpireSeconds,
    enabled: zone.enabled,
  }
}

/**
 * 编辑 zone 弹窗：每行独立实例，trigger 为行内「编辑」。
 * 打开时用最新行数据同步表单（列表刷新后实例复用，initialValues 只在挂载时生效一次）。
 */
export function StorageZoneEditModal({ zone, saving, onSubmit }: StorageZoneEditModalProps) {
  const [form] = Form.useForm<StorageZoneFormValues>()

  return (
    <ModalForm<StorageZoneFormValues>
      name={`storage-zone-edit-form-${zone.id}`}
      title="编辑 Zone"
      trigger={
        <Button type="link" size="small">
          编辑
        </Button>
      }
      form={form}
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      onOpenChange={(open) => {
        if (open) form.setFieldsValue(toInitialValues(zone))
      }}
      submitTimeout={2000}
      layout="vertical"
      initialValues={toInitialValues(zone)}
      submitter={{
        searchConfig: { submitText: '保存', resetText: '取消' },
        submitButtonProps: { loading: saving },
      }}
      onFinish={async (values) => {
        await onSubmit({
          writePolicy: values.writePolicy || undefined,
          readPolicy: values.readPolicy || undefined,
          maxSizeBytes: values.maxSizeBytes || undefined,
          allowContentTypes: splitList(values.allowContentTypes),
          allowExts: splitList(values.allowExts),
          processStyles: splitList(values.processStyles),
          uploadPolicyExpireSeconds: values.uploadPolicyExpireSeconds,
          viewUrlExpireSeconds: values.viewUrlExpireSeconds,
          enabled: values.enabled,
        })
        return true
      }}
    >
      <StorageZoneFormFields isEdit />
    </ModalForm>
  )
}
