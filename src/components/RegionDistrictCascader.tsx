import type { CascaderProps } from 'antd'
import { App, Cascader } from 'antd'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import { fetchRegionChildren, useGetRegionChildren } from '../api/regions'
import { ApiError } from '../lib/request'

/** 行政区划根码：查询省级列表 */
const REGION_ROOT_CODE = '000000'
/** 默认叶子层级：省/市/区三级中的最后一层（区/县），选中后拿 sys_region.id */
const DEFAULT_LEAF_LEVEL = 3

/** 级联选项：value/label 为国标码/名称，regionId 为 sys_region.id */
interface RegionCascaderOption {
  value: string
  label: string
  level: number
  regionId?: number | null
  isLeaf?: boolean
  disabled?: boolean
  children?: RegionCascaderOption[]
}

interface RegionDistrictCascaderProps {
  /** 选中的省/市/区县国标码路径，如 ['440000','440100','440103'] */
  value?: string[]
  /** 选中叶子回调（默认叶子为区/县）；清空时 node 为 undefined */
  onChange?: (district: RegionChild | undefined, path: string[]) => void
  /**
   * 叶子层级（=选项可选中的最深层级）：
   * 2 = 地市（用于按城市筛选），3 = 区/县（默认，区代所属区域）。
   */
  leafLevel?: number
  placeholder?: string
  disabled?: boolean
  style?: CSSProperties
}

/**
 * 已加载子级映射 → 级联选项。
 * 未加载的非叶子节点给空 children，展开时由 loadData 拉取；
 * 叶子（层级 ≥ leafLevel）作为业务叶子，不再下钻。
 */
function buildOptions(
  nodes: RegionChild[],
  loaded: Record<string, RegionChild[]>,
  leafLevel: number,
): RegionCascaderOption[] {
  return nodes.map((node) => {
    const level = node.level ?? 0
    const children = loaded[node.code]
    const isLeaf = level >= leafLevel || (children !== undefined && children.length === 0)
    return {
      value: node.code,
      label: node.name,
      level,
      regionId: node.id,
      isLeaf,
      disabled: level > leafLevel,
      children: isLeaf ? undefined : buildOptions(children ?? [], loaded, leafLevel),
    }
  })
}

/**
 * 省/市/区县行政区划级联选择器（复用已封装的行政区划接口）。
 *
 * - 首屏只拉省级（根码 000000），展开省/市时按父码懒加载下一级（GET /admin/region/children）；
 * - 叶子（默认区/县，leafLevel=2 时为地市）选中后把 RegionChild（含 sys_region.id）交给调用方；
 * - 传入 value（国标码路径）时自动补拉沿途子级，保证刷新后回显省/市/区名称。
 */
export function RegionDistrictCascader({
  value,
  onChange,
  leafLevel = DEFAULT_LEAF_LEVEL,
  placeholder,
  disabled,
  style,
}: RegionDistrictCascaderProps) {
  const { message } = App.useApp()
  const rootQuery = useGetRegionChildren(REGION_ROOT_CODE)
  const [loaded, setLoaded] = useState<Record<string, RegionChild[]>>({})
  const loadedRef = useRef(loaded)
  const pendingRef = useRef(new Set<string>())

  /** 按父码加载并缓存子级（并发去重；已加载过则直接返回） */
  const ensureChildren = useCallback(async (code: string) => {
    if (loadedRef.current[code] !== undefined || pendingRef.current.has(code)) return
    pendingRef.current.add(code)
    try {
      const children = await fetchRegionChildren(code)
      if (loadedRef.current[code] === undefined) {
        loadedRef.current = { ...loadedRef.current, [code]: children }
        setLoaded(loadedRef.current)
      }
    } finally {
      pendingRef.current.delete(code)
    }
  }, [])

  const loadData: CascaderProps<RegionCascaderOption>['loadData'] = (selectedOptions) => {
    const target = selectedOptions[selectedOptions.length - 1]
    if (!target || target.isLeaf) return
    void ensureChildren(target.value).catch((error: unknown) => {
      message.error(error instanceof ApiError ? error.message : '行政区划加载失败，请重试')
    })
  }

  // URL 里带了区划码路径时，补拉省→市沿途子级用于回显名称
  const valueKey = value?.join('/') ?? ''
  useEffect(() => {
    if (!valueKey) return
    const codes = valueKey.split('/')
    if (codes.length < leafLevel) return
    void (async () => {
      for (const code of codes.slice(0, leafLevel - 1)) {
        try {
          await ensureChildren(code)
        } catch {
          // 回显失败不影响 regionId 查询，静默处理
          return
        }
      }
    })()
  }, [valueKey, leafLevel, ensureChildren])

  const options = useMemo(
    () => buildOptions(rootQuery.data ?? [], loaded, leafLevel),
    [rootQuery.data, loaded, leafLevel],
  )

  const handleChange: CascaderProps<RegionCascaderOption>['onChange'] = (_, selectedOptions) => {
    const last = selectedOptions[selectedOptions.length - 1]
    if (!last) {
      onChange?.(undefined, [])
      return
    }
    onChange?.(
      {
        id: last.regionId,
        code: last.value,
        name: last.label,
        level: last.level,
      },
      selectedOptions.map((option) => option.value),
    )
  }

  return (
    <Cascader<RegionCascaderOption>
      value={value}
      options={options}
      loadData={loadData}
      onChange={handleChange}
      placeholder={
        placeholder ?? (leafLevel <= 2 ? '选择省 / 市' : '选择省 / 市 / 区县')
      }
      disabled={disabled}
      style={style}
      allowClear
      notFoundContent={
        rootQuery.isLoading
          ? '加载中…'
          : rootQuery.isError
            ? '行政区划加载失败'
            : '暂无行政区划'
      }
    />
  )
}
