import React from "react"
import { Select, Tag } from "antd"
import { BarsOutlined, DownCircleOutlined } from "@ant-design/icons"
import type { TypeProp } from "@/types"
import { BaseProp } from "./base"
import styled from "@emotion/styled"
import type { CustomTagProps } from "rc-select/lib/BaseSelect"
import { GetColors, useConfigStore } from "@/store"
import { PropNameEnum } from "@/enums"
import { PropName } from "@/ui"

const colorsSelector: GetColors = (state) => state.colors

type Props = {
  item: TypeProp
  disabled?: boolean
}

export const SelectProp: React.FC<Props> = ({ item, disabled = false }) => {
  const colors = useConfigStore(colorsSelector)
  const placeholder = item.nameType === PropNameEnum.LEFT ? "空" : item.name
  return (
    <BaseProp
      itemId={item.id}
      leftPropName={
        item.nameType === PropNameEnum.LEFT && (
          <PropName ellipsis={true} className="propName" type="secondary">
            <DownCircleOutlined /> {item.name}
          </PropName>
        )
      }
    >
      <ISelect
        bordered={false}
        placeholder={placeholder}
        disabled={disabled}
        className="propItem selectProp"
        suffixIcon={false}
      >
        {item.options?.map((opt) => (
          <Select.Option key={opt.id} value={opt.id}>
            <div>
              <Tag color={colors.get(opt.color)?.bg || opt.color} className="align-bottom">
                {opt.label}
              </Tag>
            </div>
          </Select.Option>
        ))}
      </ISelect>
    </BaseProp>
  )
}
export const MSelectProp: React.FC<Props> = ({ item, disabled = false }) => {
  const colors = useConfigStore(colorsSelector)
  const placeholder = item.nameType === PropNameEnum.LEFT ? "空" : item.name
  return (
    <BaseProp
      itemId={item.id}
      leftPropName={
        item.nameType === PropNameEnum.LEFT && (
          <PropName ellipsis={true} className="propName" type="secondary">
            <BarsOutlined /> {item.name}
          </PropName>
        )
      }
    >
      <ISelect
        mode="multiple"
        tagRender={tagRender}
        bordered={false}
        placeholder={placeholder}
        disabled={disabled}
        className="propItem selectProp"
        optionLabelProp="opt"
        optionFilterProp="label"
        suffixIcon={false}
      >
        {item.options?.map((opt) => (
          <Select.Option key={opt.id} value={opt.id} label={opt.label} opt={opt}>
            <div>
              <Tag color={colors.get(opt.color)?.bg || opt.color} className="align-bottom">
                {opt.label}
              </Tag>
            </div>
          </Select.Option>
        ))}
      </ISelect>
    </BaseProp>
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
  "&.selectProp.ant-select-multiple .ant-select-selector": {
    padding: "0 5px",
    ".ant-select-selection-search": {
      marginInlineStart: 0,
    },
    ".ant-select-selection-placeholder": {
      insetInlineStart: 5,
    },
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
  "&.selectProp.ant-select-single .ant-select-selector": {
    padding: "0 6px",
    height: 30,
    border: 0,
    ".ant-select-selection-item": {
      padding: "4px 0",
      lineHeight: 1,
    },
  },
})
