import React, { memo, useCallback, useState } from "react"
import styled from "@emotion/styled"
import { Button, Popover, Space } from "antd"
import { ColorItemBtn } from "@/ui"
import { IIcon } from "@/icons"
import { GetColors, useConfigStore } from "@/store"
import { tagColors } from "@/config"

type Props = {
  colorType: string
  setColorType: (colorType: string) => void
}
const colorsSelector: GetColors = (state) => state.colors

export const ColorPicker = memo(({ colorType, setColorType }: Props) => {
  const colors = useConfigStore(colorsSelector)
  const bgColor = colors.get(colorType)?.bg || colorType
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
          {tagColors.map((c) => (
            <ColorItemBtn
              key={"color_" + c}
              style={{ backgroundColor: colors.get(c)?.bg }}
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
  width: 324,
})
