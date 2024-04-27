import React, { useCallback, useState } from "react"
import styled from "@emotion/styled"
import { Popover, Space, theme } from "antd"
import type { StyledToken } from "@/types"
import { IconBtn, SvgIconTextBtn } from "@/components/ui"
import { IIcon } from "@/icons"
import { TriangleNodeBox } from "./node"
import { NodeTypeEnum, ShapeTypeEnum, VNTypeEnum } from "@/enums"
import { gd } from "@/config"
import { GetTheme, useConfigStore } from "@/store"

const themeSelector: GetTheme = (state) => state.theme

export const LeftSider = () => {
  const { token } = theme.useToken()
  const { type: themeType } = useConfigStore(themeSelector)
  const [openType, setOpenType] = useState("")
  const handleOpenChange = (newOpen: boolean, type: string) => {
    setOpenType(newOpen ? type : "")
  }
  const onDragStart = useCallback(
    (event: React.DragEvent, vnType: VNTypeEnum, shapeType?: string) => {
      console.log("onDragStart", event, event.nativeEvent)
      // event.nativeEvent.offsetX 是拖拽点相对于卡片左上角的坐标
      const { offsetX, offsetY } = event.nativeEvent
      const { clientWidth: width, clientHeight: height } = event.target as HTMLDivElement
      gd.setDropParam({ id: Date.now(), offsetX, offsetY, width, height })
      // console.log("params", { offsetX, offsetY, width, height })
      event.dataTransfer.setData("vn_type", vnType)
      event.dataTransfer.setData("shape_type", shapeType || "")
      event.dataTransfer.setData("node_type", NodeTypeEnum.TEXT.toString())
      event.dataTransfer.effectAllowed = "move"
    },
    []
  )
  console.log("FlowLeftSider - render")
  return (
    <ControlBox
      className="dodragleave"
      style={{ backgroundColor: token.colorBgContainer, boxShadow: token.boxShadow }}
    >
      <Popover
        open={openType === "shape"}
        placement="right"
        onOpenChange={(visible) => handleOpenChange(visible, "shape")}
        overlayInnerStyle={{ padding: 0 }}
        content={
          <ShapeSpace size={[8, 8]} token={token} wrap className="dodragleave">
            <ShapeBox className="shapeBox">
              <IconBtn type="text" icon={<IIcon icon="rect" />} />
              <SquareNodeBox
                className="shapeNode"
                draggable
                onDragStart={(event) => onDragStart(event, VNTypeEnum.SHAPE, ShapeTypeEnum.SQUARE)}
              />
            </ShapeBox>
            <ShapeBox className="shapeBox">
              <IconBtn type="text" icon={<IIcon icon="circle" />} />
              <CircleNodeBox
                className="shapeNode"
                draggable
                onDragStart={(event) => onDragStart(event, VNTypeEnum.SHAPE, ShapeTypeEnum.CIRCLE)}
              />
            </ShapeBox>
            <ShapeBox className="shapeBox">
              <IconBtn type="text" icon={<IIcon icon="triangle" />} />
              <TriangleNodeBox
                className="shapeNode triangleNode"
                draggable
                onDragStart={(event: any) =>
                  onDragStart(event, VNTypeEnum.SHAPE, ShapeTypeEnum.TRIANGLE)
                }
              />
            </ShapeBox>
          </ShapeSpace>
        }
      >
        <IconBtn type="text" icon={<IIcon icon="shapes" />} />
      </Popover>
      <Popover
        open={openType === "mindmap"}
        placement="right"
        onOpenChange={(visible) => handleOpenChange(visible, "mindmap")}
        overlayInnerStyle={{ padding: 0 }}
        content={
          <ShapeSpace
            size={[8, 8]}
            token={token}
            style={{ display: "flex" }}
            className="dodragleave"
          >
            <MindBox>
              <MindNodeBox
                className="shapeNode"
                draggable
                onDragStart={(event) => onDragStart(event, VNTypeEnum.MGROUP)}
                style={{ borderColor: themeType === "light" ? "#dee0e3" : "#434343" }}
              >
                <SvgIconTextBtn type="primary" icon={<IIcon icon="mindmap" />}>
                  思维导图
                </SvgIconTextBtn>
              </MindNodeBox>
            </MindBox>
          </ShapeSpace>
        }
      >
        <IconBtn type="text" icon={<IIcon icon="mindmap2" />} />
      </Popover>
    </ControlBox>
  )
}
const ControlBox = styled("div")({
  width: "40px",
  position: "absolute",
  left: "12px",
  top: "50%",
  transform: "translate(0, -50%)",
  borderRadius: "6px",
  padding: "4px",
})

const ShapeSpace = styled(Space)(({ token }: StyledToken) => ({
  padding: 12,
  ".shapeNode": {
    position: "absolute",
    top: -34,
    left: -34,
    transform: "scale(1, 1)",
    borderColor: token.colorText,
  },
  ".triangleNode": {
    top: -34,
    left: -42,
    width: 116,
    height: 100,
    ".svgPath": {
      fill: "transparent",
      stroke: token.colorBgSpotlight,
    },
  },
  ".shapeBox svg": {
    fontSize: 24,
  },
  ".shapeBox:hover svg": {
    color: token.colorPrimary,
  },
}))
const ShapeBox = styled("div")({
  width: 32,
  height: 32,
  overflow: "hidden",
  position: "relative",
  cursor: "move",
})
const ShapeNode = styled("div")({
  width: 100,
  height: 100,
  border: "1px solid transparent",
})

const SquareNodeBox = styled(ShapeNode)({
  borderRadius: 4,
})

const CircleNodeBox = styled(ShapeNode)({
  borderRadius: "50%",
})

const MindBox = styled("div")({
  width: 98,
  height: 32,
  overflow: "hidden",
  position: "relative",
})
const MindNodeBox = styled("div")({
  width: 166,
  height: 100,
  padding: 32,
  borderRadius: 6,
  border: "2px solid transparent",
  cursor: "move",
})
