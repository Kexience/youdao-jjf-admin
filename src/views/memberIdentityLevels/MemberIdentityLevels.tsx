import type { ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { App } from 'antd'

import {
  useCreateMemberIdentityLevel,
  useGetMemberIdentityLevels,
  useUpdateMemberIdentityLevel,
} from '../../api/memberIdentityLevels'
import { ApiError } from '../../lib/request'
import { MEMBER_IDENTITY_LEVEL_COLUMNS } from './columns'
import { MemberIdentityLevelEditModal } from './MemberIdentityLevelEditModal'
import { MemberIdentityLevelModal } from './MemberIdentityLevelModal'

/**
 * 会员身份档位管理页：GET 列表 / POST 新增 / PUT 编辑 /admin/member/identity-levels。
 * 档位为低频基础数据（含停用与会员计数），列表不分页，新增 / 编辑走弹窗，
 * 列定义见 ./columns，表单字段见 ./MemberIdentityLevelFormFields。
 */
export function MemberIdentityLevels() {
  const { message } = App.useApp()

  const levelsQuery = useGetMemberIdentityLevels()

  const createMutation = useCreateMemberIdentityLevel({
    onSuccess: () => {
      message.success('身份档位新建成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const updateMutation = useUpdateMemberIdentityLevel({
    onSuccess: () => {
      message.success('身份档位更新成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  /** 方式2「直推达标」锚点档位候选：仅启用且有档位代码的行 */
  const levelOptions = (levelsQuery.data ?? []).flatMap((l) =>
    l.status === 1 && l.levelCode
      ? [{ value: l.levelCode, label: l.levelName || l.levelCode }]
      : [],
  )

  const columns: ProColumns<MemberIdentityLevel>[] = [
    ...MEMBER_IDENTITY_LEVEL_COLUMNS,
    {
      title: '操作',
      key: 'action',
      width: 100,
      valueType: 'option',
      render: (_, record) => [
        <MemberIdentityLevelEditModal
          key="edit"
          level={record}
          saving={updateMutation.isPending}
          levelOptions={levelOptions}
          onSubmit={(params) => updateMutation.mutateAsync({ id: record.id, params })}
        />,
      ],
    },
  ]

  return (
    <PageContainer
      header={{
        title: '会员身份档位',
        subTitle:
          '档位序位升序即档位高低；消费折扣 100=不打折。支持新增 / 编辑（含停用）。',
      }}
    >
      <ProTable<MemberIdentityLevel>
        rowKey="id"
        columns={columns}
        dataSource={levelsQuery.data ?? []}
        loading={levelsQuery.isLoading}
        pagination={false}
        search={false}
        dateFormatter={false}
        scroll={{ x: 'max-content' }}
        headerTitle="身份档位列表"
        options={{
          reload: () => void levelsQuery.refetch(),
          density: true,
        }}
        toolBarRender={() => [
          <MemberIdentityLevelModal
            key="new"
            saving={createMutation.isPending}
            levelOptions={levelOptions}
            onSubmit={createMutation.mutateAsync}
          />,
        ]}
        locale={{ emptyText: levelsQuery.isError ? '加载失败，请重试' : '暂无身份档位数据' }}
      />
    </PageContainer>
  )
}
