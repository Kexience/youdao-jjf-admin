import { ProFormSelect, ProFormTextArea } from "@ant-design/pro-components";
import { ModalForm } from "@ant-design/pro-components";
import { Button } from "antd";

import { useGetMemberIdentityLevels } from "../../api/memberIdentityLevels";

interface MemberIdentityLevelAssignModalProps {
  memberId: number;
  /** 当前身份档位 id，用于默认选中并标注「当前」 */
  currentLevelId?: number;
  saving: boolean;
  onSubmit: (params: MemberIdentityLevelAssignParams) => Promise<unknown>;
}

interface AssignFormValues {
  levelId: number;
  remark?: string;
}

/**
 * 调整会员身份档位弹窗：选项来自档位列表（含停用，停用档不可再选）。
 * 同档位重复提交后端幂等返回，这里不额外拦截。
 */
export function MemberIdentityLevelAssignModal({
  memberId,
  currentLevelId,
  saving,
  onSubmit,
}: MemberIdentityLevelAssignModalProps) {
  const levelsQuery = useGetMemberIdentityLevels();

  const options = (levelsQuery.data ?? [])
    .filter((level) => level.status !== 0)
    .map((level) => ({
      value: level.id,
      label:
        level.id === currentLevelId
          ? `${level.levelName ?? `档位 ${level.id}`}（当前）`
          : (level.levelName ?? `档位 ${level.id}`),
    }));

  return (
    <ModalForm<AssignFormValues>
      name={`member-identity-level-assign-form-${memberId}`}
      title="调整会员身份档位"
      trigger={
        <Button type="primary" disabled={levelsQuery.isError}>
          调整身份档位
        </Button>
      }
      autoFocusFirstInput
      modalProps={{ destroyOnHidden: true }}
      submitTimeout={2000}
      layout="vertical"
      initialValues={{ levelId: currentLevelId }}
      submitter={{
        searchConfig: { submitText: "确认调整", resetText: "取消" },
        submitButtonProps: { loading: saving },
      }}
      onFinish={async (values) => {
        await onSubmit({
          levelId: values.levelId,
          remark: values.remark?.trim() || undefined,
        });
        return true;
      }}
    >
      <ProFormSelect
        width="md"
        name="levelId"
        label="目标档位"
        placeholder="请选择目标档位"
        options={options}
        rules={[{ required: true, message: "请选择目标档位" }]}
        fieldProps={{ loading: levelsQuery.isLoading }}
      />
      <ProFormTextArea
        name="remark"
        label="调整备注"
        placeholder="调整原因（可选）"
        rules={[{ max: 255, message: "备注最多 255 个字符" }]}
        fieldProps={{ maxLength: 255, rows: 2 }}
      />
    </ModalForm>
  );
}
