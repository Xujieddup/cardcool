import React, { useMemo } from "react"
import { Input } from "antd"
import { IIcon } from "@/icons"
import type { TypeProp } from "@/types"
import { BaseProp } from "./base"
import { AlignLeftOutlined } from "@ant-design/icons"
import { IconBtn, PropName } from "@/ui"
import { PropNameEnum } from "@/enums"

type Props = {
  item: TypeProp
  handleCopy?: (propId: string) => void
  disabled?: boolean
}
export const TextProp: React.FC<Props> = ({ item, handleCopy, disabled = false }) => {
  const supportCopy = useMemo(() => item.handles?.includes("copy"), [item.handles])
  const isInline = useMemo(() => item.show?.includes("inline"), [item.show])
  const placeholder = item.nameType === PropNameEnum.LEFT ? "空" : item.name
  const isCardName = item.id === "name"
  const className = "propItem inputProp" + (isCardName ? " cardName" : "")
  return (
    <BaseProp
      itemId={item.id}
      leftPropName={
        item.nameType === PropNameEnum.LEFT && (
          <PropName ellipsis={true} className="propName" type="secondary">
            <AlignLeftOutlined /> {item.name}
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
      {isInline ? (
        <Input
          placeholder={placeholder}
          disabled={disabled}
          spellCheck={false}
          bordered={false}
          className={className}
          autoComplete="new-user"
        />
      ) : (
        <Input.TextArea
          placeholder={placeholder}
          onPressEnter={isCardName ? (e) => e.preventDefault() : undefined}
          disabled={disabled}
          spellCheck={false}
          bordered={false}
          className={className}
          autoComplete="new-user"
          autoSize
        />
      )}
    </BaseProp>
  )
}
