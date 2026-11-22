import { UploadOutlined } from '@ant-design/icons'
import {
  ModalForm,
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components'
import { App, Button, Image, Space, Upload } from 'antd'
import { useMemo, useState } from 'react'

import { SHOP_CATEGORY_ICON_ZONE } from '../../api/shopCategories'
import { uploadImageViaCredential } from '../../api/storageUpload'
import { ApiError } from '../../lib/request'

/** 弹窗表单值：与 ShopCategoryCreateParams / ShopCategoryUpdateParams 对齐 */
export interface ShopCategoryFormValues {
  pid: number
  categoryName: string
  icon?: string
  sort?: number
}

/** 分类弹窗状态：新建（带父级 id，0=一级）或编辑（带节点） */
export type ShopCategoryModalState =
  | { mode: 'create'; pid: number }
  | { mode: 'edit'; node: ShopCategoryNode }

/** 提交体：新建带 pid，编辑带 id（后端不支持改父级） */
export type ShopCategoryModalSubmit =
  | { mode: 'create'; params: ShopCategoryCreateParams }
  | { mode: 'edit'; id: number; params: ShopCategoryUpdateParams }

interface ShopCategoryModalProps {
  state: ShopCategoryModalState
  /** 完整分类树：只取一级节点作为父级候选（分类最多两级） */
  tree: ShopCategoryNode[]
  saving: boolean
  onCancel: () => void
  onSubmit: (submit: ShopCategoryModalSubmit) => void
}

/**
 * 行业分类新建 / 编辑弹窗（挂载即按当前 state 初始化，关闭即卸载）。
 * 新建可选父级（顶级 0 或任一现有一级分类），编辑只改名称 / 图标 / 排序
 * ——后端 CategoryUpdateRequest 不支持移动父级。
 * 提交后返回 false 不自动关闭，由父组件在保存成功后卸载。
 */
export function ShopCategoryModal({
  state,
  tree,
  saving,
  onCancel,
  onSubmit,
}: ShopCategoryModalProps) {
  const parentOptions = useMemo(
    () => [
      { value: 0, label: '顶级分类（一级）' },
      ...tree.map((node) => ({
        value: node.id,
        label: node.categoryName || `#${node.id}`,
      })),
    ],
    [tree],
  )

  const initialValues: ShopCategoryFormValues =
    state.mode === 'edit'
      ? {
          pid: state.node.pid,
          categoryName: state.node.categoryName ?? '',
          icon: state.node.icon,
          sort: state.node.sort ?? 0,
        }
      : {
          pid: state.pid,
          categoryName: '',
          sort: 0,
        }

  return (
    <ModalForm<ShopCategoryFormValues>
      title={
        state.mode === 'edit' ? '编辑行业分类' : state.pid === 0 ? '新建一级分类' : '新建子分类'
      }
      open
      onOpenChange={(open) => {
        if (!open) onCancel()
      }}
      modalProps={{ destroyOnHidden: true }}
      layout="vertical"
      initialValues={initialValues}
      submitter={{
        searchConfig: { submitText: '保存', resetText: '取消' },
        submitButtonProps: { loading: saving },
      }}
      onFinish={async (values) => {
        const categoryName = values.categoryName.trim()
        // 图标可清空：编辑时传空串即清除，新建时空串交给后端默认值
        const icon = values.icon?.trim() ?? ''
        if (state.mode === 'create') {
          onSubmit({
            mode: 'create',
            params: {
              pid: values.pid,
              categoryName,
              icon: icon || undefined,
              sort: values.sort ?? 0,
            },
          })
        } else {
          onSubmit({
            mode: 'edit',
            id: state.node.id,
            params: {
              categoryName,
              icon,
              sort: values.sort ?? 0,
            },
          })
        }
        return false
      }}
    >
      {state.mode === 'create' && (
        <ProFormSelect
          name="pid"
          label="父级分类"
          placeholder="请选择父级分类"
          rules={[{ required: true, message: '请选择父级分类' }]}
          options={parentOptions}
          fieldProps={{ showSearch: true, optionFilterProp: 'label' }}
          extra="分类最多两级：顶级为一级，只能在一级分类下建二级"
        />
      )}
      <ProFormText
        name="categoryName"
        label="分类名称"
        placeholder="请输入分类名称"
        fieldProps={{ maxLength: 64, showCount: true }}
        rules={[
          { required: true, whitespace: true, message: '请输入分类名称' },
          { max: 64, message: '分类名称最多 64 个字符' },
        ]}
      />
      <ProForm.Item name="icon" label="图标">
        <CategoryIconUpload />
      </ProForm.Item>
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

/** 是否为可直接预览的绝对地址（历史数据可能是对象 key 或标识，预览不了） */
function isHttpUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https?:\/\//.test(value)
}

/**
 * 图标上传字段（由 ProForm.Item 注入 value / onChange）。
 * 直传 OSS 后把可读地址回填到 icon 字段；编辑时可重新上传或移除。
 * icon 落库存 URL 字符串，上限 255，超长直接提示不写入。
 */
function CategoryIconUpload({
  value,
  onChange,
}: {
  value?: string
  onChange?: (value?: string) => void
}) {
  const { message } = App.useApp()
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const { viewUrl } = await uploadImageViaCredential(file, SHOP_CATEGORY_ICON_ZONE)
      if (viewUrl.length > 255) {
        message.error('图标地址超过 255 个字符，请换一张图片后重试')
        return
      }
      onChange?.(viewUrl)
    } catch (error) {
      message.error(error instanceof ApiError ? error.message : '图标上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Space align="start" size={16}>
      {isHttpUrl(value) && (
        <Image
          src={value}
          width={64}
          height={64}
          style={{ objectFit: 'contain', border: '1px solid #f0f0f0', borderRadius: 6 }}
          alt="分类图标"
        />
      )}
      <Space direction="vertical" size={8}>
        <Space size={8}>
          <Upload
            accept="image/*"
            showUploadList={false}
            disabled={uploading}
            beforeUpload={(file) => {
              void handleFile(file)
              return false
            }}
          >
            <Button icon={<UploadOutlined />} loading={uploading}>
              {uploading ? '上传中' : value ? '重新上传' : '上传图标'}
            </Button>
          </Upload>
          {value && !uploading && (
            <Button type="link" danger onClick={() => onChange?.(undefined)}>
              移除
            </Button>
          )}
        </Space>
        <span style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: 12 }}>
          支持 JPG / PNG 等图片，上传成功后自动回填图标地址
        </span>
      </Space>
    </Space>
  )
}
