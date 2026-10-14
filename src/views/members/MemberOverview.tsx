import type {
  ProDescriptionsColumn,
  ProFieldValueType,
} from "@ant-design/pro-components";
import { ProDescriptions } from "@ant-design/pro-components";
import { Card } from "antd";

import { useMemberDetail } from "../../api/members";
import { MEMBER_SEX_ENUM } from "./columns";

interface MemberOverviewProps {
  memberId: number;
}

type DetailColumn = ProDescriptionsColumn<MemberAdmin, ProFieldValueType>;

/** 会员基础资料 */
const BASIC_COLUMNS: DetailColumn[] = [
  { title: "手机号", dataIndex: "mobile" },
  { title: "用户名", dataIndex: "username" },
  { title: "昵称", dataIndex: "nickname" },
  { title: "真实姓名", dataIndex: "realname" },
  { title: "性别", dataIndex: "sex", valueEnum: MEMBER_SEX_ENUM },
  { title: "生日", dataIndex: "birthday" },
  { title: "身份档位", dataIndex: "levelName" },
  { title: "成长值", dataIndex: "growth" },
  { title: "注册渠道", dataIndex: "registerChannel" },
];

/** 账户限额与最近登录环境 */
const ACCOUNT_COLUMNS: DetailColumn[] = [
  {
    title: "消费日限额（元）",
    dataIndex: "dailyConsumptionLimit",
    render: (_, record) => record.dailyConsumptionLimit ?? "不限",
  },
  {
    title: "消费月限额（元）",
    dataIndex: "monthlyConsumptionLimit",
    render: (_, record) => record.monthlyConsumptionLimit ?? "不限",
  },
  { title: "最后登录 IP", dataIndex: "lastLoginIp" },
  { title: "最后登录渠道", dataIndex: "lastLoginChannel" },
];

/** 时间信息：交给 ProField 的 dateTime 渲染统一格式化 */
const TIME_COLUMNS: DetailColumn[] = [
  { title: "注册时间", dataIndex: "registerAt", valueType: "dateTime" },
  { title: "最后登录时间", dataIndex: "lastLoginAt", valueType: "dateTime" },
  { title: "最后访问时间", dataIndex: "lastVisitAt", valueType: "dateTime" },
];

/**
 * 会员详情·概览（/members/$memberId 的 index 子路由）。
 * 布局参考 ant-design-pro 高级资料页的主体：外层一张 Card，内部按分组排列
 * Descriptions；后续「订单」等子页作为兄弟子路由在此布局的 <Outlet /> 内切换。
 */
export function MemberOverview({ memberId }: MemberOverviewProps) {
  // 与 MemberDetailLayout 共用同一 queryKey，命中缓存，Data 必定已就绪
  const { data: detail } = useMemberDetail(memberId);

  if (!detail) return null;

  return (
    <Card>
      <ProDescriptions<MemberAdmin, ProFieldValueType>
        title="基础资料"
        column={2}
        bordered
        size="small"
        emptyText="-"
        dataSource={detail}
        columns={BASIC_COLUMNS}
        style={{ marginBottom: 24 }}
      />
      <ProDescriptions<MemberAdmin, ProFieldValueType>
        title="账户与登录"
        column={2}
        bordered
        size="small"
        emptyText="-"
        dataSource={detail}
        columns={ACCOUNT_COLUMNS}
        style={{ marginBottom: 24 }}
      />
      <ProDescriptions<MemberAdmin, ProFieldValueType>
        title="时间信息"
        column={3}
        bordered
        size="small"
        emptyText="-"
        dataSource={detail}
        columns={TIME_COLUMNS}
      />
    </Card>
  );
}
