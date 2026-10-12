import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { App, Card } from "antd";
import { useMemo, useRef } from "react";

import {
  fetchMemberLevelHistory,
  useAssignMemberLevel,
  useGetMemberLevels,
} from "../../api/memberLevels";
import { useMemberDetail } from "../../api/members";
import { ApiError } from "../../lib/request";
import { MemberLevelAssignModal } from "./MemberLevelAssignModal";

interface MemberLevelHistoryProps {
  memberId: number;
}

/**
 * 会员等级调整历史（/members/$memberId/level-history）：
 * GET /admin/member/{memberId}/level-history 分页，时间倒序；
 * 顶部「调整等级」按钮走 PUT /admin/member/{memberId}/level。
 * 等级 id → 名称取自等级列表（MemberLevelVo），未知档位退回展示 id。
 */
export function MemberLevelHistory({ memberId }: MemberLevelHistoryProps) {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);

  // 与 MemberDetailLayout 共用缓存，取当前等级用于弹窗默认值
  const { data: detail } = useMemberDetail(memberId);
  const levelsQuery = useGetMemberLevels();

  const levelNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const level of levelsQuery.data ?? []) {
      map.set(level.id, level.levelName ?? `等级 ${level.id}`);
    }
    return map;
  }, [levelsQuery.data]);

  const assignMutation = useAssignMemberLevel({
    onSuccess: () => {
      message.success("会员等级已调整");
      actionRef.current?.reload();
    },
    onError: (error) => {
      message.error(
        error instanceof ApiError ? error.message : "调整失败，请重试",
      );
    },
  });

  const columns: ProColumns<MemberLevelChangeLog>[] = [
    {
      title: "调整前等级",
      dataIndex: "fromLevelId",
      width: 160,
      render: (_, record) =>
        record.fromLevelId === undefined || record.fromLevelId === null
          ? "无等级"
          : (levelNameById.get(record.fromLevelId) ??
            `等级 ${record.fromLevelId}`),
    },
    {
      title: "调整后等级",
      dataIndex: "toLevelId",
      width: 160,
      render: (_, record) =>
        levelNameById.get(record.toLevelId) ?? `等级 ${record.toLevelId}`,
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
      <ProTable<MemberLevelChangeLog>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        search={false}
        dateFormatter={false}
        scroll={{ x: "max-content" }}
        request={async (params) => {
          try {
            const data = await fetchMemberLevelHistory({
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
          <MemberLevelAssignModal
            key="assign"
            memberId={memberId}
            currentLevelId={detail?.memberLevelId}
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
