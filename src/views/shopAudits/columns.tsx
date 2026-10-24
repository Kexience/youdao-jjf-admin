import type { ProColumns } from '@ant-design/pro-components'
import { Link } from '@tanstack/react-router'
import { Tag, Typography } from 'antd'

/**
 * 店铺终审工作台列定义（与线上文档 ShopApplyVo / StoreApplyVo 字段对齐）。
 * 文档：https://dev-1.ydndd.com/v3/api-docs
 *
 * 本文件只导出常量 / 纯函数 / 列定义，组件（ApplyImages）在同目录
 * ApplyImages.tsx，避免触发 react-refresh/only-export-components。
 */

/** 申请单状态（见文档 ShopApplyVo.status） */
export const SHOP_APPLY_STATUS_ENUM = {
  pending_agent: { text: '区代初审中', status: 'Processing' },
  pending_admin: { text: '平台审核中', status: 'Warning' },
  rejected_agent: { text: '区代已驳回', status: 'Error' },
  rejected_admin: { text: '已驳回', status: 'Error' },
  approved: { text: '已通过', status: 'Success' },
} as const

/** 申请单状态展示（带颜色 Tag，未知值按原样展示） */
export function renderShopApplyStatus(status?: string) {
  if (!status) return '-'
  const meta = SHOP_APPLY_STATUS_ENUM[status as keyof typeof SHOP_APPLY_STATUS_ENUM]
  return <Tag color={meta?.status ?? 'default'}>{meta?.text ?? status}</Tag>
}

/** 门店类型（见文档 StoreApplyVo.storeType：directsale/franchise） */
export const STORE_TYPE_ENUM = {
  directsale: { text: '直营', color: 'blue' },
  franchise: { text: '加盟', color: 'gold' },
} as const

/** 门店类型展示 */
export function renderStoreType(storeType?: string) {
  if (!storeType) return '-'
  const meta = STORE_TYPE_ENUM[storeType as keyof typeof STORE_TYPE_ENUM]
  return <Tag color={meta?.color ?? 'default'}>{meta?.text ?? storeType}</Tag>
}

/** 金额展示（元，保留两位小数；空值降级为 -） */
export function renderAmount(amount?: number) {
  if (amount === undefined || amount === null) return '-'
  return `¥${amount.toFixed(2)}`
}

/** 申请单里的图片材料（营业执照 / 门头照 / 身份证正反面） */
export interface ApplyImageItem {
  /** 材料名称 */
  label: string
  /** 图片地址 */
  url: string
}

/** 按固定顺序收集申请单中的图片，过滤空值 */
export function shopApplyImages(application: {
  businessLicense?: string
  shopImage?: string
  idCardFront?: string
  idCardBack?: string
}): ApplyImageItem[] {
  const candidates: Array<[string, string | undefined]> = [
    ['营业执照', application.businessLicense],
    ['店铺门头照', application.shopImage],
    ['身份证正面', application.idCardFront],
    ['身份证反面', application.idCardBack],
  ]
  return candidates.flatMap(([label, url]) => (url ? [{ label, url }] : []))
}

/** 按固定顺序收集门店申请单中的图片，过滤空值 */
export function storeApplyImages(application: {
  businessLicense?: string
  storeImage?: string
  idCardFront?: string
  idCardBack?: string
}): ApplyImageItem[] {
  const candidates: Array<[string, string | undefined]> = [
    ['营业执照', application.businessLicense],
    ['门店门头照', application.storeImage],
    ['身份证正面', application.idCardFront],
    ['身份证反面', application.idCardBack],
  ]
  return candidates.flatMap(([label, url]) => (url ? [{ label, url }] : []))
}

/** 图片材料缩略图组件在 ./ApplyImages（本文件保持只导出常量 / 纯函数 / 列定义） */

/**
 * 状态过滤检索项（两类单共用）——交给 ProTable 原生能力，不手写 options / render：
 * - valueEnum：同时生成检索下拉的 options 与单元格展示（按 meta.status 渲染彩色 Badge）；
 * - 检索为多选，search.transform 把选中数组转成后端要的 statuses=pending_admin,rejected_agent；
 * - 默认不选 = 不传 statuses = 查全部非已通过单（pending_admin 与 rejected_agent 同列展示）。
 */
export const SHOP_APPLY_STATUS_COLUMN: ProColumns<ShopApplyVo | StoreApplyVo> = {
  title: '状态',
  dataIndex: 'status',
  valueType: 'select',
  width: 110,
  valueEnum: SHOP_APPLY_STATUS_ENUM,
  fieldProps: {
    mode: 'multiple',
    placeholder: '不选=全部非已通过单',
  },
  search: {
    transform: (value) => ({
      statuses: Array.isArray(value) && value.length > 0 ? value.join(',') : undefined,
    }),
  },
}

