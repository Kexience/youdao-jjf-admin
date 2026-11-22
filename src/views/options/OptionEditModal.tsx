import { ModalForm, ProFormTextArea } from '@ant-design/pro-components'
import { Alert, App, Descriptions, Form, Skeleton } from 'antd'
import { useEffect } from 'react'

import { useGetSysOption, useSaveSysOption } from '../../api/options'
import { ApiError } from '../../lib/request'

/** 编辑弹窗表单值：value 为 JSON 文本，提交前解析成标量 */
interface OptionEditFormValues {
  value: string
}

interface OptionEditModalProps {
  /** 待编辑项；null=弹窗关闭 */
  option: SysOption | null
  onClose: () => void
  /** 保存成功后的回调（父组件用于刷新列表） */
  onSaved: () => void
}

/**
 * 解析设置值：只接受 JSON 标量（字符串需带双引号，如 "zh-CN"）。
 * 与后端 SysOptionSaveDto.value 的类型约定一致。
 */
function parseOptionValue(text: string): SysOptionValue {
  const parsed: unknown = JSON.parse(text)
  if (parsed !== null && typeof parsed === 'object') {
    throw new Error('设置值仅支持 JSON 标量（字符串/数字/布尔/null）')
  }
  return parsed as SysOptionValue
}

/**
 * 编辑设置项弹窗：打开时 GET 单查拿最新值与版本号，
 * 提交 PUT /admin/options/{scope}/{optionKey}，并携带 expectedVersion 做乐观并发控制。
 */
export function OptionEditModal({ option, onClose, onSaved }: OptionEditModalProps) {
  const { message } = App.useApp()
  const [form] = Form.useForm<OptionEditFormValues>()

  const detailQuery = useGetSysOption(option?.scope, option?.optionKey, {
    enabled: option !== null,
  })
  const detail = detailQuery.data

  const saveMutation = useSaveSysOption({
    onSuccess: () => {
      message.success('设置项已保存')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  // 单查返回后回填最新值；切换行时详情尚未返回则保持骨架，避免带入上一行数据
  useEffect(() => {
    if (detail) form.setFieldsValue({ value: detail.value ?? '' })
  }, [detail, form])

  const loadError =
    detailQuery.error instanceof ApiError ? detailQuery.error.message : '设置项加载失败，请重试'

  return (
    <ModalForm<OptionEditFormValues>
      name="sys-option-edit-form"
      title="编辑设置项"
      open={option !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      form={form}
      layout="vertical"
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      submitTimeout={2000}
      submitter={{
        searchConfig: { submitText: '保存', resetText: '取消' },
        submitButtonProps: {
          loading: saveMutation.isPending,
          // 详情未就绪时不允许提交（版本号是写入的必填并发依据）
          disabled: !detail,
        },
      }}
      onFinish={async (values) => {
        if (!detail) return false
        let value: SysOptionValue
        try {
          value = parseOptionValue(values.value.trim())
        } catch {
          // 正常走不到这里：表单校验已覆盖，兜底避免把非法值发出去
          return false
        }
        await saveMutation.mutateAsync({
          scope: detail.scope,
          optionKey: detail.optionKey,
          params: { value, expectedVersion: detail.version },
        })
        onSaved()
        return true
      }}
    >
      {detailQuery.isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : detailQuery.isError ? (
        <Alert type="error" showIcon title={loadError} />
      ) : (
        <>
          <Descriptions
            size="small"
            column={2}
            style={{ marginBottom: 16 }}
            items={[
              { key: 'scope', label: '归属域', children: detail?.scope ?? '-' },
              { key: 'optionKey', label: '设置键', children: detail?.optionKey ?? '-' },
              { key: 'valueType', label: '取值类型', children: detail?.valueType ?? '-' },
              { key: 'version', label: '当前版本', children: detail?.version ?? '未配置' },
              { key: 'operatorId', label: '最后更新人', children: detail?.operatorId ?? '-' },
              { key: 'updatedAt', label: '最后更新时间', children: detail?.updatedAt ?? '-' },
            ]}
          />
          <ProFormTextArea
            name="value"
            label="设置值（JSON 标量）"
            placeholder={'字符串需带双引号，如 "zh-CN"；数字如 60；布尔如 true；空值 null'}
            tooltip="后端按 JSON 标量解析并入库；保存时自动携带当前版本号做并发校验"
            fieldProps={{ autoSize: { minRows: 3, maxRows: 8 } }}
            rules={[
              {
                validator: async (_, raw: string | undefined) => {
                  const text = raw?.trim()
                  if (!text) throw new Error('请输入设置值')
                  let parsed: unknown
                  try {
                    parsed = JSON.parse(text)
                  } catch {
                    throw new Error('不是合法的 JSON，请检查引号与格式')
                  }
                  if (parsed !== null && typeof parsed === 'object') {
                    throw new Error('设置值仅支持 JSON 标量（字符串/数字/布尔/null）')
                  }
                },
              },
            ]}
          />
        </>
      )}
    </ModalForm>
  )
}
