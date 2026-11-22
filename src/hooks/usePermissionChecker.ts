import { useCallback } from 'react'

import { useGetMyMenus } from '../api/menus'

/**
 * 权限码控显隐（约定）：
 * 权限码由 GET /admin/menus/mine 的 codes 下发，菜单/按钮节点同时携带 permissionCode。
 * 页面用本 hook 判断操作按钮是否展示；后端仍会按权限码鉴权，前端隐藏只是体验层。
 *
 * 菜单未加载完或接口失败时按「无权限」处理，避免短暂展示越权按钮。
 */
export function usePermissionChecker(): (code: string) => boolean {
  const { data } = useGetMyMenus()
  const codes = data?.codes
  return useCallback(
    (code: string) => (codes ? codes.includes(code) : false),
    [codes],
  )
}
