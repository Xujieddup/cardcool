import React from "react"
import { DatePicker, DatePickerProps, Select, Space } from "antd"
import dayjs from "dayjs"
import { TEMP_DATE } from "@/constant"

type Props = {
  value?: any
  onChange?: (value: any) => void
}
enum DateType {
  DAY,
  CURRDATE,
}
const formatDateVal = (val: string) => {
  if (val === TEMP_DATE) {
    return { type: DateType.CURRDATE, date: dayjs() }
  } else {
    return { type: DateType.DAY, date: val ? dayjs(val, "YYYY-MM-DD") : undefined }
  }
}
const opts = [
  {
    label: "默认值类型",
    options: [
      { value: DateType.DAY, label: "指定" },
      { value: DateType.CURRDATE, label: "当日" },
    ],
  },
]

export const DefaultDate: React.FC<Props> = ({ value, onChange }) => {
  const dateVal = formatDateVal(value)
  const onSelectChange = (t: DateType) => {
    onChange?.(t === DateType.CURRDATE ? TEMP_DATE : "")
  }
  const handleChange: DatePickerProps["onChange"] = (date, dateString) => {
    onChange?.(dateString)
  }
  return (
    <Space.Compact>
      <Select
        value={dateVal.type}
        onChange={onSelectChange}
        options={opts}
        popupClassName="beforeSelect"
        style={{ width: 73 }}
      />
      <DatePicker
        suffixIcon={null}
        placeholder="指定日期..."
        format="YYYY-MM-DD"
        value={dateVal.date}
        onChange={handleChange}
        disabled={dateVal.type === DateType.CURRDATE}
        allowClear
      />
    </Space.Compact>
  )
}
