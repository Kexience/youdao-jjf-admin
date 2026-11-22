import { ModalForm } from '@ant-design/pro-components'
import type { TreeProps } from 'antd'
import { Alert, Button, Input, Spin, Tag, Tree } from 'antd'
import { useMemo, useState } from 'react'

import { useGetListMenus } from '../../api/menus'

interface RoleGrantModalProps {
  role: AdminRoleDetail
  saving: boolean
  onSubmit: (params: AdminRoleGrantParams) => Promise<unknown>
}

/** 授权树内部节点（菜单树裁剪：只保留展示需要的信息，同级按 sort 排序） */
interface GrantMenuNode {
  id: number
  name: string
  code?: string
  children: GrantMenuNode[]
}

function toGrantNodes(nodes: AdminMenuTreeNode[]): GrantMenuNode[] {
  return [...nodes]
    .sort((a, b) => a.sort - b.sort)
    .map((node) => ({
      id: node.id,
      name: node.name,
      code: node.permissionCode || undefined,
      children: toGrantNodes(node.children ?? []),
    }))
}

/** 关键词过滤（名称/权限码命中，或后代命中则保留祖先链） */
function filterGrantNodes(nodes: GrantMenuNode[], query: string): GrantMenuNode[] {
  const keyword = query.trim().toLowerCase()
  if (!keyword) return nodes
  return nodes.flatMap((node) => {
    const children = filterGrantNodes(node.children, query)
    const hit =
      node.name.toLowerCase().includes(keyword) ||
      (node.code?.toLowerCase().includes(keyword) ?? false)
    return hit || children.length > 0 ? [{ ...node, children }] : []
  })
}

function toTreeData(nodes: GrantMenuNode[]): TreeProps['treeData'] {
  return nodes.map((node) => ({
    key: String(node.id),
    title: node.code ? (
      <span>
        {node.name} <span style={{ color: '#8c8c8c', fontSize: 12 }}>{node.code}</span>
      </span>
    ) : (
      node.name
    ),
    // 无权限码的目录/菜单节点不可勾选（授权单位是权限码），子节点仍可单独勾选
    disableCheckbox: !node.code,
    children: node.children.length > 0 ? toTreeData(node.children) : undefined,
  }))
}

/**
 * 编辑角色授权弹窗：可勾选菜单树（checkStrictly + 手动向下联动，按权限码提交）。
 * 勾选/取消父级会连带勾选/取消其下全部子孙；子级变化不回推父级，
 * 这样「只授予菜单、不给按钮」的既有授权不会被打开弹窗后误升级。
 * 可选权限来自菜单全量树（GET /admin/menus）的 permissionCode；
 * 已授予但不在树中的码单独列出并默认保留，可手动移除（全不选+移除=清空授权）。
 */
