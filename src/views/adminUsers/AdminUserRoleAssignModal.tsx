import { ModalForm, ProFormSelect } from '@ant-design/pro-components'
import { useQueryClient } from '@tanstack/react-query'
import { App, Form } from 'antd'
import { useState } from 'react'
import type { ReactElement, RefObject } from 'react'
import type { ActionType } from '@ant-design/pro-components'

import { useUpdateAdminUserRole } from '../../api/adminUsers'
import { useGetRoles } from '../../api/roles'
import { ApiError } from '../../lib/request'

interface Props {
  user: AdminUser
  /** 列表页传 ProTable 的 actionRef，保存后刷新表格；详情页不传，走 query 失效自动 refetch */
  actionRef?: RefObject<ActionType | null>
  /** 触发按钮由调用方传入（列表列内用 link 按钮，详情页头用默认按钮） */
  trigger: ReactElement
}

/** 分配/清空角色弹窗：内部调 PUT /admin/users/{id}/role，留空提交 = 清空角色；角色列表打开时才拉取 */
export function AdminUserRoleAssignModal({ user, actionRef, trigger }: Props) {
  const { message } = App.useApp()
  const queryClient = useQueryClient()
  const [form] = Form.useForm<{ roleId?: number }>()
  const [open, setOpen] = useState(false)
  const rolesQuery = useGetRoles({ enabled: open })

  const roleMutation = useUpdateAdminUserRole({
    onSuccess: () => {
      message.success('角色已更新')
      void queryClient.invalidateQueries({ queryKey: ['admin-user-detail', user.id] })
      actionRef?.current?.reload()
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '操作失败，请重试')
    },
  })

  return (
    <ModalForm<{ roleId?: number }>
      name={`admin-user-role-${user.id}`}
      title={`分配角色（${user.username}）`}
      trigger={trigger}
      form={form}
      modalProps={{ destroyOnHidden: true }}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) form.setFieldsValue({ roleId: user.roleId ?? undefined })
      }}
      layout="vertical"
      submitter={{
        searchConfig: { submitText: '保存', resetText: '取消' },
        submitButtonProps: { loading: roleMutation.isPending },
      }}
      onFinish={async (values) => {
        await roleMutation.mutateAsync({ id: user.id, params: { roleId: values.roleId ?? null } })
        return true
      }}
    >
      <ProFormSelect
        width="md"
        name="roleId"
        label="角色"
        placeholder="选择角色（留空提交则清空角色）"
        allowClear
        fieldProps={{ loading: rolesQuery.isPending }}
        options={(rolesQuery.data ?? []).map((role) => ({ label: role.roleName, value: role.id }))}
      />
    </ModalForm>
  )
}
