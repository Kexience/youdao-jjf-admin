import type {
  ProDescriptionsColumn,
  ProFieldValueType,
} from "@ant-design/pro-components";
import { PageContainer, ProDescriptions } from "@ant-design/pro-components";
import { Link, Outlet } from "@tanstack/react-router";
import { Alert, App, Avatar, Button, Popconfirm, Skeleton } from "antd";

import { useMemberDetail, useUpdateMemberStatus } from "../../api/members";
import { ApiError } from "../../lib/request";
import { MEMBER_STATUS_ENUM } from "./columns";

interface MemberDetailLayoutProps {
  memberId: number;
}

type DetailColumn = ProDescriptionsColumn<MemberAdmin, ProFieldValueType>;

/**
 * 页头关键字段（对应 ant-design-pro profile/advanced 的页头描述区）。
 * 时间统一 valueType dateTime 交给 ProField 格式化，空值由 emptyText 兜底为 -。
 */
const HEADER_COLUMNS: DetailColumn[] = [
  { title: "会员 ID", dataIndex: "id" },
  { title: "状态", dataIndex: "status", valueEnum: MEMBER_STATUS_ENUM },
  { title: "手机号", dataIndex: "mobile" },
  { title: "昵称", dataIndex: "nickname" },
  { title: "等级", dataIndex: "levelName" },
  { title: "成长值", dataIndex: "growth" },
];

/**
 * 会员详情布局路由：布局参考 ant-design-pro 高级资料页
 * （https://github.com/ant-design/ant-design-pro/tree/master/src/pages/profile/advanced）——
 * 页头（PageContainer content/extraContent/extra）常驻，主体交给 <Outlet />。
 *
 * 后续「订单 / 等级变更历史 / 推荐关系」等子页在
 * routes/_main/members/$memberId/ 下新增子路由即可自动挂到这里，
 * 页头与权限校验无需重复实现。
 */
export function MemberDetailLayout({ memberId }: MemberDetailLayoutProps) {
  const { message } = App.useApp();

  const detailQuery = useMemberDetail(memberId);

  const statusMutation = useUpdateMemberStatus({
    onSuccess: (_, vars) => {
      message.success(vars.status === 1 ? "会员已解禁" : "会员已禁用");
      void detailQuery.refetch();
    },
    onError: (error) => {
      message.error(
        error instanceof ApiError ? error.message : "操作失败，请重试",
      );
    },
  });

  const detail = detailQuery.data;
  const banned = detail?.status === 0;

  return (
    <PageContainer
      title="会员详情"
      subTitle="会员基础信息与登录状态，支持禁用 / 解禁。"
      content={
        detail ? (
          <ProDescriptions<MemberAdmin, ProFieldValueType>
            column={3}
            size="small"
            emptyText="-"
            dataSource={detail}
            columns={HEADER_COLUMNS}
          />
        ) : undefined
      }
      extraContent={
        // 头像放页头右侧（对应案例 extraContent 的 Statistic 位置）
        detail ? (
          <Avatar
            size={64}
            src={detail.avatar || undefined}
            icon={
              !detail.avatar
                ? (detail.nickname || detail.username || "?").slice(0, 1)
                : undefined
            }
          />
        ) : undefined
      }
      extra={[
        <Link key="back" to="/members">
          <Button>返回列表</Button>
        </Link>,
        detail && (
          <Link
            key="level-history"
            to="/members/$memberId/level-history"
            params={{ memberId: String(memberId) }}
          >
            <Button>等级历史</Button>
          </Link>
        ),
        detail && (
          <Popconfirm
            key="status"
            title={banned ? "确认解禁该会员吗？" : "确认禁用该会员吗？"}
            description={banned ? undefined : "禁用后该会员将被踢下线。"}
            onConfirm={() =>
              statusMutation.mutate({ id: memberId, status: banned ? 1 : 0 })
            }
            okButtonProps={{ loading: statusMutation.isPending }}
          >
            <Button type="primary" danger={!banned}>
              {banned ? "解禁" : "禁用"}
            </Button>
          </Popconfirm>
        ),
      ]}
    >
      {detailQuery.isPending && <Skeleton active paragraph={{ rows: 8 }} />}
      {detailQuery.isError && (
        <Alert
          type="error"
          showIcon
          message={
            detailQuery.error instanceof ApiError
              ? detailQuery.error.message
              : "详情加载失败，请重试"
          }
        />
      )}
      {detail && <Outlet />}
    </PageContainer>
  );
}
