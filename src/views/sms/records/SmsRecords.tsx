import { PageContainer, ProTable } from '@ant-design/pro-components'

import { fetchSmsRecords } from '../../../api/smsRecords'
import { ApiError } from '../../../lib/request'
import { SMS_RECORD_COLUMNS } from './columns'

/**
 * 短信发送记录页：GET 分页查询 /admin/sms/records（只读）。
 * 服务端分页 + 条件检索走 ProTable request，参数以文档为准：
 * mobile（精确）/ scene / status / start~end（创建时间区间）。
 */
export function SmsRecords() {
  return (
    <PageContainer
      header={{
        title: '短信发送记录',
        subTitle: '按手机号 / 场景 / 状态 / 时间区间检索（只读）。',
      }}
    >
      <ProTable<SmsSendRecord>
        rowKey="id"
        columns={SMS_RECORD_COLUMNS}
        request={async (params) => {
          try {
            const [start, end] = (params.createdAtRange as [string, string] | undefined) ?? []
            const data = await fetchSmsRecords({
              page: params.current ?? 1,
              size: params.pageSize ?? 10,
              mobile: (params.mobile as string | undefined)?.trim() || undefined,
              scene: (params.scene as string | undefined)?.trim() || undefined,
              status: params.status as string | undefined,
              start,
              end,
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
        headerTitle="发送记录"
        options={{ density: true }}
        locale={{ emptyText: '暂无发送记录' }}
      />
    </PageContainer>
  )
}
