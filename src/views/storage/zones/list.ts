/** 逗号分隔文本 → 数组（空=undefined，即不限制/不启用） */
export function splitList(value?: string): string[] | undefined {
  const list = (value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return list.length ? list : undefined
}

/** 数组 → 逗号分隔文本（编辑初始值用） */
export function joinList(value?: string[]): string {
  return (value ?? []).join(',')
}
