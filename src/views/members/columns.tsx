import type { ProColumns } from '@ant-design/pro-components'

/** 会员状态枚举（展示与检索共用，见文档 MemberAdminVo.status：1正常 0禁用） */
export const MEMBER_STATUS_ENUM = {
  1: { text: '正常', status: 'Success' },
  0: { text: '禁用', status: 'Error' },
} as const

/** 性别文案（见文档 MemberAdminVo.sex：0未知 1男 2女） */
export const MEMBER_SEX_TEXT: Record<number, string> = {
  0: '未知',
  1: '男',
  2: '女',
}

/** 等级列表 → ProTable 筛选项 valueEnum（key 为等级 id） */
export function toMemberLevelValueEnum(levels: MemberLevel[]): Record<number, { text: string }> {
  return Object.fromEntries(levels.map((level) => [level.id, { text: level.levelName ?? '-' }]))
}

/** 会员列表列定义（展示用，与 MemberAdminVo 字段对齐） */
export function getMemberColumns(levels: MemberLevel[]): ProColumns<MemberAdmin>[] {
  return [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 90,
      search: false,
      hidden: true,
    },
    {
      title: '关键词',
      dataIndex: 'keyword',
      hideInTable: true,
      tooltip: '手机号精确匹配，用户名 / 昵称模糊匹配',
      fieldProps: { placeholder: '手机号 / 用户名 / 昵称' },
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      ellipsis: true,
      search: false,
      render: (_, record) => record.mobile || '-',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      ellipsis: true,
      search: false,
      render: (_, record) => record.username || '-',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      ellipsis: true,
      search: false,
      render: (_, record) => record.nickname || '-',
    },
    {
      title: '等级',
      dataIndex: 'levelId',
      ellipsis: true,
      valueType: 'select',
      valueEnum: toMemberLevelValueEnum(levels),
      render: (_, record) => record.levelName || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: MEMBER_STATUS_ENUM,
    },
    {
      title: '成长值',
      dataIndex: 'growth',
      width: 110,
      search: false,
      render: (_, record) => record.growth ?? '-',
    },
    {
      title: '注册时间',
      dataIndex: 'registerAt',
      width: 180,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '注册时间',
      dataIndex: 'registerAtRange',
      valueType: 'dateRange',
      hideInTable: true,
    },
    {
      title: '最后登录时间',
      dataIndex: 'lastLoginAt',
      width: 180,
      valueType: 'dateTime',
      search: false,
      render: (_, record) => record.lastLoginAt || '-',
    },
  ]
}
