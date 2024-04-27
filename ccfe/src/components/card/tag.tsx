import React, { useCallback, useMemo } from "react"
import { Select, Tag, theme } from "antd"
import type { StyledToken } from "@/types"
import styled from "@emotion/styled"
import type { CustomTagProps } from "rc-select/lib/BaseSelect"
import { GetDB, GetTagMap, useDBStore } from "@/store"
import { getLocalSpaceId } from "@/datasource"

const dbSelector: GetDB = (state) => state.db
const tagSelector: GetTagMap = (state) => state.tagMap

type Props = {
  name: string
  value?: string[]
  onChange?: (value: string[]) => void
}

export const CardTag: React.FC<Props> = ({ name, value, onChange }) => {
  const { token } = theme.useToken()
  const db = useDBStore(dbSelector)
  const tagMap = useDBStore(tagSelector)
  const values = useMemo(() => value?.filter((v) => tagMap.has(v)), [tagMap, value])
  const handleChange = useCallback(
    (value: any, option: any) => {
      if (Array.isArray(value) && Array.isArray(option) && option.length === value.length) {
        // 判断最后一项是否是新增的，如果是新增的，则创建标签
        const len = option.length
        if (len > 0 && !option[len - 1].value) {
          const tagName = value[len - 1].trim().substring(0, 32)
          if (tagName) {
            const spaceId = getLocalSpaceId()
            db?.tag.createTag(spaceId, tagName).then((tagId) => {
              value[len - 1] = tagId
              onChange?.(value)
            })
          }
        } else {
          onChange?.(value)
        }
      }
    },
    [db?.tag, onChange]
  )
  return (
    <TagSelect
      mode="tags"
      value={values}
      onChange={handleChange}
      tagRender={tagRender}
      placeholder={name}
      optionLabelProp="tag"
      optionFilterProp="label"
      bordered={false}
      suffixIcon={false}
      token={token}
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
}

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
}))
