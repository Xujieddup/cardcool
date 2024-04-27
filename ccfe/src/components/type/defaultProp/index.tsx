import React, { memo } from "react"
import { Input, InputNumber } from "antd"
import useFormInstance from "antd/es/form/hooks/useFormInstance"
import { DefaultTag } from "./tag"
import { DefaultContent } from "./content"
import { DefaultLink } from "./link"
import { DefaultMSelect, DefaultSelect } from "./select"
import { DefaultName } from "./name"
import { DefaultDate } from "./date"

type Props = {
  value?: any
  onChange?: (value: any) => void
}

export const PropDefault = memo(({ value, onChange }: Props) => {
  const formIns = useFormInstance()
  const { id, type, options } = formIns.getFieldsValue()
  console.log("Render: PropDefault", value, id, type, options)
  return (
    <>
      {id === "name" ? (
        <DefaultName value={value} onChange={onChange} />
      ) : id === "tags" ? (
        <DefaultTag value={value} onChange={onChange} />
      ) : id === "content" ? (
        <DefaultContent value={value} onChange={onChange} />
      ) : type === "text" || type === "phone" ? (
        <Input
          value={value}
          onChange={onChange}
          placeholder="无"
          spellCheck={false}
          autoComplete="new-user"
        />
      ) : type === "password" ? (
        <Input.Password
          value={value}
          onChange={onChange}
          placeholder="无"
          autoComplete="new-password"
        />
      ) : type === "link" ? (
        <DefaultLink value={value} onChange={onChange} />
      ) : type === "number" ? (
        <InputNumber
          value={value}
          onChange={onChange}
          controls={false}
          placeholder="无"
          autoComplete="new-user"
          style={{ width: "100%" }}
        />
      ) : type === "date" ? (
        <DefaultDate value={value} onChange={onChange} />
      ) : type === "select" ? (
        <DefaultSelect value={value} onChange={onChange} options={options} />
      ) : type === "mselect" ? (
        <DefaultMSelect value={value} onChange={onChange} options={options} />
      ) : (
        <></>
      )}
    </>
  )
})
