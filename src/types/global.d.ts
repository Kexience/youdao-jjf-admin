/**
 * 全局共享类型：无需 import，直接使用。
 * 后端约定以线上文档为准：https://dev-1.ydndd.com/v3/api-docs
 */
declare global {
  /** 后端统一响应信封 ResultXxx{code, message, data} */
  interface ApiResult<T> {
    code: number
    message: string
    data: T
  }

  /** 分页结果 PageResultXxx{total, page(1 起), size, records} */
  interface PageResult<T> {
    total: number
    page: number
    size: number
    records: T[]
  }

  /** 分页查询参数（?page=&size=） */
  interface PageParams {
    page: number
    size: number
  }

  /** 主题模式：浅色 / 深色 / 跟随系统 */
  type ThemeMode = 'light' | 'dark' | 'system'

  /** 解析后的实际主题（只可能是浅/深） */
  type ResolvedTheme = 'light' | 'dark'
}

export {}
