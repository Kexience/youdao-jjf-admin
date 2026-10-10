import { PageContainer, ProForm, ProFormDigit, ProFormSwitch } from '@ant-design/pro-components'
import { Alert, App, Card, Skeleton } from 'antd'

import { useGetSmsConfig, useUpdateSmsConfig } from '../../../api/smsConfig'
import { ApiError } from '../../../lib/request'

/**
 * 短信全局配置页：GET 读取 / PUT 保存 /admin/sms/config。
 * 字段以线上文档 SmsConfigVo / SmsConfigSaveDto 为准：
 * enabled（总开关，必填）+ dailyBudget（日预算，空=不限）。
 */
export function SmsConfig() {
  const { message } = App.useApp()

  const configQuery = useGetSmsConfig()

  const updateMutation = useUpdateSmsConfig({
    onSuccess: () => {
      message.success('短信配置已保存')
    },
    onError: (error) => {
      message.error(error instanceof ApiError ? error.message : '保存失败，请重试')
    },
  })

  const loadError =
    configQuery.error instanceof ApiError
      ? configQuery.error.message
      : '短信配置加载失败，请重试'

  return (
    <PageContainer
      header={{
        title: '短信配置',
        subTitle: '短信总开关与日预算（空为不限），保存后全局生效。',
      }}
    >
      {configQuery.isError && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          title={loadError}
        />
      )}

      <Card>
        {configQuery.isLoading || configQuery.data === undefined ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : (
          <ProForm<SmsConfigSaveParams>
            key={String(configQuery.data.enabled) + String(configQuery.data.dailyBudget ?? '')}
            layout="horizontal"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 12 }}
            initialValues={{
              enabled: configQuery.data.enabled,
              dailyBudget: configQuery.data.dailyBudget,
            }}
            submitter={{
              searchConfig: { submitText: '保存配置' },
              submitButtonProps: { loading: updateMutation.isPending },
              resetButtonProps: false,
            }}
            onFinish={(values) => updateMutation.mutateAsync(values)}
          >
            <ProFormSwitch
              name="enabled"
              label="短信总开关"
              tooltip="关闭后全站短信不再发送"
              checkedChildren="开启"
              unCheckedChildren="关闭"
              rules={[{ required: true, message: '请选择短信总开关' }]}
            />
            <ProFormDigit
              name="dailyBudget"
              label="日预算（元）"
              tooltip="为空表示不限；达到上限后当日不再发送"
              placeholder="空=不限"
              min={0}
              fieldProps={{ precision: 2, style: { width: 240 } }}
            />
          </ProForm>
        )}
      </Card>
    </PageContainer>
  )
}
