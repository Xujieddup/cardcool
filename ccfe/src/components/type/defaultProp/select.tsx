import React from "react"
import { Select, Tag } from "antd"
import { SelectOpt } from "@/types"
import styled from "@emotion/styled"
import type { CustomTagProps } from "rc-select/lib/BaseSelect"
import { GetColors, useConfigStore } from "@/store"

const colorsSelector: GetColors = (state) => state.colors

type Props = {
  value?: any
  onChange?: (value: any) => void
  options: SelectOpt[]
}

export const DefaultSelect: React.FC<Props> = ({ value, onChange, options }) => {
  const colors = useConfigStore(colorsSelector)
  return (
    <ISelect value={value} onChange={onChange} placeholder="无" suffixIcon={false} allowClear>
      {options.map((opt) => (
        <Select.Option key={opt.id} value={opt.id}>
          <div>
            <Tag color={colors.get(opt.color)?.bg || opt.color} className="align-bottom">
              {opt.label}
            </Tag>
          </div>
        </Select.Option>
      ))}
    </ISelect>
  )
}
export const DefaultMSelect: React.FC<Props> = ({ value, onChange, options }) => {
  const colors = useConfigStore(colorsSelector)
  return (
    <ISelect
      mode="multiple"
      value={value}
      onChange={onChange}
      tagRender={tagRender}
      placeholder="无"
      optionLabelProp="opt"
      optionFilterProp="label"
      suffixIcon={false}
    >
      {options.map((opt) => (
        <Select.Option key={opt.id} value={opt.id} label={opt.label} opt={opt}>
          <div>
            <Tag color={colors.get(opt.color)?.bg || opt.color} className="align-bottom">
              {opt.label}
            </Tag>
          </div>
        </Select.Option>
      ))}
    </ISelect>
  )
}

const tagRender = (props: CustomTagProps) => {
  // console.log("tagRender", props)
  const { closable, onClose } = props
  const { c, label } = props.label as any
  return (
    <Tag color={c} closable={closable} onClose={onClose}>
      {label}
    </Tag>
  )
}

const ISelect = styled(Select)({
  width: "100%",
  "&.ant-select-multiple .ant-select-selector": {
    padding: "0 5px",
    ".ant-tag": {
      display: "flex",
      marginRight: 3,
    },
  },
  ".ant-tag-close-icon": {
    display: "none",
  },
  "&.ant-select-focused .ant-tag-close-icon": {
    marginRight: -2,
    display: "inline-flex",
  },
  "&.ant-select-single .ant-select-selector": {
    ".ant-select-selection-item": {
      padding: "4px 0",
      lineHeight: 1,
    },
  },
})
