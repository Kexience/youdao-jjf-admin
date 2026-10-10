import type { ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { useNavigate } from '@tanstack/react-router'
import { App, Button } from 'antd'

import { useCreateRole, useGetRoles } from '../../api/roles'
import { ApiError } from '../../lib/request'
import { ROLE_COLUMNS } from './columns'
import { RoleModal } from './RoleModal'

/**
 * 后台角色页：GET 列表 / POST 新增 / GET 详情 /admin/roles。
 * 字段以线上文档 AdminRoleVo / AdminRoleSaveRequest / AdminRoleDetailVo 为准，
 * 列定义见 ./columns，新建弹窗见 ./RoleModal，表单字段见 ./RoleFormFields，
 * 详情页见 ./RoleDetail。
 */
export function Roles() {
  const { message } = App.useApp()
  const navigate = useNavigate()

  const rolesQuery = useGetRoles()

  const createMutation = useCreateRole({
    onSuccess: () => {
      message.success('角色新建成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const columns: ProColumns<AdminRole>[] = [
    ...ROLE_COLUMNS,
    {
      title: '操作',
      key: 'action',
      width: 120,
      valueType: 'option',
      render: (_, record) => [
        <Button
          key="detail"
          type="link"
          size="small"
          onClick={() =>
            void navigate({
              to: '/roles/$roleId',
              params: { roleId: String(record.id) },
            })
          }
        >
          详情
        </Button>,
      ],
    },
  ]

  return (
    <PageContainer
      header={{
        title: '后台角色',
        subTitle: '含内置与停用角色，支持新增。',
      }}
    >
      <ProTable<AdminRole>
        rowKey="id"
        columns={columns}
        dataSource={rolesQuery.data ?? []}
        loading={rolesQuery.isLoading}
        pagination={false}
        search={false}
        dateFormatter={false}
        scroll={{ x: 'max-content' }}
        headerTitle="角色列表"
        options={{
          reload: () => void rolesQuery.refetch(),
          density: true,
        }}
        toolBarRender={() => [
          <RoleModal key="new" saving={createMutation.isPending} onSubmit={createMutation.mutateAsync} />,
        ]}
        locale={{ emptyText: rolesQuery.isError ? '加载失败，请重试' : '暂无角色数据' }}
      />
    </PageContainer>
  )
}
