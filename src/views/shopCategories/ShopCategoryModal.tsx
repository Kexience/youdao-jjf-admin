import { ModalForm, ProFormDigit, ProFormSelect, ProFormText } from '@ant-design/pro-components'
import { useMemo } from 'react'

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
      <ProFormText
        name="icon"
        label="图标"
        placeholder="图标 URL 或标识（可选）"
        fieldProps={{ maxLength: 255 }}
        rules={[{ max: 255, message: '图标最多 255 个字符' }]}
        extra="可留空；编辑时清空即清除图标"
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