/**
 * 店铺申请单列（GET /admin/shop/audits/shop-applications）。
 * 状态列同时作检索项（valueEnum 多选，search.transform 转成 statuses 逗号分隔）；操作列在页面内追加。
 */
export const SHOP_APPLY_COLUMNS: ProColumns<ShopApplyVo>[] = [
  {
    title: '申请单号',
    dataIndex: 'id',
    width: 80,
    search: false,
  },
  {
    title: '店铺名称',
    dataIndex: 'shopName',
    width: 160,
    ellipsis: true,
    search: false,
  },
  {
    title: '申请人',
    dataIndex: 'ownerName',
    width: 140,
    ellipsis: true,
    search: false,
    // 有会员 id 时整块可点，跳会员详情（/members/$memberId）；只有昵称/无信息时原样展示
    render: (_, record) => {
      const dom = record.ownerName || record.ownerMemberId ? (
        <span>
          {record.ownerName || `会员 ${record.ownerMemberId}`}
          {record.ownerName && record.ownerMemberId ? (
            <Typography.Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>
              #{record.ownerMemberId}
            </Typography.Text>
          ) : null}
        </span>
      ) : (
        '-'
      )
      return record.ownerMemberId ? (
        <Link to="/members/$memberId" params={{ memberId: String(record.ownerMemberId) }}>
          {dom}
        </Link>
      ) : (
        dom
      )
    },
  },
  {
    title: '联系电话',
    dataIndex: 'contactPhone',
    width: 130,
    search: false,
  },
  {
    title: '营业地址',
    dataIndex: 'addressDetail',
    width: 220,
    ellipsis: true,
    search: false,
    render: (_, record) =>
      [record.regionName, record.addressDetail].filter(Boolean).join(' ') || '-',
  },
  {
    title: '行业分类',
    dataIndex: 'categoryName',
    width: 110,
    ellipsis: true,
    search: false,
  },
  {
    ...SHOP_APPLY_STATUS_COLUMN,
  },
  {
    title: '驳回原因',
    dataIndex: 'rejectReason',
    ellipsis: true,
    search: false,
    render: (_, record) => record.rejectReason || '-',
  },
  {
    title: '提交时间',
    dataIndex: 'createdAt',
    valueType: 'dateTime',
    width: 170,
    search: false,
  },
  {
    title: '终审时间',
    dataIndex: 'auditedAt',
    valueType: 'dateTime',
    width: 170,
    search: false,
  },
]

/**
 * 门店申请单列（GET /admin/shop/audits/store-applications）。
 * 口径同店铺单，额外展示门店类型与应缴保证金；操作列在页面内追加。
 */
export const STORE_APPLY_COLUMNS: ProColumns<StoreApplyVo>[] = [
  {
    title: '申请单号',
    dataIndex: 'id',
    width: 80,
    search: false,
  },
  {
    title: '门店名称',
    dataIndex: 'storeName',
    width: 160,
    ellipsis: true,
    search: false,
  },
  {
    title: '所属店铺',
    dataIndex: 'shopId',
    width: 90,
    search: false,
    render: (_, record) => record.shopId ?? '-',
  },
  {
    title: '门店类型',
    dataIndex: 'storeType',
    width: 90,
    search: false,
    render: (_, record) => renderStoreType(record.storeType),
  },
  {
    title: '联系电话',
    dataIndex: 'contactPhone',
    width: 130,
    search: false,
  },
  {
    title: '门店地址',
    dataIndex: 'addressDetail',
    width: 220,
    ellipsis: true,
    search: false,
    render: (_, record) =>
      [record.regionName, record.addressDetail].filter(Boolean).join(' ') || '-',
  },
  {
    title: '行业分类',
    dataIndex: 'categoryName',
    width: 110,
    ellipsis: true,
    search: false,
  },
  {
    title: '应缴保证金',
    dataIndex: 'depositAmount',
    width: 110,
    search: false,
    render: (_, record) => renderAmount(record.depositAmount),
  },
  {
    ...SHOP_APPLY_STATUS_COLUMN,
  },
  {
    title: '驳回原因',
    dataIndex: 'rejectReason',
    ellipsis: true,
    search: false,
    render: (_, record) => record.rejectReason || '-',
  },
  {
    title: '提交时间',
    dataIndex: 'createdAt',
    valueType: 'dateTime',
    width: 170,
    search: false,
  },
  {
    title: '终审时间',
    dataIndex: 'auditedAt',
    valueType: 'dateTime',
    width: 170,
    search: false,
  },
]
