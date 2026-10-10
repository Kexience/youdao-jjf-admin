import { CloudUploadOutlined } from '@ant-design/icons'
import { ModalForm, ProFormSelect, ProFormUploadButton } from '@ant-design/pro-components'
import { Button, Form } from 'antd'

import { useGetStorageZones } from '../../../api/storageZones'

interface ServerFileUploadModalProps {
  saving: boolean
  onSubmit: (params: { zone?: string; file: File }) => Promise<unknown>
}

/**
 * 服务端直传弹窗：按钮即 trigger，提交成功自动关闭。
 * 上传走 multipart/form-data，zone 为空不传（见 POST 文档）。
 */
export function ServerFileUploadModal({ saving, onSubmit }: ServerFileUploadModalProps) {
  const [form] = Form.useForm<{ zone?: string; file: { originFileObj?: File }[] }>()

  // zone 选项来自 Zone 列表，默认空（空=不传 zone 参数）
  const zonesQuery = useGetStorageZones()
  const zoneOptions = (zonesQuery.data ?? []).map((z) => ({ value: z.prefix, label: z.prefix }))

  return (
    <ModalForm<{ zone?: string; file: { originFileObj?: File }[] }>
      name="server-file-upload-form"
      title="服务端直传"
      trigger={
        <Button type="primary">
          <CloudUploadOutlined />
          服务端直传
        </Button>
      }
      form={form}
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      submitTimeout={2000}
      layout="vertical"
      submitter={{
        searchConfig: { submitText: '上传', resetText: '取消' },
        submitButtonProps: { loading: saving },
      }}
      onFinish={async (values) => {
        const file = values.file?.[0]?.originFileObj
        if (!file) return false
        await onSubmit({ zone: values.zone?.trim() || undefined, file })
        return true
      }}
    >
      <ProFormSelect
        name="zone"
        label="目标 zone"
        tooltip="目标 zone 前缀"
        placeholder="请选择 zone"
        rules={[{ required: true, message: '请选择 zone' }]}
        options={zoneOptions}
        fieldProps={{ loading: zonesQuery.isLoading }}
      />
      <ProFormUploadButton
        name="file"
        label="文件"
        placeholder="点击选择文件"
        rules={[{ required: true, message: '请选择要上传的文件' }]}
        fieldProps={{ maxCount: 1, beforeUpload: () => false }}
      />
    </ModalForm>
  )
}
