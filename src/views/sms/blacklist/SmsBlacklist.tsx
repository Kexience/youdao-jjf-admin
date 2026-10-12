import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { PageContainer, ProTable } from "@ant-design/pro-components";
import { App, Button, Popconfirm } from "antd";
import { useRef } from "react";

import {
  fetchSmsBlacklist,
  useCreateSmsBlacklist,
  useDeleteSmsBlacklist,
} from "../../../api/smsBlacklist";
import { ApiError } from "../../../lib/request";
import { SMS_BLACKLIST_COLUMNS } from "./columns";
import { SmsBlacklistModal } from "./SmsBlacklistModal";

/**
 * 短信黑名单页：GET 分页查询 / POST 新增 / DELETE 移出 /admin/sms/blacklist。
 * 服务端分页 + 维度检索走 ProTable request，字段以线上文档
 * SmsBlacklistVo / SmsBlacklistAddDto 为准（无编辑接口，仅新增与移出）。
 */
export function SmsBlacklistPage() {
  const { message } = App.useApp();
  // ProTable 数据走 request 而非 dataSource，新增/移出后需手动触发重新请求
  const actionRef = useRef<ActionType>(undefined);

  const createMutation = useCreateSmsBlacklist({
    onSuccess: () => {
      message.success("已加入黑名单");
    },
    onError: (error) => {
      message.error(
        error instanceof ApiError ? error.message : "保存失败，请重试",
      );
    },
  });

  const removeMutation = useDeleteSmsBlacklist({
    onSuccess: () => {
      message.success("已移出黑名单");
    },
    onError: (error) => {
      message.error(
        error instanceof ApiError ? error.message : "移出失败，请重试",
      );
    },
  });

  const columns: ProColumns<SmsBlacklist>[] = [
    ...SMS_BLACKLIST_COLUMNS,
    {
      title: "操作",
      key: "action",
      width: 120,
      valueType: "option",
      render: (_, record, __, action) => [
        <Popconfirm
          key="remove"
          title="确认将该记录移出黑名单吗？"
          description="移出后恢复短信发送能力。"
          onConfirm={async () => {
            await removeMutation.mutateAsync(record.id);
            action?.reload();
          }}
          okButtonProps={{ loading: removeMutation.isPending }}
        >
          <Button type="link" size="small" danger>
            移出黑名单
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer
      header={{
        title: "短信黑名单",
        subTitle: "按手机号 / IP / 设备维度拦截短信发送，支持新增与移出。",
      }}
    >
      <ProTable<SmsBlacklist>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          try {
            const data = await fetchSmsBlacklist({
              page: params.current ?? 1,
              size: params.pageSize ?? 10,
              type: (params.type as string | undefined) ?? "",
            });
            return { data: data.records, total: data.total, success: true };
          } catch {
            return {
              data: [],
              total: 0,
              success: false,
            };
          }
        }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        dateFormatter={false}
        headerTitle="黑名单列表"
        options={{ density: true }}
        toolBarRender={() => [
          <SmsBlacklistModal
            key="new"
            saving={createMutation.isPending}
            onSubmit={async (params) => {
              await createMutation.mutateAsync(params);
              actionRef.current?.reload();
            }}
          />,
        ]}
      />
    </PageContainer>
  );
}
