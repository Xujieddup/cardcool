import React, { useMemo } from "react"
import { InputNumber } from "antd"
import { IIcon } from "@/icons"
import type { TypeProp } from "@/types"
import { BaseProp } from "./base"
import { NumberOutlined } from "@ant-design/icons"
import { IconBtn, PropName } from "@/ui"
import { PropNameEnum } from "@/enums"

type Props = {
  item: TypeProp
  handleCopy?: (propId: string) => void
  disabled?: boolean
}

export const NumberProp: React.FC<Props> = ({ item, handleCopy, disabled = false }) => {
  const supportCopy = useMemo(() => item.handles?.includes("copy"), [item.handles])
  const placeholder = item.nameType === PropNameEnum.LEFT ? "空" : item.name
  return (
    <BaseProp
      itemId={item.id}
      leftPropName={
        item.nameType === PropNameEnum.LEFT && (
          <PropName ellipsis={true} className="propName" type="secondary">
            <NumberOutlined /> {item.name}
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
        </>
      }
    >
      <InputNumber
        placeholder={placeholder}
        disabled={disabled}
        bordered={false}
        controls={false}
        className="propItem numberProp"
        autoComplete="new-user"
      />
    </BaseProp>
  )
}
