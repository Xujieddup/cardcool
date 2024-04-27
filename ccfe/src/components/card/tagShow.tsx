import React, { memo, useMemo } from "react"
import { Select, Tag, theme } from "antd"
import type { StyledToken } from "@/types"
import styled from "@emotion/styled"
import type { CustomTagProps } from "rc-select/lib/BaseSelect"
import { GetTagMap, useDBStore } from "@/store"

const tagSelector: GetTagMap = (state) => state.tagMap

type Prop = {
  name: string
  value: string[]
}

export const CardTagShow = memo(({ name, value }: Prop) => {
  const { token } = theme.useToken()
  const tagMap = useDBStore(tagSelector)
  const values = useMemo(
    () => (Array.isArray(value) ? value.filter((v) => tagMap.has(v)) : []),
    [tagMap, value]
  )
  return (
    <TagSelect
      mode="tags"
      value={values}
      tagRender={tagRender}
      placeholder={name}
      optionLabelProp="tag"
      optionFilterProp="label"
      bordered={false}
      suffixIcon={false}
      token={token}
      disabled
    >
      {Array.from(tagMap.values()).map((tag) => (
        <Select.Option key={tag.id} value={tag.id} label={tag.name} tag={tag}>
          <div>
            <Tag color={tag.color} className="align-bottom">
              {tag.name}
            </Tag>
          </div>
        </Select.Option>
      ))}
    </TagSelect>
  )
})

const tagRender = (props: CustomTagProps) => {
  const { closable, onClose } = props
  const { color, name } = props.label as any
  return (
    <Tag color={color} closable={closable} onClose={onClose}>
      {name}
    </Tag>
  )
}

const TagSelect = styled(Select)(({ token }: StyledToken) => ({
  display: "block",
  borderRadius: 4,
  ".ant-tag": {
    display: "flex",
  },
  "& .ant-tag-close-icon": {
    display: "none",
  },
  "&.ant-select-focused .ant-tag-close-icon": {
    marginRight: -2,
    display: "inline-flex",
  },
  "&.ant-select-multiple .ant-select-selector": {
    padding: "0 4px",
    ".ant-select-selection-search": {
      marginInlineStart: 0,
    },
    ".ant-select-selection-placeholder": {
      insetInlineStart: 4,
    },
  },
  "&:hover, &.ant-select-focused": {
    backgroundColor: token.colorBorderSecondary,
  },
  "&.ant-select-multiple .ant-select-selection-item": {
    lineHeight: "18px",
    height: 20,
    marginTop: 1,
    marginBottom: 1,
  },
}))
