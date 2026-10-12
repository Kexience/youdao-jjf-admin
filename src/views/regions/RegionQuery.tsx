import type { ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { Alert, App, Spin, Tag } from 'antd'
import { useMemo, useState } from 'react'
import type { Key } from 'react'

import { fetchRegionChildren, useGetRegionChildren } from '../../api/regions'
import { ApiError } from '../../lib/request'

/** 省级的父码（文档：根码 000000 返回省级） */
const ROOT_CODE = '000000'
/** 街道层级；达到该层级作叶子，不再下钻 */
const LEAF_LEVEL = 4

/** 行政区划树节点：RegionChildVo + 懒加载的子级 */
interface RegionTreeNode extends RegionChild {
  children?: RegionTreeNode[]
}

/** 层级元信息（见文档 RegionChildVo.level：1 省 2 地 3 区/县 4 街道） */
const LEVEL_META: Record<number, { label: string; color: string }> = {
  1: { label: '省级', color: 'blue' },
  2: { label: '地市', color: 'geekblue' },
  3: { label: '区/县', color: 'green' },
  4: { label: '街道', color: 'orange' },
}

/**
 * 用「已加载子级映射」递归拼出树。
 * nest 模式下 rc-table 依据 record.children 是否为真值决定要不要渲染展开图标，
 * 因此未加载的非街道节点先给空数组 [] 以显示展开图标；
 * 已加载且确实无子级的节点则置 undefined，隐藏图标（也不会再发起请求）。
 */
function buildTree(
  nodes: RegionChild[],
  loaded: Record<string, RegionChild[]>,
): RegionTreeNode[] {
  return nodes.map((node) => {
    if ((node.level ?? 0) >= LEAF_LEVEL) return { ...node, children: undefined }
    const hasLoaded = Object.prototype.hasOwnProperty.call(loaded, node.code)
    const children = loaded[node.code]
    if (hasLoaded && children.length === 0) return { ...node, children: undefined }
    return {
      ...node,
      children: hasLoaded ? buildTree(children, loaded) : [],
    }
  })
}

/**
 * 区域查询（独立页面 /region/query）：以树形表格浏览行政区划（GET /admin/region/children）。
 * 首屏只加载省级（根码 000000），展开节点时按父码懒加载下一级并写入映射，
 * 街道（level>=4）为叶子；结构与交互对齐菜单管理页的树表格。
 */
export function RegionQuery() {
  const { message } = App.useApp()
  const [loadedChildren, setLoadedChildren] = useState<Record<string, RegionChild[]>>({})
  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>([])
  const [expandingCodes, setExpandingCodes] = useState<string[]>([])

  const rootQuery = useGetRegionChildren(ROOT_CODE)

  const treeData = useMemo(
    () => buildTree(rootQuery.data ?? [], loadedChildren),
    [rootQuery.data, loadedChildren],
  )

  const handleReload = () => {
    setExpandedRowKeys([])
    setLoadedChildren({})
    void rootQuery.refetch()
  }

  const handleExpand = (expanded: boolean, record: RegionTreeNode) => {
    setExpandedRowKeys((keys) =>
      expanded ? [...keys, record.code] : keys.filter((key) => key !== record.code),
    )
    // 已加载过子级（含空结果）或正在加载中，不重复请求
    if (!expanded || loadedChildren[record.code] || expandingCodes.includes(record.code)) return
    setExpandingCodes((codes) => [...codes, record.code])
    fetchRegionChildren(record.code)
      .then((children) => {
        setLoadedChildren((prev) => ({ ...prev, [record.code]: children }))
      })
      .catch((error: unknown) => {
        message.error(error instanceof ApiError ? error.message : '子级区划加载失败，请重试')
      })
      .finally(() => {
        setExpandingCodes((codes) => codes.filter((code) => code !== record.code))
      })
  }

  const columns: ProColumns<RegionTreeNode>[] = [
    {
      title: '区划名称',
      dataIndex: 'name',
      ellipsis: true,
      render: (_, record) => (
        <span>
          {record.name}
          {expandingCodes.includes(record.code) && (
            <Spin size="small" style={{ marginInlineStart: 8 }} />
          )}
        </span>
      ),
    },
    {
      title: '国标码',
      dataIndex: 'code',
      width: 180,
      copyable: true,
    },
    {
      title: '层级',
      dataIndex: 'level',
      width: 120,
      render: (_, record) => {
        const meta = LEVEL_META[record.level]
        return meta ? <Tag color={meta.color}>{meta.label}</Tag> : <Tag>{record.level}</Tag>
      },
    },
  ]

  return (
    <PageContainer
      header={{
        title: '区域查询',
        subTitle: '按国标码懒加载行政区划树，展开查看省 / 市 / 区县 / 街道。',
      }}
    >
      {rootQuery.isError && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message={
            rootQuery.error instanceof ApiError
              ? rootQuery.error.message
              : '区划数据加载失败，请重试'
          }
        />
      )}
      <ProTable<RegionTreeNode>
        rowKey="code"
        columns={columns}
        dataSource={treeData}
        loading={rootQuery.isFetching}
        pagination={false}
        search={false}
        dateFormatter={false}
        expandable={{
          expandedRowKeys,
          onExpand: handleExpand,
        }}
        headerTitle="行政区划树"
        options={{ reload: handleReload, density: true }}
        locale={{ emptyText: rootQuery.isError ? '加载失败，请重试' : '暂无区划数据' }}
      />
    </PageContainer>
  )
}
