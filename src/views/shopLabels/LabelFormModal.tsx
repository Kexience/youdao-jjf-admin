import { PlusOutlined } from '@ant-design/icons'
import { ModalForm, ProFormDigit, ProFormText } from '@ant-design/pro-components'
import { Button, Form } from 'antd'

/** 标签表单值：新建 / 修改共用 */
interface LabelFormValues {
  labelName: string
  sort?: number
}

interface LabelFormModalProps {
  /** 传入则为编辑该标签，不传为新建 */
  label?: ShopLabel
  saving: boolean
  onSubmit: (values: ShopLabelCreateParams) => Promise<unknown>
}

/**
 * 标签新建 / 编辑弹窗：按钮即 trigger，提交成功自动关闭。
 * 只承载「标签名称 + 排序」两个字段（见文档 LabelRequest / LabelUpdateRequest），
 * 成功与失败提示由父组件的 mutation 回调负责。
 */
export function LabelFormModal({ label, saving, onSubmit }: LabelFormModalProps) {
  const [form] = Form.useForm<LabelFormValues>()
  const isEdit = !!label

  return (
    <ModalForm<LabelFormValues>
      name={isEdit ? `shop-label-edit-form-${label.id}` : 'shop-label-create-form'}
      title={isEdit ? '编辑标签' : '新建标签'}
      trigger={
        isEdit ? (
          <Button type="link" size="small">
            编辑
          </Button>
        ) : (
          <Button type="primary">
            <PlusOutlined />
            新建标签
          </Button>
        )
      }
      form={form}
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      submitTimeout={2000}
      layout="vertical"
      initialValues={{ sort: label?.sort ?? 0 }}
      // 编辑时用最新行数据同步表单（列表刷新后实例复用，initialValues 只在挂载时生效一次）
      onOpenChange={(open) => {
        if (isEdit && open) {
          form.setFieldsValue({ labelName: label.labelName, sort: label.sort ?? 0 })
        }
      }}
      submitter={{
        searchConfig: { submitText: '保存', resetText: '取消' },
        submitButtonProps: { loading: saving },
      }}
      onFinish={async (values) => {
        await onSubmit({
          labelName: values.labelName.trim(),
          sort: values.sort ?? 0,
        })
        return true
      }}
    >
      <ProFormText
        name="labelName"
        label="标签名称"
        placeholder="请输入标签名称"
        fieldProps={{ maxLength: 64, showCount: true }}
        rules={[
          { required: true, whitespace: true, message: '请输入标签名称' },
          { max: 64, message: '标签名称最多 64 个字符' },
        ]}
      />
      <ProFormDigit
        name="sort"
        label="排序"
        placeholder="数值越小越靠前"
        min={0}
        fieldProps={{ precision: 0 }}
        extra="相同排序按后端返回顺序排列"
      />
    </ModalForm>
  )
}
