import React from "react"
import { Input, Select } from "antd"
import { getDate } from "@/utils"
import { TEMP_DATE } from "@/constant"

type Props = {
  value?: any
  onChange?: (value: any) => void
}
enum NameType {
  TEXT,
  CURRDATE,
}
const formatNameVal = (val: string) => {
  if (val === TEMP_DATE) {
    return { type: NameType.CURRDATE, name: getDate() }
  } else {
    return { type: NameType.TEXT, name: val || "" }
  }
}
const opts = [
  {
    label: "默认值类型",
    options: [
      { value: NameType.TEXT, label: "文本" },
      { value: NameType.CURRDATE, label: "当日" },
    ],
  },
]

export const DefaultName: React.FC<Props> = ({ value, onChange }) => {
  const nameVal = formatNameVal(value)
  const onSelectChange = (t: NameType) => {
    onChange?.(t === NameType.CURRDATE ? TEMP_DATE : "")
  }
  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange?.(event.target.value)
  }
  return (
    <Input
      addonBefore={
        <Select
          value={nameVal.type}
          onChange={onSelectChange}
          options={opts}
          popupClassName="beforeSelect"
        />
      }
      value={nameVal.name}
      onChange={onInputChange}
      disabled={nameVal.type === NameType.CURRDATE}
      placeholder="默认文本..."
    />
  )
}
