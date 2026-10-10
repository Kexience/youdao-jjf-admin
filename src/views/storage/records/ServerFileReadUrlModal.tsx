import { ModalForm, ProFormDigit } from '@ant-design/pro-components'
import { useMutation } from '@tanstack/react-query'
import { App, Button, Form, Skeleton, Typography } from 'antd'
import { useState } from 'react'

import { fetchServerFileReadUrl } from '../../../api/storageServerFiles'
import { ApiError } from '../../../lib/request'

/**
 * 读地址弹窗：每行独立实例，trigger 为行内「读地址」。
 * 提交查询后保持打开展示结果（可复制），关闭时清空。
 */
export function ServerFileReadUrlModal({ recordId }: { recordId: number }) {
  const { message } = App.useApp()
  const [form] = Form.useForm<{ expireSeconds?: number }>()
  const [url, setUrl] = useState<string | null>(null)

  const readUrlMutation = useMutation({
    mutationFn: (expireSeconds?: number) => fetchServerFileReadUrl(recordId, expireSeconds),
    onSuccess: (data) => {
      setUrl(data)
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '查询失败，请重试')
    },
  })

  return (
    <ModalForm<{ expireSeconds?: number }>
      name={`server-file-read-url-form-${recordId}`}
      title={`读地址（记录 ${recordId}）`}
      trigger={
        <Button type="link" size="small">
          读地址
        </Button>
      }
      form={form}
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      onOpenChange={(open) => {
        if (!open) {
          setUrl(null)
          form.resetFields()
        }
      }}
      layout="vertical"
      submitter={{
        searchConfig: { submitText: '查询' },
        resetButtonProps: false,
        submitButtonProps: { loading: readUrlMutation.isPending },
      }}
      onFinish={async (values) => {
        await readUrlMutation.mutateAsync(values.expireSeconds)
        // 保持打开展示结果，由用户手动关闭
        return false
      }}
    >
      <ProFormDigit
        name="expireSeconds"
        label="有效期（秒）"
        tooltip="60~86400，空=默认 3600"
        placeholder="默认 3600"
        min={60}
        max={86400}
      />
      {readUrlMutation.isPending && <Skeleton.Input active block />}
      {url && (
        <Typography.Paragraph copyable style={{ marginBottom: 0 }}>
          {url}
        </Typography.Paragraph>
      )}
    </ModalForm>
  )
}
