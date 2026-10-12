import {
  PageContainer,
  ProForm,
  ProFormText,
} from "@ant-design/pro-components";
import { useNavigate } from "@tanstack/react-router";
import { App, Button, Card } from "antd";
import { Link } from "@tanstack/react-router";

import { useCreateAdminUser } from "../../api/adminUsers";
import { ApiError } from "../../lib/request";

/** 新建管理员表单值：仅用户名与口令，资料由管理员自行补充 */
export interface AdminUserCreateFormValues {
  username: string;
  password: string;
  confirmPassword: string;
}

/**
 * 新建管理员页面（/users/new）：POST /admin/users，提交成功后回列表。
 * 新建后账号恒正常、无角色（角色在列表/详情另行分配）；
 * 用户名唯一性等校验由后端拦截，报错由 mutation onError 透出。
 */
export function AdminUserCreate() {
  const { message } = App.useApp();
  const navigate = useNavigate();

  const createMutation = useCreateAdminUser({
    onSuccess: (user) => {
      message.success(`管理员 ${user.username} 创建成功`);
      void navigate({ to: "/users" });
    },
    onError: (error) => {
      message.error(
        error instanceof ApiError ? error.message : "创建失败，请重试",
      );
    },
  });

  return (
    <PageContainer
      title="新建管理员"
      subTitle="仅填写登录用户名与初始口令，资料由管理员自行补充。"
      extra={[
        <Link key="back" to="/users">
          <Button>返回列表</Button>
        </Link>,
      ]}
    >
      <Card variant="borderless">
        <ProForm<AdminUserCreateFormValues>
          name="admin-user-create-form"
          layout="vertical"
          submitter={{
            searchConfig: { submitText: "创建", resetText: "重置" },
            submitButtonProps: { loading: createMutation.isPending },
          }}
          onFinish={async (values) => {
            await createMutation.mutateAsync({
              username: values.username.trim(),
              password: values.password,
            });
            return true;
          }}
        >
          <ProFormText
            width="md"
            name="username"
            label="登录用户名"
            placeholder="全局唯一，64 个字符以内"
            rules={[
              { required: true, message: "请输入登录用户名" },
              { max: 64, message: "用户名最多 64 个字符" },
            ]}
            fieldProps={{ maxLength: 64 }}
          />
          <ProFormText.Password
            width="md"
            name="password"
            label="初始口令"
            placeholder="8~32 个字符"
            rules={[
              { required: true, message: "请输入初始口令" },
              { min: 8, message: "口令至少 8 个字符" },
              { max: 32, message: "口令最多 32 个字符" },
            ]}
            fieldProps={{ maxLength: 32 }}
          />
          <ProFormText.Password
            width="md"
            name="confirmPassword"
            label="确认口令"
            placeholder="再次输入初始口令"
            dependencies={["password"]}
            rules={[
              { required: true, message: "请再次输入初始口令" },
              ({ getFieldValue }) => ({
                validator: (_, value) =>
                  !value || value === getFieldValue("password")
                    ? Promise.resolve()
                    : Promise.reject(new Error("两次输入的口令不一致")),
              }),
            ]}
            fieldProps={{ maxLength: 32 }}
          />
        </ProForm>
      </Card>
    </PageContainer>
  );
}
