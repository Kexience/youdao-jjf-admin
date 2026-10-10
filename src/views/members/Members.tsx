import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { useNavigate } from '@tanstack/react-router'
import { App, Button, Popconfirm } from 'antd'
import { useRef } from 'react'

import { useGetMemberLevels } from '../../api/memberLevels'
import { useUpdateMemberStatus } from '../../api/members'
import { fetchMembers } from '../../api/members'
import { ApiError } from '../../lib/request'
import { getMemberColumns } from './columns'

/**
 * 会员管理页：GET 分页检索 / GET 详情 / PUT 禁用解禁 /admin/members。
 * 服务端分页 + 条件检索走 ProTable request，参数以文档为准：
 * keyword（mobile 精确、username/nickname 模糊）/ status（1正常 0禁用）
 * / levelId / registerStart~registerEnd（注册时间区间）。
 */
export function Members() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const actionRef = useRef<ActionType>(null)

  // 等级筛选项来自等级列表
  const levelsQuery = useGetMemberLevels()

  const statusMutation = useUpdateMemberStatus({
    onSuccess: (_, vars) => {
      message.success(vars.status === 1 ? '会员已解禁' : '会员已禁用')
      actionRef.current?.reload()
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '操作失败，请重试')
    },
  })

  const columns: ProColumns<MemberAdmin>[] = [
    ...getMemberColumns(levelsQuery.data ?? []),
    {
      title: '操作',
      key: 'action',
      width: 160,
      valueType: 'option',
      render: (_, record) => {
        const banned = record.status === 0
        return [
          <Button
            key="detail"
            type="link"
            size="small"
            onClick={() =>
              void navigate({
                to: '/members/$memberId',
                params: { memberId: String(record.id) },
              })
            }
          >
            详情
          </Button>,
          <Popconfirm
            key="status"
            title={banned ? '确认解禁该会员吗？' : '确认禁用该会员吗？'}
            description={banned ? undefined : '禁用后该会员将被踢下线。'}
            onConfirm={() =>
              statusMutation.mutate({ id: record.id, status: banned ? 1 : 0 })
            }
            okButtonProps={{ loading: statusMutation.isPending }}
          >
            <Button type="link" size="small" danger={!banned}>
              {banned ? '解禁' : '禁用'}
            </Button>
          </Popconfirm>,
        ]
      },
    },
  ]

  return (
    <PageContainer
      header={{
        title: '会员管理',
        subTitle: '按关键词 / 状态 / 等级 / 注册时间检索，支持查看详情与禁用 / 解禁。',
      }}
    >
      <ProTable<MemberAdmin>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          try {
            const [registerStart, registerEnd] =
              (params.registerAtRange as [string, string] | undefined) ?? []
            // status 0 为 falsy，不能用 || 过滤；ProTable select 回传可能是字符串，需转数字
            const rawStatus = params.status as string | number | undefined
            const status =
              rawStatus === undefined || rawStatus === ''
                ? undefined
                : (Number(rawStatus) as 0 | 1)
            const rawLevelId = params.levelId as string | number | undefined
            const levelId =
              rawLevelId === undefined || rawLevelId === '' ? undefined : Number(rawLevelId)
            const data = await fetchMembers({
              page: params.current ?? 1,
              size: params.pageSize ?? 10,
              keyword: (params.keyword as string | undefined)?.trim() || undefined,
              status,
              levelId,
              registerStart,
              registerEnd,
            })
            return { data: data.records, total: data.total, success: true }
          } catch (error) {
            return {
              data: [],
              total: 0,
              success: false,
              errorMessage: error instanceof ApiError ? error.message : '加载失败，请重试',
            }
          }
        }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        dateFormatter={false}
        scroll={{ x: 'max-content' }}
        options={{ density: true }}
      />
    </PageContainer>
  )
}
