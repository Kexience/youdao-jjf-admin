import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { App, Card } from "antd";
import { useMemo, useRef } from "react";

import {
  fetchMemberIdentityLevelHistory,
  useAssignMemberIdentityLevel,
  useGetMemberIdentityLevels,
} from "../../api/memberIdentityLevels";
import { useMemberDetail } from "../../api/members";
import { ApiError } from "../../lib/request";
import { MemberIdentityLevelAssignModal } from "./MemberIdentityLevelAssignModal";

interface MemberIdentityLevelHistoryProps {
  memberId: number;
}

/**
 * 会员身份档位调整历史（/members/$memberId/identity-level-history）：
 * GET /admin/member/{memberId}/identity-level-history 分页，时间倒序；
 * 顶部「调整身份档位」按钮走 PUT /admin/member/{memberId}/identity-level。
 * 档位 id → 名称取自档位列表（MemberIdentityLevelVo），未知档位退回展示 id。
 */
export function MemberIdentityLevelHistory({
  memberId,
}: MemberIdentityLevelHistoryProps) {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);

  // 与 MemberDetailLayout 共用缓存，取当前档位用于弹窗默认值
  const { data: detail } = useMemberDetail(memberId);
  const levelsQuery = useGetMemberIdentityLevels();

  const levelNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const level of levelsQuery.data ?? []) {
      map.set(level.id, level.levelName ?? `档位 ${level.id}`);
    }
    return map;
  }, [levelsQuery.data]);

  const assignMutation = useAssignMemberIdentityLevel({
    onSuccess: () => {
      message.success("会员身份档位已调整");
      actionRef.current?.reload();
    },
    onError: (error) => {
      message.error(
        error instanceof ApiError ? error.message : "调整失败，请重试",
      );
    },
  });

  const columns: ProColumns<MemberIdentityLevelChangeLog>[] = [
    {
      title: "调整前档位",
      dataIndex: "fromLevelId",
      width: 160,
      render: (_, record) =>
        record.fromLevelId === undefined || record.fromLevelId === null
          ? "无档位"
          : (levelNameById.get(record.fromLevelId) ??
            `档位 ${record.fromLevelId}`),
    },
    {
      title: "调整后档位",
      dataIndex: "toLevelId",
      width: 160,
      render: (_, record) =>
        levelNameById.get(record.toLevelId) ?? `档位 ${record.toLevelId}`,
    },
    {
      title: "操作管理员 ID",
      dataIndex: "operatorAdminId",
      width: 140,
      render: (_, record) => record.operatorAdminId ?? "-",
    },
    {
      title: "备注",
      dataIndex: "remark",
      ellipsis: true,
      render: (_, record) => record.remark || "-",
    },
    {
      title: "调整时间",
      dataIndex: "createdAt",
      width: 180,
      valueType: "dateTime",
    },
  ];

  return (
    <Card>
      <ProTable<MemberIdentityLevelChangeLog>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        search={false}
        dateFormatter={false}
        scroll={{ x: "max-content" }}
        request={async (params) => {
          try {
            const data = await fetchMemberIdentityLevelHistory({
              memberId,
              page: params.current ?? 1,
              size: params.pageSize ?? 10,
            });
            return { data: data.records, total: data.total, success: true };
          } catch (error) {
            return {
              data: [],
              total: 0,
              success: false,
              errorMessage:
                error instanceof ApiError ? error.message : "加载失败，请重试",
            };
          }
        }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        options={{ density: true }}
        toolBarRender={() => [
          <MemberIdentityLevelAssignModal
            key="assign"
            memberId={memberId}
            currentLevelId={detail?.memberIdentityLevelId}
            saving={assignMutation.isPending}
            onSubmit={(params) =>
              assignMutation.mutateAsync({ memberId, params })
            }
          />,
        ]}
      />
    </Card>
  );
}
