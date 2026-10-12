import * as AntdIcons from '@ant-design/icons'
import type { MenuDataItem } from '@ant-design/pro-components'
import { ProLayout } from '@ant-design/pro-components'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { Button, Dropdown, Tooltip } from 'antd'
import type { ComponentType, ReactNode } from 'react'
import { createElement, useMemo } from 'react'

import { useGetMyMenus } from '../api/menus'
import { useMyProfile } from '../api/account'
import { useAuthStore } from '../stores/auth'
import { useResolvedTheme, useThemeStore } from '../stores/theme'

/**
 * 后端 icon 字符串 → Antd 图标组件（自动映射 @ant-design/icons 全量图标）。
 * 支持 MenuOutlined / menu / menu-outlined / Menu 等写法，大小写、分隔符不敏感；
 * 无后缀时默认找 Outlined（如 menu → MenuOutlined）；填错返回 undefined（无图标不报错）。
 */
const ICONS_BY_KEY = new Map<string, ComponentType>()
for (const [name, component] of Object.entries(AntdIcons)) {
  if (!/^[A-Z][\dA-Za-z]*((Outlined)|(Filled)|(TwoTone))$/.test(name)) continue
  if (typeof component !== 'function' && typeof component !== 'object') continue
  ICONS_BY_KEY.set(name.toLowerCase(), component as ComponentType)
}

function resolveMenuIcon(icon?: string): ReactNode | undefined {
  const raw = icon?.trim().toLowerCase().replace(/[-_\s]+/g, '')
  if (!raw) return undefined
  const component =
    ICONS_BY_KEY.get(raw) ??
    (!/(outlined|filled|twotone)$/.test(raw) ? ICONS_BY_KEY.get(`${raw}outlined`) : undefined)
  if (!component) return undefined
  return createElement(component)
}

/**
 * 后端菜单树 → ProLayout MenuDataItem。
 * - 按钮类型（A）不进侧边栏，直接丢弃（其子树一并丢弃）；
 * - show 为 false（隐藏）的节点不进侧边栏，其子树同样整体丢弃；
 * - 父节点不显示时子节点也不显示：后端 /menus/mine 会把「隐藏/被过滤父级」下的
 *   可见子节点向上「桥接」到最近的可见祖先（甚至挂到根），这些子节点的 pid 仍指向
 *   那个不在返回树中的父节点。这里用 pid 不在可见树中的孤儿判定把它们整支丢弃，
 *   避免出现「父级隐藏、子菜单还显示」的孤立菜单；
 * - 目录（M）无 component 时 path 置空，只做折叠分组；若过滤后分组为空也不再渲染；
 * - icon 自动映射 @ant-design/icons，填 MenuOutlined / menu 都能显示，填错则无图标；
 * - 同级按 sort 升序排列。
 */

/** 收集返回树里所有可见节点 id（用于识别被桥接的孤儿节点） */
function collectMenuIds(nodes: AdminMenuTreeNode[]): Set<number> {
  const ids = new Set<number>()
  const walk = (list: AdminMenuTreeNode[]) => {
    for (const node of list) {
      ids.add(node.id)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(nodes)
  return ids
}

function toMenuItems(nodes: AdminMenuTreeNode[], visibleIds: Set<number>): MenuDataItem[] {
  return [...nodes]
    .sort((a, b) => a.sort - b.sort)
    .flatMap((node): MenuDataItem[] => {
      // 按钮与隐藏节点不展示；父级不在可见树中说明它是被隐藏父级桥接上来的孤儿，整支丢弃
      if (node.menuType === 'A' || !node.show) return []
      if (node.pid !== 0 && !visibleIds.has(node.pid)) return []
      const children = node.children?.length ? toMenuItems(node.children, visibleIds) : undefined
      const path = node.component?.trim() || undefined
      // 目录（无路由）在子节点全部被过滤后不再渲染空分组
      if (!path && !children?.length) return []
      return [
        {
          key: String(node.id),
          name: node.name,
          icon: resolveMenuIcon(node.icon),
          // 目录节点无路由地址时留空，ProLayout 会渲染为可展开的分组
          path,
          children,
        },
      ]
    })
}

interface AdminLayoutProps {
  children: ReactNode
}

/**
 * 管理端主布局（ProLayout side 模式）：
 * - 菜单直接使用当前管理员可见树（GET /admin/menus/mine），无本地兜底；
 * - 菜单点击走 TanStack Router 的 Link；
 * - 用户信息走 avatarProps（GET /admin/users/me，有数据时显示昵称/用户名）；
 * - 头部操作区（actionsRender）只放白色/深色切换。
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const resolved = useResolvedTheme()
  const toggleTheme = useThemeStore((s) => s.toggle)
  const clearToken = useAuthStore((s) => s.clearToken)
  const token = useAuthStore((s) => s.token)

  const myMenusQuery = useGetMyMenus()
  const myProfileQuery = useMyProfile({ enabled: !!token })

  const menuData = useMemo<MenuDataItem[]>(() => {
    const menus = myMenusQuery.data?.menus ?? []
    return toMenuItems(menus, collectMenuIds(menus))
  }, [myMenusQuery.data])

  return (
    <div style={{ height: '100vh' }}>
      <ProLayout
        title="优道"
        logo={false}
        location={{ pathname }}
        layout="side"
        navTheme={resolved === 'dark' ? 'realDark' : 'light'}
        onMenuHeaderClick={() => void navigate({ to: '/' })}
        menu={{ hideMenuWhenCollapsed: true }}
        menuDataRender={() => menuData}
        menuItemRender={(item, defaultDom) => {
          // 外链 / 无 path 的分组保持默认渲染，只有站内路由才走 Router Link
          if (!item.path || item.isUrl || /^https?:\/\//.test(item.path)) {
            return defaultDom
          }
          return <Link to={item.path as '/'}>{defaultDom}</Link>
        }}
        actionsRender={() => [
          <Tooltip key="theme" title="切换白色/深色">
            <Button
              type="text"
              icon={resolved === 'dark' ? <AntdIcons.SunOutlined /> : <AntdIcons.MoonOutlined />}
              onClick={toggleTheme}
            >
              {resolved === 'dark' ? '白色' : '深色'}
            </Button>
          </Tooltip>,
        ]}
        avatarProps={{
          size: 'small',
          src: myProfileQuery.data?.avatar || undefined,
          icon: <AntdIcons.UserOutlined />,
          title:
            myProfileQuery.data?.nickname ||
            myProfileQuery.data?.realname ||
            myProfileQuery.data?.username ||
            '管理员',
          render: (_, defaultDom) => (
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'account',
                    label: '个人中心',
                    icon: <AntdIcons.UserOutlined />,
                  },
                  {
                    key: 'logout',
                    label: '退出登录',
                    icon: <AntdIcons.LogoutOutlined />,
                  },
                ],
                onClick: ({ key }) => {
                  if (key === 'account') {
                    void navigate({ to: '/account' })
                    return
                  }
                  if (key === 'logout') {
                    clearToken()
                    void navigate({ to: '/login' })
                  }
                },
              }}
            >
              {defaultDom}
            </Dropdown>
          ),
        }}
      >
        <div style={{ padding: 24 }}>{children}</div>
      </ProLayout>
    </div>
  )
}
