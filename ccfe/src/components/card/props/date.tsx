import React, { useMemo } from "react"
import { DatePicker, DatePickerProps } from "antd"
import { IIcon } from "@/icons"
import type { TypeProp } from "@/types"
import { BaseProp } from "./base"
import { CalendarOutlined, ClearOutlined } from "@ant-design/icons"
import dayjs from "dayjs"
import { IconBtn, PropName } from "@/ui"
import { PropNameEnum } from "@/enums"
import { TEMP_DATE } from "@/constant"

type DateFormItemProps = {
  placeholder?: string
  disabled?: boolean
  value?: string
  onChange?: (value: string) => void
}
const formatDateVal = (val: string) => {
  if (val === TEMP_DATE) {
    return dayjs()
  } else {
    return val ? dayjs(val, "YYYY-MM-DD") : undefined
  }
}

const DateFormItem: React.FC<DateFormItemProps> = ({
  placeholder = "空",
  disabled = false,
  value = "",
  onChange,
}) => {
  const dateObj = formatDateVal(value)
  // console.log("dateObj", dateObj)
  const handleChange: DatePickerProps["onChange"] = (date, dateString) => {
    // console.log(date, dateString)
    onChange?.(dateString)
  }
  // console.log("DateFormItem - render", value, placeholder)
  return (
    <DatePicker
      suffixIcon={null}
      allowClear={false}
      placeholder={placeholder}
      disabled={disabled}
      format="YYYY-MM-DD"
      className="propItem dateProp"
      value={dateObj}
      onChange={handleChange}
    />
  )
}

type Props = {
  item: TypeProp
  handleCopy?: (propId: string) => void
  handleClear?: (propId: string) => void
  disabled?: boolean
}

export const DateProp: React.FC<Props> = ({ item, handleCopy, handleClear, disabled = false }) => {
  const supportCopy = useMemo(() => item.handles?.includes("copy"), [item.handles])
  const placeholder = item.nameType === PropNameEnum.LEFT ? "空" : item.name
  return (
    <BaseProp
      itemId={item.id}
      leftPropName={
        item.nameType === PropNameEnum.LEFT && (
          <PropName ellipsis={true} className="propName" type="secondary">
            <CalendarOutlined /> {item.name}
          </PropName>
        )
      }
      handler={
        <>
          {supportCopy && (
            <IconBtn
              onClick={() => handleCopy?.(item.id)}
              icon={<IIcon icon="copy" />}
              size="small"
              type="text"
            />
          )}
          <IconBtn
            onClick={() => handleClear?.(item.id)}
            icon={<ClearOutlined />}
            size="small"
            type="text"
          />
        </>
      }
    >
      <DateFormItem placeholder={placeholder} disabled={disabled} />
    </BaseProp>
  )
}