export function RoleGrantModal({ role, saving, onSubmit }: RoleGrantModalProps) {
  const [checkedIds, setCheckedIds] = useState<string[]>([])
  const [unknownCodes, setUnknownCodes] = useState<string[]>([])
  const [query, setQuery] = useState('')

  const menusQuery = useGetListMenus()

  const grantNodes = useMemo(() => toGrantNodes(menusQuery.data ?? []), [menusQuery.data])

  // id↔权限码双向映射（同码多节点时取首个，提交时去重）
  const { idToCode, codeToId } = useMemo(() => {
    const idToCode = new Map<string, string>()
    const codeToId = new Map<string, string>()
    const walk = (items: GrantMenuNode[]) => {
      for (const node of items) {
        if (node.code) {
          idToCode.set(String(node.id), node.code)
          if (!codeToId.has(node.code)) codeToId.set(node.code, String(node.id))
        }
        walk(node.children)
      }
    }
    walk(grantNodes)
    return { idToCode, codeToId }
  }, [grantNodes])

  // 父级 id → 其下所有可勾选子孙 id（向下联动用；无权限码的目录节点不入结果）
  const descendantsOf = useMemo(() => {
    const map = new Map<string, string[]>()
    const walk = (node: GrantMenuNode): string[] => {
      const ids: string[] = []
      for (const child of node.children) {
        if (child.code) ids.push(String(child.id))
        ids.push(...walk(child))
      }
      map.set(String(node.id), ids)
      return ids
    }
    grantNodes.forEach(walk)
    return map
  }, [grantNodes])

  /** 打开时以最新详情数据同步勾选态（树可能晚于弹窗加载，加载完成前禁用提交防误清空） */
  function syncFromRole() {
    const granted = role.permissionCodes ?? []
    const ids: string[] = []
    const unknown: string[] = []
    for (const code of granted) {
      const id = codeToId.get(code)
      if (id !== undefined) {
        if (!ids.includes(id)) ids.push(id)
      } else if (!unknown.includes(code)) {
        unknown.push(code)
      }
    }
    setCheckedIds(ids)
    setUnknownCodes(unknown)
    setQuery('')
  }

  /** 勾选/取消父级时连带勾选/取消其全部子孙（子级变化不回推父级） */
  const handleCheck: TreeProps['onCheck'] = (checked) => {
    const keys = (Array.isArray(checked) ? checked : checked.checked).map(String)
    const added = keys.filter((key) => !checkedIds.includes(key))
    const removed = checkedIds.filter((key) => !keys.includes(key))
    if (added.length === 0 && removed.length === 0) {
      setCheckedIds(keys)
      return
    }
    const next = new Set(keys)
    for (const key of added) {
      for (const childKey of descendantsOf.get(key) ?? []) next.add(childKey)
    }
    for (const key of removed) {
      for (const childKey of descendantsOf.get(key) ?? []) next.delete(childKey)
    }
    setCheckedIds([...next])
  }

  const visibleTreeData = useMemo(
    () => toTreeData(filterGrantNodes(grantNodes, query)),
    [grantNodes, query],
  )

  return (
    <ModalForm
      name={`role-grant-form-${role.id}`}
      title={`编辑授权（${role.roleName}）`}
      trigger={<Button>编辑授权</Button>}
      modalProps={{ destroyOnHidden: true, width: 600 }}
      submitTimeout={2000}
      layout="vertical"
      onOpenChange={(open) => {
        if (open) syncFromRole()
      }}
      submitter={{
        searchConfig: { submitText: '保存', resetText: '取消' },
        submitButtonProps: {
          loading: saving,
          disabled: menusQuery.isLoading || menusQuery.isError,
        },
      }}
      onFinish={async () => {
        const codes = new Set<string>()
        for (const id of checkedIds) {
          const code = idToCode.get(id)
          if (code) codes.add(code)
        }
        for (const code of unknownCodes) codes.add(code)
        await onSubmit({ permissionCodes: [...codes] })
        return true
      }}
    >
      {menusQuery.isLoading && (
        <Spin description="权限树加载中…">
          <div style={{ minHeight: 120 }} />
        </Spin>
      )}
      {menusQuery.isError && (
        <Alert type="error" showIcon message="权限树加载失败，请关闭重试" />
      )}
      {menusQuery.data && (
        <>
          <Input.Search
            placeholder="按名称 / 权限码过滤"
            allowClear
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <div style={{ maxHeight: 360, overflow: 'auto', border: '1px solid #f0f0f0', padding: 8 }}>
            <Tree
              checkable
              checkStrictly
              defaultExpandAll
              treeData={visibleTreeData}
              checkedKeys={checkedIds}
              onCheck={handleCheck}
            />
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
            已选 {checkedIds.length} 项
            {unknownCodes.length > 0 ? '（不含下方树外权限）' : ''}
            ，勾选父级会自动带上其下全部子级；保存为整体重写。
          </div>
          {unknownCodes.length > 0 && (
            <Alert
              style={{ marginTop: 8 }}
              type="warning"
              showIcon
              message="以下已授权限不在当前菜单树中，默认保留，可手动移除"
              description={
                <div>
                  {unknownCodes.map((code) => (
                    <Tag
                      key={code}
                      closable
                      onClose={() => setUnknownCodes((prev) => prev.filter((c) => c !== code))}
                      style={{ marginBottom: 4 }}
                    >
                      {code}
                    </Tag>
                  ))}
                </div>
              }
            />
          )}
        </>
      )}
    </ModalForm>
  )
}
