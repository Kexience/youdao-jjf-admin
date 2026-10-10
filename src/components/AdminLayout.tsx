import {
  HomeOutlined,
  LogoutOutlined,
  MailOutlined,
  MessageOutlined,
  MoonOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  SettingOutlined,
  SunOutlined,
} from '@ant-design/icons'
import type { MenuDataItem } from '@ant-design/pro-components'
import { ProLayout } from '@ant-design/pro-components'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { Button, Tooltip } from 'antd'
import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { useGetMyMenus } from '../api/menus'
import { useAuthStore } from '../stores/auth'
import { useResolvedTheme, useThemeStore } from '../stores/theme'

/** 本地兜底菜单：与 TanStack 文件路由一一对应，保证点击一定能跳到真实页面 */
const LOCAL_MENUS: MenuDataItem[] = [
  { path: '/', name: '首页', icon: <HomeOutlined /> },
  { path: '/menus', name: '菜单管理', icon: <SettingOutlined /> },
  { path: '/sms/config', name: '短信配置', icon: <SettingOutlined /> },
  { path: '/sms/channels', name: '短信通道', icon: <MessageOutlined /> },
  { path: '/sms/templates', name: '短信模板', icon: <MailOutlined /> },
  { path: '/sms/records', name: '短信发送记录', icon: <SearchOutlined /> },
  { path: '/about', name: '关于', icon: <QuestionCircleOutlined /> },
]

/**
 * 后端菜单树 → ProLayout MenuDataItem。
 * - 按钮类型（A）不进侧边栏，直接丢弃；
 * - 目录（M）无 component 时 path 置空，只做折叠分组；
 * - 同级按 sort 升序排列。
 */
function toMenuItems(nodes: AdminMenuTreeNode[]): MenuDataItem[] {
  return [...nodes]
    .sort((a, b) => a.sort - b.sort)
    .flatMap((node): MenuDataItem[] => {
      if (node.menuType === 'A') return []
      const children = node.children?.length ? toMenuItems(node.children) : undefined
      const path = node.component?.trim() || undefined
      return [
        {
          key: String(node.id),
          name: node.name,
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
 * - 菜单优先用当前管理员可见树（GET /admin/menus/mine），失败/为空时回退本地路由菜单；
 * - 菜单点击走 TanStack Router 的 Link，头部右侧放主题切换与退出登录。
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const resolved = useResolvedTheme()
  const toggleTheme = useThemeStore((s) => s.toggle)
  const clearToken = useAuthStore((s) => s.clearToken)

  const myMenusQuery = useGetMyMenus()

  const menuData = useMemo<MenuDataItem[]>(() => {
    const nodes = myMenusQuery.data?.menus
    if (nodes?.length) {
      const converted = toMenuItems(nodes)
      if (converted.length) return converted
    }
    return LOCAL_MENUS
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
          <Tooltip key="theme" title={resolved === 'dark' ? '切换浅色' : '切换深色'}>
            <Button
              type="text"
              icon={resolved === 'dark' ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
            />
          </Tooltip>,
          <Button
            key="logout"
            type="text"
            icon={<LogoutOutlined />}
            onClick={() => {
              clearToken()
              void navigate({ to: '/login' })
            }}
          >
            退出
          </Button>,
        ]}
      >
        <div style={{ padding: 24 }}>{children}</div>
      </ProLayout>
    </div>
  )
}
