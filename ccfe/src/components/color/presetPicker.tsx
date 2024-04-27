import React, { memo, useCallback, useState } from "react"
import styled from "@emotion/styled"
import { Button, Popover, Space, theme } from "antd"
import { ColorItemBtn } from "@/ui"
import { IIcon } from "@/icons"
import { presetColors } from "@/config"

type Props = {
  colorType: string
  setColorType: (colorType: string) => void
}

export const PresetColorPicker = memo(({ colorType, setColorType }: Props) => {
  const t = theme.useToken()
  const token: any = t.token
  const bgColor = token[colorType]
  const [open, setOpen] = useState(false)
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }
  const handleSelectColor = useCallback(
    (newColor: string) => {
      setOpen(false)
      setColorType(newColor)
    },
    [setColorType]
  )
  return (
    <Popover
      content={
        <ColorSpace size={[6, 6]} wrap>
          {presetColors.map((c) => (
            <ColorItemBtn
              key={"color_" + c}
              style={{ backgroundColor: token[c] }}
              icon={c === colorType && <IIcon icon="selected" />}
              onClick={() => handleSelectColor(c)}
              shape="circle"
              type="primary"
              size="small"
            />
          ))}
        </ColorSpace>
      }
      trigger="click"
      placement="bottom"
      open={open}
      onOpenChange={handleOpenChange}
    >
      <Button
        onClick={() => setOpen(true)}
        size="small"
        type="primary"
        style={{ backgroundColor: bgColor }}
      />
    </Popover>
  )
})

const ColorSpace = styled(Space)({
  width: 204,
})
