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

  /** POST /admin/auth/login 入参（见文档 AdminLoginDto） */
  interface AdminLoginParams {
    username: string
    password: string
  }

  /** 管理员登录成功响应（见文档 AdminLoginVo） */
  interface AdminLoginResult {
    /** 管理员 access token */
    accessToken: string
    /** 令牌有效期（秒） */
    expiresIn: number
  }

  /** 菜单节点类型（见文档 AdminMenuSaveRequest.menuType）：M 目录 / C 菜单 / A 按钮 */
  type AdminMenuType = 'M' | 'C' | 'A'

  /** 菜单树节点（见文档 AdminMenuTreeVo） */
  interface AdminMenuTreeNode {
    /** 节点 id */
    id: number
    /** 父级节点 id，顶级为 0 */
    pid: number
    /** 节点名称 */
    name: string
    /** 图标 */
    icon?: string
    /** 节点类型：M 目录 / C 菜单 / A 按钮 */
    menuType: AdminMenuType
    /** 前端路由/组件路径 */
    component?: string
    /** 同级排序 */
    sort: number
    /** 是否进菜单树 */
    show: boolean
    /** 引用的权限码，目录可空 */
    permissionCode?: string
    /** 子节点 */
    children?: AdminMenuTreeNode[]
  }

  /** 新建/编辑菜单节点入参（见文档 AdminMenuSaveRequest） */
  interface AdminMenuSaveParams {
    /** 父级节点 id，顶级为 0 */
    pid: number
    /** 节点名称 */
    name: string
    /** 节点类型：M 目录 / C 菜单 / A 按钮 */
    menuType: AdminMenuType
    /** 图标 */
    icon?: string
    /** 前端路由/组件路径 */
    component?: string
    /** 同级排序，小值在前 */
    sort?: number
    /** 是否进菜单树：1 显示 0 隐藏；为空默认显示 */
    isShow?: 0 | 1
    /** 引用的权限码，目录可空 */
    permissionCode?: string
  }

  /** 当前管理员可见菜单树与权限码集合（见文档 AdminMenuMineVo） */
  interface AdminMenuMineResult {
    /** 可见菜单树 */
    menus: AdminMenuTreeNode[]
    /** 当前管理员权限码集合 */
    codes: string[]
  }
}

export {}
