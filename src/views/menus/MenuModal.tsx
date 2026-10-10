import {
  ModalForm,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTreeSelect,
} from '@ant-design/pro-components'
import { useMemo } from 'react'

/** 弹窗表单值：与 AdminMenuSaveParams 一一对应 */
export interface MenuFormValues {
  pid: number
  name: string
  menuType: AdminMenuType
  icon?: string
  component?: string
  sort?: number
  isShow: 0 | 1
  permissionCode?: string
}

export type ModalState = { mode: 'create'; pid: number } | { mode: 'edit'; node: AdminMenuTreeNode }

/** 收集节点自身及所有后代 id（编辑时禁用这些父级选项，避免形成环） */
function collectSubtreeIds(node: AdminMenuTreeNode): Set<number> {
  const ids = new Set<number>([node.id])
  const walk = (children?: AdminMenuTreeNode[]) => {
    for (const child of children ?? []) {
      ids.add(child.id)
      walk(child.children)
    }
  }
  walk(node.children)
  return ids
}

/** 父级选择器选项：与 TreeSelect treeData 的 {title, value, children} 对齐 */
interface ParentOption {
  title: string
  value: number
  disabled?: boolean
  children?: ParentOption[]
}

/** 菜单树 → TreeSelect 父级选项（顶级 pid=0 与各节点平级） */
function toParentOptions(nodes: AdminMenuTreeNode[], disabledIds: Set<number>): ParentOption[] {
  const walk = (list: AdminMenuTreeNode[]): ParentOption[] =>
    list.map((node) => ({
      title: node.name,
      value: node.id,
      disabled: disabledIds.has(node.id),
      children: node.children?.length ? walk(node.children) : undefined,
    }))
  return [{ title: '顶级（无父级）', value: 0 }, ...walk(nodes)]
}

interface MenuModalProps {
  state: ModalState
  tree: AdminMenuTreeNode[]
  saving: boolean
  onCancel: () => void
  onSubmit: (params: AdminMenuSaveParams) => void
}

/**
 * 新建 / 编辑菜单弹窗（挂载即按当前 state 初始化，关闭即卸载）。
 * 提交后返回 false 不自动关闭，由父组件在保存成功后卸载。
 */
export function MenuModal({ state, tree, saving, onCancel, onSubmit }: MenuModalProps) {
  const isEdit = state.mode === 'edit'

  const disabledIds = useMemo(
    () => (isEdit ? collectSubtreeIds((state as { node: AdminMenuTreeNode }).node) : new Set<number>()),
    [isEdit, state],
  )
  const parentOptions = useMemo(() => toParentOptions(tree, disabledIds), [tree, disabledIds])

  const initialValues: MenuFormValues = isEdit
    ? (() => {
      const node = (state as { node: AdminMenuTreeNode }).node
      return {
        pid: node.pid,
        name: node.name,
        menuType: node.menuType,
        icon: node.icon,
        component: node.component,
        sort: node.sort,
        isShow: (node.show ? 1 : 0) as 0 | 1,
        permissionCode: node.permissionCode,
      }
    })()
    : {
      pid: (state as { pid: number }).pid,
      name: '',
      menuType: 'C',
      sort: 0,
      isShow: 1 as const,
    }

  return (
    <ModalForm<MenuFormValues>
      title={isEdit ? '编辑菜单节点' : '新建菜单节点'}
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
        onSubmit({
          pid: values.pid,
          name: values.name.trim(),
          menuType: values.menuType,
          icon: values.icon?.trim() || undefined,
          component: values.component?.trim() || undefined,
          sort: values.sort ?? 0,
          isShow: values.isShow,
          permissionCode: values.permissionCode?.trim() || undefined,
        })
        return false
      }}
    >
      <ProFormTreeSelect
        name="pid"
        label="父级节点"
        placeholder="请选择父级节点"
        rules={[{ required: true, message: '请选择父级节点' }]}
        fieldProps={{
          treeData: parentOptions,
          treeDefaultExpandAll: true,
          allowClear: false,
        }}
      />
      <ProFormText
        name="name"
        label="节点名称"
        placeholder="请输入节点名称"
        rules={[
          { required: true, message: '请输入节点名称' },
          { max: 100, message: '节点名称最多 100 个字符' },
        ]}
        fieldProps={{ maxLength: 100 }}
      />
      <ProFormSelect
        name="menuType"
        label="节点类型"
        placeholder="请选择节点类型"
        rules={[{ required: true, message: '请选择节点类型' }]}
        options={[
          { value: 'M', label: 'M · 目录' },
          { value: 'C', label: 'C · 菜单' },
          { value: 'A', label: 'A · 按钮' },
        ]}
      />
      <ProFormText
        name="icon"
        label="图标"
        placeholder="图标标识（可选）"
        rules={[{ max: 255, message: '图标最多 255 个字符' }]}
        fieldProps={{ maxLength: 255 }}
      />
      <ProFormText
        name="component"
        label="前端路由 / 组件路径"
        placeholder="如 /system/menus（可选）"
        rules={[{ max: 200, message: '组件路径最多 200 个字符' }]}
        fieldProps={{ maxLength: 200 }}
      />
      <ProFormDigit
        name="sort"
        label="同级排序（小值在前）"
        placeholder="默认为 0"
        min={0}
      />
      <ProFormRadio.Group
        name="isShow"
        label="是否进菜单树"
        options={[
          { value: 1, label: '显示' },
          { value: 0, label: '隐藏' },
        ]}
      />
      <ProFormText
        name="permissionCode"
        label="权限码（目录可空）"
        placeholder="引用的权限码（可选）"
        rules={[{ max: 64, message: '权限码最多 64 个字符' }]}
        fieldProps={{ maxLength: 64 }}
      />
    </ModalForm>
  )
}
