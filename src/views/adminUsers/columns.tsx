import type { ProColumns } from '@ant-design/pro-components'
import { Tag } from 'antd'

/** 管理员状态枚举（展示与检索共用，见文档 AdminUserVo.status：1正常 0禁用） */
export const ADMIN_USER_STATUS_ENUM = {
  1: { text: '正常', status: 'Success' },
  0: { text: '禁用', status: 'Error' },
} as const

/** 角色列表 → ProTable 筛选项 valueEnum（key 为角色 id） */
export function toAdminRoleValueEnum(roles: AdminRole[]): Record<number, { text: string }> {
  return Object.fromEntries(roles.map((role) => [role.id, { text: role.roleName }]))
}

/** 管理员列表列定义（展示用，与 AdminUserVo 字段对齐） */
export function getAdminUserColumns(roles: AdminRole[]): ProColumns<AdminUser>[] {
  return [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 90,
      search: false,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      ellipsis: true,
      fieldProps: { placeholder: '用户名模糊搜索' },
    },
    {
      title: '真实姓名',
      dataIndex: 'realname',
      ellipsis: true,
      fieldProps: { placeholder: '真实姓名模糊搜索' },
      render: (_, record) => record.realname || '-',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      ellipsis: true,
      search: false,
      render: (_, record) => record.nickname || '-',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      ellipsis: true,
      search: false,
      render: (_, record) => record.phone || '-',
    },
    {
      title: '所属角色',
      dataIndex: 'roleId',
      ellipsis: true,
      valueType: 'select',
      valueEnum: toAdminRoleValueEnum(roles),
      render: (_, record) => record.roleName || '-',
    },
    {
      title: '只看无角色',
      dataIndex: 'unassignedOnly',
      hideInTable: true,
      valueType: 'select',
      valueEnum: {
        true: { text: '是' },
      },
      fieldProps: { placeholder: '是否只看无角色', allowClear: true },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: ADMIN_USER_STATUS_ENUM,
      render: (_, record) =>
        record.status === undefined ? (
          '-'
        ) : record.status === 1 ? (
          <Tag color="success">正常</Tag>
        ) : (
          <Tag color="error">禁用</Tag>
        ),
    },
    {
      title: '最近登录时间',
      dataIndex: 'lastLoginAt',
      width: 180,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      valueType: 'dateTime',
      search: false,
    },
  ]
}
