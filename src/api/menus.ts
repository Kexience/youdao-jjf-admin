import { del, get, post, put } from '../lib/request'

/**
 * 后台菜单管理（线上文档 tag「后台菜单管理」）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 路径写法：VITE_API_PROXY_TARGET 已含 /admin 前缀（见 vite.config.ts），
 * 这里只写 /admin 之后的路径，即文档路径去掉 /admin 前缀。
 */

/** 菜单全量树（含隐藏节点）：GET /admin/menus */
export function listMenus(): Promise<AdminMenuTreeNode[]> {
  return get<AdminMenuTreeNode[]>('/menus')
}

/** 当前管理员可见菜单树与权限码集合：GET /admin/menus/mine */
export function getMyMenus(): Promise<AdminMenuMineResult> {
  return get<AdminMenuMineResult>('/menus/mine')
}

/** 新建菜单节点：POST /admin/menus */
export function createMenu(params: AdminMenuSaveParams): Promise<AdminMenuTreeNode> {
  return post<AdminMenuTreeNode>('/menus', params)
}

/** 编辑菜单节点：PUT /admin/menus/{id} */
export function updateMenu(id: number, params: AdminMenuSaveParams): Promise<AdminMenuTreeNode> {
  return put<AdminMenuTreeNode>(`/menus/${id}`, params)
}

/**
 * 删除菜单节点（仅叶子）：DELETE /admin/menus/{id}。
 * 文档响应为 ResultVoid（data 为空对象），这里按 void 处理，调用方无需关心返回值。
 */
export async function deleteMenu(id: number): Promise<void> {
  await del<unknown>(`/menus/${id}`)
}
