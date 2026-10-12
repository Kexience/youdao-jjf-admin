import type { ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { App } from 'antd'

import {
  useCreateMemberLevel,
  useGetMemberLevels,
  useUpdateMemberLevel,
} from '../../api/memberLevels'
import { ApiError } from '../../lib/request'
import { MEMBER_LEVEL_COLUMNS } from './columns'
import { MemberLevelEditModal } from './MemberLevelEditModal'
import { MemberLevelModal } from './MemberLevelModal'

/**
 * 会员等级管理页：GET 列表 / POST 新增 / PUT 编辑 /admin/member/levels。
 * 等级为低频基础数据（含停用与会员计数），列表不分页，新增 / 编辑走弹窗，
 * 列定义见 ./columns，表单字段见 ./MemberLevelFormFields。
 */
export function MemberLevels() {
  const { message } = App.useApp()

  const levelsQuery = useGetMemberLevels()

  const createMutation = useCreateMemberLevel({
    onSuccess: () => {
      message.success('会员等级新建成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const updateMutation = useUpdateMemberLevel({
    onSuccess: () => {
      message.success('会员等级更新成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const columns: ProColumns<MemberLevel>[] = [
    ...MEMBER_LEVEL_COLUMNS,
    {
      title: '操作',
      key: 'action',
      width: 100,
      valueType: 'option',
      render: (_, record) => [
        <MemberLevelEditModal
          key="edit"
          level={record}
          saving={updateMutation.isPending}
          onSubmit={(params) => updateMutation.mutateAsync({ id: record.id, params })}
        />,
      ],
    },
  ]

  return (
    <PageContainer
      header={{
        title: '会员等级',
        subTitle:
          '档位序位升序即等级高低；消费折扣 100=不打折。支持新增 / 编辑（含停用）。',
      }}
    >
      <ProTable<MemberLevel>
        rowKey="id"
        columns={columns}
        dataSource={levelsQuery.data ?? []}
        loading={levelsQuery.isLoading}
        pagination={false}
        search={false}
        dateFormatter={false}
        scroll={{ x: 'max-content' }}
        headerTitle="等级列表"
        options={{
          reload: () => void levelsQuery.refetch(),
          density: true,
        }}
        toolBarRender={() => [
          <MemberLevelModal
            key="new"
            saving={createMutation.isPending}
            onSubmit={createMutation.mutateAsync}
          />,
        ]}
        locale={{ emptyText: levelsQuery.isError ? '加载失败，请重试' : '暂无等级数据' }}
      />
    </PageContainer>
  )
}
