import React, { ReactNode, memo } from "react"
import type { GanttOptions } from "@/types"
import styled from "@emotion/styled"
import { Typography } from "antd"

type Props = {
  id: string
  text: string
  startIndex?: number
  widthCnt?: number
  barBg: ReactNode
  options: GanttOptions
}

export const GanttBar = memo(({ id, text, startIndex, widthCnt = 0, barBg, options }: Props) => {
  const left = (startIndex || 0) * options.colWidth
  const width = widthCnt * options.colWidth

  // $.on(this.$contentSvg, "mousemove", (e: MouseEvent) => {
  //   if (!actionInProgress() || !data) return
  //   // 拖拽相对位移
  //   const dx = e.offsetX - startX
  //   if (isResizingLeft) {
  //     data.bar.updateBarPosition({ x: data.ox + dx, width: data.ow - dx })
  //   } else if (isResizingRight) {
  //     data.bar.updateBarPosition({ width: data.ow + dx })
  //   } else if (isDragging) {
  //     data.bar.updateBarPosition({ x: data.ox + dx })
  //   }
  //   if (!isActive && dx !== 0) {
  //     isActive = true
  //     this.$contentSvg?.classList.add("dragging")
  //   }
  // })
  // $.on(this.$contentSvg, "mouseup", (e: MouseEvent) => {
  //   this.bar_being_dragged = null
  //   if (isActive) {
  //     isActive = false
  //     this.$contentSvg?.classList.remove("dragging")
  //   }
  //   if (!actionInProgress() || !data) return
  //   // 拖拽相对位移(修正后)
  //   const finalDx = this.getSnapPosition(e.offsetX - startX)
  //   if (isResizingLeft) {
  //     data.bar.updateBarPosition({
  //       x: data.ox + finalDx,
  //       width: data.ow - finalDx,
  //     })
  //   } else if (isResizingRight) {
  //     data.bar.updateBarPosition({ width: data.ow + finalDx })
  //   } else if (isDragging) {
  //     data.bar.updateBarPosition({ x: data.ox + finalDx })
  //   }
  //   if (!finalDx) return
  //   // 更新开始日期和结束日期
  //   data.bar.dateChanged()
  //   data.bar.set_action_completed()
  // })

  // document.addEventListener("mouseup", () => {
  //   isDragging = false
  //   isResizingLeft = false
  //   isResizingRight = false
  // })
  // console.log("Render: GanttBar")
  return (
    <>
      {barBg}
      {startIndex !== undefined && (
        <BarWrapper
          className="barWrapper Opencard"
          style={{ left, width }}
          data-id={id}
          data-left={left}
          data-width={width}
        >
          <Typography.Text ellipsis>{text}</Typography.Text>
          {/* <BarHandle className="handle left" />
          <BarHandle className="handle right" /> */}
        </BarWrapper>
      )}
    </>
  )
})
const BarWrapper = styled("div")({
  position: "absolute",
  top: 8,
  height: 22,
  borderRadius: 3,
  textAlign: "center",
  padding: "0 4px",
  ".ant-typography": {
    lineHeight: "22px",
    fontSize: 13,
  },
})
const BarHandle = styled("div")({
  position: "absolute",
  top: 0,
  "&.left": {
    left: 0,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  "&.right": {
    right: 0,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  width: 8,
  height: 22,
  cursor: "ew-resize",
  opacity: 0,
  visibility: "hidden",
  transition: "opacity .3s ease",
})
