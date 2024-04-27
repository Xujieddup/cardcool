import React, { useMemo } from "react"
import { Button, Input } from "antd"
import { IIcon } from "@/icons"
import type { TypeProp } from "@/types"
import { BaseProp } from "./base"
import { MobileOutlined, PhoneOutlined } from "@ant-design/icons"
import { IconBtn, PropName } from "@/ui"
import { PropNameEnum } from "@/enums"

type Props = {
  item: TypeProp
  handleCopy?: (propId: string) => void
  handleCallPhone?: (propId: string) => void
  disabled?: boolean
}

export const PhoneProp: React.FC<Props> = ({
  item,
  handleCopy,
  handleCallPhone,
  disabled = false,
}) => {
  const supportCopy = useMemo(() => item.handles?.includes("copy"), [item.handles])
  const placeholder = item.nameType === PropNameEnum.LEFT ? "空" : item.name
  return (
    <BaseProp
      itemId={item.id}
      leftPropName={
        item.nameType === PropNameEnum.LEFT && (
          <PropName ellipsis={true} className="propName" type="secondary">
            <MobileOutlined /> {item.name}
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
          <Button
            onClick={() => handleCallPhone?.(item.id)}
            icon={<PhoneOutlined />}
            size="small"
            type="text"
          />
        </>
      }
    >
      <Input
        placeholder={placeholder}
        disabled={disabled}
        spellCheck={false}
        bordered={false}
        className="propItem inputProp"
        autoComplete="new-user"
      />
    </BaseProp>
  )
}
