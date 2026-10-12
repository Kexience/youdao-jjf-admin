import {
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components'

import { MEMBER_LEVEL_STATUS_ENUM } from './columns'

/** 等级状态下拉选项：复用列枚举的文案，值转数字 */
const STATUS_OPTIONS = Object.entries(MEMBER_LEVEL_STATUS_ENUM).map(([value, item]) => ({
  value: Number(value),
  label: item.text,
}))

interface MemberLevelFormFieldsProps {
  /** 编辑态：档位代码只读、默认档不可改（更新 DTO 无该字段） */
  isEdit?: boolean
  /** 编辑态展示的稳定档位代码（仅 migration 写入） */
  levelCode?: string
}

/**
 * 等级表单公共字段（新建 / 编辑共用，长度与取值上限以文档为准）。
 * 新建：名称/序位/成长值门槛/折扣/状态必填，默认档可选；
 * 编辑：字段全部「空=保留原值」，档位代码只读展示。
 */
export function MemberLevelFormFields({ isEdit, levelCode }: MemberLevelFormFieldsProps) {
  return (
    <>
      {isEdit && levelCode && (
        <ProFormText
          width="md"
          name="levelCode"
          label="档位代码"
          tooltip="稳定档位代码，仅 migration 写入，管理界面不可改"
          disabled
        />
      )}
      <ProForm.Group>
        <ProFormText
          width="md"
          name="levelName"
          label="等级名称"
          placeholder="如 黄金会员"
          rules={[
            { required: !isEdit, message: '请输入等级名称' },
            { max: 50, message: '等级名称最多 50 个字符' },
          ]}
          fieldProps={{ maxLength: 50 }}
        />
        <ProFormDigit
          width="xs"
          name="sort"
          label="档位序位"
          tooltip="升序即档位高低"
          placeholder="如 1"
          min={0}
          fieldProps={{ precision: 0 }}
          rules={[{ required: !isEdit, message: '请输入档位序位' }]}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormDigit
          width="md"
          name="growthRequired"
          label="成长值门槛"
          placeholder="如 1000"
          min={0}
          rules={[{ required: !isEdit, message: '请输入成长值门槛' }]}
        />
        <ProFormDigit
          width="md"
          name="consumeDiscount"
          label="消费折扣"
          tooltip="100=不打折，填 90 表示九折"
          placeholder="如 100"
          min={0}
          max={100}
          rules={[{ required: !isEdit, message: '请输入消费折扣' }]}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormSelect
          width="xs"
          name="status"
          label="状态"
          placeholder="请选择状态"
          options={STATUS_OPTIONS}
          rules={[{ required: !isEdit, message: '请选择状态' }]}
        />
        {!isEdit && (
          <ProFormSwitch
            name="isDefault"
            label="默认档"
            tooltip="已有默认档时再选将被后端拒绝"
            checkedChildren="是"
            unCheckedChildren="否"
          />
        )}
      </ProForm.Group>
      <ProFormTextArea
        name="remark"
        label="备注"
        placeholder="备注（可选）"
        rules={[{ max: 255, message: '备注最多 255 个字符' }]}
        fieldProps={{ maxLength: 255, rows: 2 }}
      />
    </>
  )
}
