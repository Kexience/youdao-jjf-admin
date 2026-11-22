import { ProTable } from '@ant-design/pro-components'
import {
  Alert,
  App,
  Button,
  Col,
  Descriptions,
  Drawer,
  Row,
  Space,
  Statistic,
} from 'antd'

import { useGetStoreDepositRecords, useRegisterStoreDeposit } from '../../api/shopDeposits'
import { useGetStoreDepositBalance } from '../../api/shopAudits'
import { ApiError } from '../../lib/request'
import { renderAmount, renderShopApplyStatus, renderStoreType } from '../shopAudits/columns'
import { DepositRegisterModal } from './DepositRegisterModal'
import { STORE_DEPOSIT_COLUMNS } from './depositColumns'

interface DepositAccountDrawerProps {
  /** 账户主体：门店申请单（applyId 即保证金账户 id） */
  application?: StoreApplyVo
  open: boolean
  onClose: () => void
}

/**
 * 保证金账户抽屉：按门店申请单展示余额 / 缴纳累计 / 待缴 + 台账流水，
 * 并支持登记缴纳 / 退还 / 扣减（POST /admin/shop/deposits/apply/{applyId}/records）。
 *
 * 取数：
 * - GET /admin/shop/deposits/apply/{applyId}/balance 当前余额与缴纳累计；
 * - GET /admin/shop/deposits/apply/{applyId}/records 全量流水（不分页，页面内分页）。
 * 仅在抽屉打开时请求，避免列表每行都打接口。
 */
export function DepositAccountDrawer({
  application,
  open,
  onClose,
}: DepositAccountDrawerProps) {
  const { message } = App.useApp()
  const applyId = application?.id

  const balanceQuery = useGetStoreDepositBalance(applyId, { enabled: open })
  const recordsQuery = useGetStoreDepositRecords(applyId, { enabled: open })

  const registerMutation = useRegisterStoreDeposit({
    onSuccess: () => {
      message.success('保证金登记成功')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保证金登记失败，请重试')
    },
  })

  const depositAmount = application?.depositAmount
  const balance = balanceQuery.data?.balance
  const paid = balanceQuery.data?.paid
  const pending =
    typeof depositAmount === 'number' && typeof balance === 'number'
      ? Math.max(depositAmount - balance, 0)
      : undefined
  const unsettled = typeof pending === 'number' && pending > 0

  const balanceErrorText =
    (balanceQuery.error instanceof ApiError && balanceQuery.error.message) ||
    '保证金余额加载失败，请点击刷新重试'
  const recordsErrorText =
    (recordsQuery.error instanceof ApiError && recordsQuery.error.message) ||
    '保证金流水加载失败，请点击刷新重试'

  const refreshing = balanceQuery.isFetching || recordsQuery.isFetching
  const refreshAll = () => {
    void balanceQuery.refetch()
    void recordsQuery.refetch()
  }

  const emptyText =
    recordsQuery.isLoading
      ? '加载中…'
      : recordsQuery.isError
        ? '保证金流水加载失败，请点击刷新重试'
        : '暂无保证金流水'

  const title = application
    ? `保证金账户 · ${application.storeName || `申请单 #${application.id}`}`
    : '保证金账户'

  return (
    <Drawer
      title={title}
      open={open}
      onClose={onClose}
      size={960}
      destroyOnHidden
      extra={
        <Space>
          <Button onClick={refreshAll} loading={refreshing}>
            刷新
          </Button>
          {application ? (
            <DepositRegisterModal
              application={application}
              balance={balance}
              saving={registerMutation.isPending}
              onSubmit={(params) =>
                registerMutation.mutateAsync({ applyId: application.id, params })
              }
            />
          ) : null}
        </Space>
      }
    >
      {application ? (
        <>
          <Descriptions
            size="small"
            column={2}
            style={{ marginBottom: 16 }}
            items={[
              {
                key: 'status',
                label: '申请状态',
                children: renderShopApplyStatus(application.status),
              },
              {
                key: 'storeType',
                label: '门店类型',
                children: renderStoreType(application.storeType),
              },
              {
                key: 'shopId',
                label: '所属店铺',
                children: application.shopId ? `店铺 #${application.shopId}` : '-',
              },
              {
                key: 'storeId',
                label: '已开通门店',
                children: application.storeId ? `门店 #${application.storeId}` : '未开通',
              },
              {
                key: 'applicant',
                label: '申请人',
                children: application.applicantId ? `会员 #${application.applicantId}` : '-',
              },
              {
                key: 'contactPhone',
                label: '联系电话',
                children: application.contactPhone || '-',
              },
              {
                key: 'address',
                label: '门店地址',
                span: 2,
                children:
                  [application.regionName, application.addressDetail]
                    .filter(Boolean)
                    .join(' ') || '-',
              },
              {
                key: 'depositAmount',
                label: '应缴保证金',
                children: renderAmount(application.depositAmount),
              },
              {
                key: 'createdAt',
                label: '提交时间',
                children: application.createdAt || '-',
              },
            ]}
          />

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Statistic
                title="应缴保证金"
                value={depositAmount ?? 0}
                precision={2}
                prefix="¥"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="当前余额"
                value={balance ?? 0}
                precision={2}
                prefix="¥"
                loading={balanceQuery.isLoading}
                valueStyle={unsettled ? { color: 'var(--ant-color-error)' } : undefined}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="缴纳累计"
                value={paid ?? 0}
                precision={2}
                prefix="¥"
                loading={balanceQuery.isLoading}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="待缴金额"
                value={pending ?? 0}
                precision={2}
                prefix="¥"
                loading={balanceQuery.isLoading}
              />
            </Col>
          </Row>

          {balanceQuery.isError ? (
            <Alert
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              message="保证金余额加载失败"
              description={balanceErrorText}
            />
          ) : null}
          {unsettled ? (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              message={`保证金未缴清，还需缴纳 ¥${(pending ?? 0).toFixed(2)}`}
              description="未缴清时门店申请无法终审通过（后端校验）；请先登记缴纳后再回到终审工作台。"
            />
          ) : null}
          {recordsQuery.isError ? (
            <Alert
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
              message="保证金流水加载失败"
              description={recordsErrorText}
            />
          ) : null}

          <ProTable<StoreDepositVo>
            rowKey="id"
            columns={STORE_DEPOSIT_COLUMNS}
            dataSource={recordsQuery.data ?? []}
            loading={recordsQuery.isFetching}
            search={false}
            dateFormatter={false}
            options={false}
            headerTitle={`保证金流水（${recordsQuery.data?.length ?? 0}）`}
            scroll={{ x: 'max-content' }}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: false,
              showTotal: (total) => `共 ${total} 条`,
            }}
            locale={{ emptyText }}
          />
        </>
      ) : null}
    </Drawer>
  )
}
