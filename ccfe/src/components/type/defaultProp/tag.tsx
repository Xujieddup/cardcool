import React, { useCallback, useMemo } from "react"
import { Select, Tag } from "antd"
import styled from "@emotion/styled"
import type { CustomTagProps } from "rc-select/lib/BaseSelect"
import { GetDB, GetTagMap, useDBStore } from "@/store"
import { getLocalSpaceId } from "@/datasource"

const dbSelector: GetDB = (state) => state.db
const tagSelector: GetTagMap = (state) => state.tagMap

type Props = {
  value?: any
  onChange?: (value: any) => void
}

export const DefaultTag: React.FC<Props> = ({ value, onChange }) => {
  const db = useDBStore(dbSelector)
  const tagMap = useDBStore(tagSelector)
  const values = useMemo(
    () => (Array.isArray(value) ? value.filter((v) => tagMap.has(v)) : []),
    [tagMap, value]
  )
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
      placeholder="无"
      optionLabelProp="tag"
      optionFilterProp="label"
      suffixIcon={false}
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

const TagSelect = styled(Select)({
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
})
