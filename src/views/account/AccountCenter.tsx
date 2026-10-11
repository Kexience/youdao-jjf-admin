import { GridContent, PageContainer } from '@ant-design/pro-components'
import { Alert, Card, Col, Menu, Row, Skeleton } from 'antd'
import { useLayoutEffect, useRef, useState } from 'react'

import { useMyProfile } from '../../api/account'
import { ApiError } from '../../lib/request'
import { AccountBaseForm } from './AccountBaseForm'
import { AccountProfileCard } from './AccountProfileCard'
import { AccountSecurity } from './AccountSecurity'

type AccountTabKey = 'base' | 'security'

const TAB_TITLES: Record<AccountTabKey, string> = {
  base: '基本设置',
  security: '安全设置',
}

/**
 * 个人中心（对照 ant-design-pro account/center + account/settings）：
 * - 左列：画像卡（avatarHolder + detail，对应 center 左侧）；
 * - 右列：设置卡（左侧 Menu + 右侧基本设置/安全设置，对应 settings）。
 * center 的文章/应用/项目三 tab 为脚手架 mock 数据，后端无对应接口，不照搬；
 * settings 的账号绑定/消息通知同样无接口，只保留有真实接口的基本设置与安全设置。
 */
export function AccountCenter() {
  const [tabKey, setTabKey] = useState<AccountTabKey>('base')
  const [menuMode, setMenuMode] = useState<'inline' | 'horizontal'>('inline')
  const containerRef = useRef<HTMLDivElement>(null)

  const profileQuery = useMyProfile()

  // 窄屏时左侧菜单转横排（照搬 Pro settings 的 resize 逻辑）
  useLayoutEffect(() => {
    const resize = () => {
      requestAnimationFrame(() => {
        const el = containerRef.current
        if (!el) return
        const { offsetWidth } = el
        let mode: 'inline' | 'horizontal' = 'inline'
        if (el.offsetWidth < 641 && offsetWidth > 400) mode = 'horizontal'
        if (window.innerWidth < 768 && offsetWidth > 400) mode = 'horizontal'
        setMenuMode(mode)
      })
    }
    const handler = () => resize()
    window.addEventListener('resize', handler)
    handler()
    return () => window.removeEventListener('resize', handler)
  }, [])

  const profile = profileQuery.data

  return (
    <PageContainer
      header={{
        title: '个人中心',
        subTitle: '我的资料与账户安全，基本信息修改后实时生效。',
      }}
    >
      <GridContent>
        <Row gutter={24}>
          <Col lg={7} md={24}>
            <AccountProfileCard profile={profile} loading={profileQuery.isPending} />
          </Col>
          <Col lg={17} md={24}>
            <Card bordered={false}>
              {profileQuery.isPending && <Skeleton active paragraph={{ rows: 6 }} />}
              {profileQuery.isError && (
                <Alert
                  type="error"
                  showIcon
                  message={
                    profileQuery.error instanceof ApiError
                      ? profileQuery.error.message
                      : '个人信息加载失败，请重试'
                  }
                />
              )}
              {profile && (
                <div
                  ref={(node) => {
                    containerRef.current = node
                  }}
                  style={{ display: menuMode === 'inline' ? 'flex' : 'block', gap: 24 }}
                >
                  <div style={menuMode === 'inline' ? { width: 180, flexShrink: 0 } : undefined}>
                    <Menu
                      mode={menuMode}
                      selectedKeys={[tabKey]}
                      onClick={({ key }) => setTabKey(key as AccountTabKey)}
                      items={(Object.keys(TAB_TITLES) as AccountTabKey[]).map((key) => ({
                        key,
                        label: TAB_TITLES[key],
                      }))}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ marginBottom: 16, fontSize: 16, fontWeight: 500 }}>
                      {TAB_TITLES[tabKey]}
                    </div>
                    {tabKey === 'base' ? (
                      <AccountBaseForm
                        key={`${profile.id}-${profile.updatedAt}`}
                        profile={profile}
                        onSaved={() => void profileQuery.refetch()}
                      />
                    ) : (
                      <AccountSecurity profile={profile} onGotoBase={() => setTabKey('base')} />
                    )}
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </GridContent>
    </PageContainer>
  )
}
