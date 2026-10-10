import type { ProColumns } from '@ant-design/pro-components'

/**
 * 上传记录列表列定义（展示用，与 StorageUploadRecordVo 字段对齐）。
 * zone 来自 Zone 列表（函数形式，调用方传入已加载数据）。
 */
export function getStorageRecordColumns(zones: StorageZone[]): ProColumns<StorageUploadRecord>[] {
  return [
    {
      title: 'Zone',
      dataIndex: 'zone',
      valueType: 'select',
      valueEnum: Object.fromEntries(zones.map((z) => [z.prefix, { text: z.prefix }])),
      ellipsis: true,
    },
    {
      title: '原始文件名',
      dataIndex: 'originalName',
      ellipsis: true,
      search: false,
      render: (_, record) => record.originalName || '-',
    },
    {
      title: '文件 SHA-256',
      dataIndex: 'hash',
      ellipsis: true,
    },
    {
      title: '实际大小',
      dataIndex: 'sizeActual',
      search: false,
      render: (_, record) => record.sizeActual ?? '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      ellipsis: true,
    },
    {
      title: '失败原因',
      dataIndex: 'failReason',
      ellipsis: true,
      search: false,
      render: (_, record) => record.failReason || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '上传人类型',
      dataIndex: 'uploaderType',
      hideInTable: true,
    },
    {
      title: '上传人 id',
      dataIndex: 'uploaderId',
      hideInTable: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAtRange',
      valueType: 'dateRange',
      hideInTable: true,
    },
  ]
}
