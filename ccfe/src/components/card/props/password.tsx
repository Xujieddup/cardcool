import React, { useMemo, useState } from "react"
import { Button, Input } from "antd"
import { EyeInvisibleOutlined, EyeOutlined, LockOutlined } from "@ant-design/icons"
import { IIcon } from "@/icons"
import type { TypeProp } from "@/types"
import { BaseProp } from "./base"
import { IconBtn, PropName } from "@/ui"
import { PropNameEnum } from "@/enums"

type Props = {
  item: TypeProp
  handleCopy?: (propId: string) => void
  disabled?: boolean
}

export const PasswordProp: React.FC<Props> = ({ item, handleCopy, disabled = false }) => {
  const [password, setPassword] = useState<boolean>(true)
  const supportCopy = useMemo(() => item.handles?.includes("copy"), [item.handles])
  const placeholder = item.nameType === PropNameEnum.LEFT ? "空" : item.name
  return (
    <BaseProp
      itemId={item.id}
      leftPropName={
        item.nameType === PropNameEnum.LEFT && (
          <PropName ellipsis={true} className="propName" type="secondary">
            <LockOutlined /> {item.name}
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
            onClick={() => setPassword(!password)}
            icon={password ? <EyeInvisibleOutlined /> : <EyeOutlined />}
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
        type={password ? "password" : "text"}
        autoComplete="new-password"
      />
    </BaseProp>
  )
}
