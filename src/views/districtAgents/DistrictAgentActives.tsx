import type { ActionType, ProColumns } from '@ant-design/pro-components'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { Link } from '@tanstack/react-router'
import { App, Button, Card, Popconfirm, Space, Tag, Typography } from 'antd'
import { useRef, useState } from 'react'

import { fetchDistrictAgentActives, useRevokeDistrictAgent } from '../../api/districtAgents'
import { RegionDistrictCascader } from '../../components/RegionDistrictCascader'
import { ApiError } from '../../lib/request'
import { DISTRICT_AGENT_ACTIVES_COLUMNS } from './columns'

/** 一个行政区划筛选条件：id 用于查询，path（国标码路径）用于级联回显 */
interface RegionFilter {
  /** sys_region.id，作为接口的 cityId / regionId */
  id: number
  /** 国标码路径，如 ['440000','440100'] */
  path: string[]
}

/**
 * 全部在任区代列表页（/agent/district/actives）：
 * - 列表：GET /admin/agent/district/actives（page/pageSize 分页）
 * - 筛选：cityId（城市筛选节点 id）与 regionId（区/县 id），可选、不过滤不传；
 *   两者语义重叠（区县必属于某市），因此做成二选一：选城市清区域、选区域清城市。
 * - 撤销：POST /admin/agent/district/{agentId}/revoke
 *
 * 行内可跳单区在任查询页（带 regionId/regionCode 回显）与会员详情。
 */
export function DistrictAgentActives() {
  const { message } = App.useApp()
  const actionRef = useRef<ActionType>(null)

  const [city, setCity] = useState<RegionFilter | undefined>()
  const [district, setDistrict] = useState<RegionFilter | undefined>()

  /** 筛选变化后从第一页重新查询 */
  const reloadFromFirstPage = () => {
    void actionRef.current?.reload(true)
  }

  const revokeMutation = useRevokeDistrictAgent({
    onSuccess: () => {
      message.success('已撤销该区代')
      reloadFromFirstPage()
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '撤销失败，请重试')
    },
  })

  /** 选中城市（地市为叶子）：清掉区域筛选，避免两个条件互相冲突 */
  const handleCityChange = (node: RegionChild | undefined, path: string[]) => {
    setDistrict(undefined)
    if (!node) {
      setCity(undefined)
      reloadFromFirstPage()
      return
    }
    if (!node.id) {
      message.error('该区域未返回 region id，请确认后端已部署最新行政区划接口')
      return
    }
    setCity({ id: node.id, path })
    reloadFromFirstPage()
  }

  /** 选中区/县：清掉城市筛选（城市可由所选区县的上级推得，接口按更细条件过滤即可） */
  const handleDistrictChange = (node: RegionChild | undefined, path: string[]) => {
    setCity(undefined)
    if (!node) {
      setDistrict(undefined)
      reloadFromFirstPage()
      return
    }
    if (!node.id) {
      message.error('该区域未返回 region id，请确认后端已部署最新行政区划接口')
      return
    }
    setDistrict({ id: node.id, path })
    reloadFromFirstPage()
  }

  const handleReset = () => {
    setCity(undefined)
    setDistrict(undefined)
    reloadFromFirstPage()
  }

  const columns: ProColumns<DistrictAgent>[] = [
    ...DISTRICT_AGENT_ACTIVES_COLUMNS,
    {
      title: '操作',
      key: 'action',
      valueType: 'option',
      width: 200,
      fixed: 'right',
      render: (_, record) => [
        // 跳到单区在任查询页核对该区详情（材料、上任时间、撤销入口）
        record.regionId ? (
          <Link
            key="detail"
            to="/agent/district/active"
            search={{
              regionId: record.regionId,
              regionCode: record.region?.code,
            }}
          >
            <Button type="link" size="small">
              该区在任
            </Button>
          </Link>
        ) : null,
        <Popconfirm
          key="revoke"
          title="撤销该区代？"
          description="撤销后该区域将回到无区代状态，操作不可恢复。"
          okText="确认撤销"
          okButtonProps={{ danger: true, loading: revokeMutation.isPending }}
          onConfirm={() => revokeMutation.mutateAsync(record.id)}
        >
          <Button type="link" size="small" danger>
            撤销
          </Button>
        </Popconfirm>,
      ],
    },
  ]

  return (
    <PageContainer
      header={{
        title: '全部在任区代',
        subTitle: '分页查看平台在任区代，可按城市 / 区县筛选，支持撤销与跳转核对。',
        extra: [
          <Link key="pendings" to="/agent/district/pendings">
            <Button>待审区代</Button>
          </Link>,
          <Link key="active" to="/agent/district/active">
            <Button>单区在任查询</Button>
          </Link>,
        ],
      }}
    >
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <RegionDistrictCascader
            leafLevel={2}
            value={city?.path}
            onChange={handleCityChange}
            style={{ width: 220 }}
          />
          <RegionDistrictCascader
            value={district?.path}
            onChange={handleDistrictChange}
            style={{ width: 260 }}
            placeholder="选择省 / 市 / 区县（区代所属区域）"
          />
          <Button onClick={handleReset} disabled={!city && !district}>
            重置
          </Button>
          {city && <Tag color="blue">城市节点 id：{city.id}</Tag>}
          {district && <Tag color="green">区域 id：{district.id}</Tag>}
          <Typography.Text type="secondary">
            城市与区县筛选二选一，不筛选时为全部在任区代
          </Typography.Text>
        </Space>
      </Card>

      <ProTable<DistrictAgent>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        headerTitle="在任列表"
        search={false}
        dateFormatter={false}
        scroll={{ x: 'max-content' }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
        }}
        options={{ density: true }}
        request={async (params) => {
          try {
            const data = await fetchDistrictAgentActives({
              page: params.current ?? 1,
              pageSize: params.pageSize ?? 10,
              cityId: city?.id,
              regionId: district?.id,
            })
            return { data: data.records, total: data.total, success: true }
          } catch (error) {
            return {
              data: [],
              total: 0,
              success: false,
              errorMessage:
                error instanceof ApiError ? error.message : '在任区代加载失败，请重试',
            }
          }
        }}
      />
    </PageContainer>
  )
}
