import React, { memo, useCallback, useMemo, useState } from "react"
import styled from "@emotion/styled"
import { Popover, Space, Tooltip, Typography } from "antd"
import type { GetColors } from "@/store"
import { useConfigStore } from "@/store"
import TransBgSvg from "@/assets/transbg.svg"
import { IIcon } from "@/icons"
import { ColorItemBtn, IFlexRB, IconBtn } from "@/ui"
import { THEME_COLOR } from "@/constant"
import { Colors } from "@/types"
import cc from "classcat"

type Props = {
  colorType?: string
  colorPrimary: string
  setColorType: (colorType?: string) => void
}
const transBg = { background: "url(" + TransBgSvg + ")", border: "1px solid #E0E0E0" }
const colorsSelector: GetColors = (state) => state.colors

const filterColorList = (colors: Colors, open: number, colorType?: string) => {
  if (open <= 0) {
    return []
  }
  const list = Array.from(colors.values()).filter((c) => c.type !== THEME_COLOR)
  if (open === 1) {
    const color = colorType ? colors.get(colorType) : undefined
    const num = !colorType || !color || colorType === THEME_COLOR ? 300 : color.num
    return list.filter((c) => c.num === num)
  } else {
    return list
  }
}

export const BgSet = memo(({ colorType, colorPrimary, setColorType }: Props) => {
  const colors = useConfigStore(colorsSelector)
  // 是否展示：0-不展示，1-展示一行，2-展示所有
  const [open, setOpen] = useState(0)
  const color = colorType ? colors.get(colorType) : undefined
  const colorList = useMemo(
    () => filterColorList(colors, open, colorType),
    [colorType, colors, open]
  )
  const themeColor = colors.get(THEME_COLOR)
  const handleSelectColor = useCallback(
    (oldColor?: string, newColor?: string) => {
      setOpen(0)
      oldColor !== newColor && setColorType(newColor)
    },
    [setColorType]
  )
  return (
    <Popover
      content={
        <ColorSpace size={[6, 6]} wrap>
          {colorList.map((item) => (
            <ColorItemBtn
              key={"color_" + item.type}
              style={{ backgroundColor: item.bg, color: item.color || colorPrimary }}
              icon={item.type === colorType && <IIcon icon="selected" />}
              onClick={() => handleSelectColor(colorType, item.type)}
              shape="circle"
              type="primary"
              size="small"
            />
          ))}
        </ColorSpace>
      }
      trigger={["click", "hover"]}
      placement="bottom"
      title={
        <IFlexRB>
          <Typography.Text>背景色</Typography.Text>
          <Space size={[6, 0]}>
            <Tooltip title="透明色" placement="left">
              <ColorItemBtn
                style={transBg}
                icon={(!colorType || !color) && <IIcon icon="selected" color={colorPrimary} />}
                onClick={() => handleSelectColor(colorType)}
                shape="circle"
                type="primary"
                size="small"
              />
            </Tooltip>
            {themeColor && (
              <Tooltip title="主题色" placement="left">
                <ColorItemBtn
                  style={{ backgroundColor: themeColor.bg, color: themeColor.color }}
                  icon={themeColor.type === colorType && <IIcon icon="selected" />}
                  onClick={() => handleSelectColor(colorType, themeColor.type)}
                  shape="circle"
                  type="primary"
                  size="small"
                />
              </Tooltip>
            )}
            <ColorItemBtn
              icon={<IIcon icon="arrowbottom" fontSize={20} />}
              onClick={() => setOpen((o) => (o === 1 ? 2 : 1))}
              className={cc(["collapseBtn", { collapsedLeft: open === 1 }])}
              shape="circle"
              type="text"
              size="small"
            />
          </Space>
        </IFlexRB>
      }
      open={open > 0}
      onOpenChange={(o) => setOpen(o ? 1 : 0)}
      mouseLeaveDelay={0.4}
    >
      <IconBtn
        icon={
          <ColorIcon className="center" style={color ? { backgroundColor: color.bg } : transBg} />
        }
        type="text"
        size="small"
      />
    </Popover>
  )
})

const ColorSpace = styled(Space)({
  width: 324,
})
const ColorIcon = styled("div")({
  width: 15,
  height: 15,
  borderRadius: 8,
})
