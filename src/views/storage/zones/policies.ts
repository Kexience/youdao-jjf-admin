/** 写策略选项（见文档 StorageZoneCreateDto.writePolicy） */
export const WRITE_POLICY_OPTIONS = [
  { value: 'ANON', label: '匿名可写（ANON）' },
  { value: 'AUTH_USER', label: '登录用户可写（AUTH_USER）' },
  { value: 'ADMIN_ONLY', label: '仅管理员可写（ADMIN_ONLY）' },
]

/** 读策略选项（见文档 StorageZoneCreateDto.readPolicy） */
export const READ_POLICY_OPTIONS = [
  { value: 'PUBLIC', label: '公开读（PUBLIC）' },
  { value: 'SIGNED', label: '签名读（SIGNED）' },
  { value: 'PROGRAM_ONLY', label: '仅程序读（PROGRAM_ONLY）' },
]

/** 策略英文值 → 中文展示（未知值回退原样） */
function toLabel(options: { value: string; label: string }[], value?: string): string {
  if (!value) return '-'
  return options.find((o) => o.value === value)?.label ?? value
}

export function writePolicyLabel(value?: string): string {
  return toLabel(WRITE_POLICY_OPTIONS, value)
}

export function readPolicyLabel(value?: string): string {
  return toLabel(READ_POLICY_OPTIONS, value)
}
