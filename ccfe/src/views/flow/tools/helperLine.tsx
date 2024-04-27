import { theme } from "antd"
import React, { CSSProperties, memo, useEffect, useRef } from "react"
import { ReactFlowState, useStore } from "@/reactflow"
import { shallow } from "zustand/shallow"
import { HelperLineData } from "@/types"

const canvasStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  position: "absolute",
  zIndex: 10,
  pointerEvents: "none",
}

const storeSelector = (state: ReactFlowState) => ({
  width: state.width,
  height: state.height,
  transform: state.transform,
})

// a simple component to display the helper lines
// it puts a canvas on top of the React Flow pane and draws the lines using the canvas API
export const HelperLine = memo(
  ({ horizontal, vertical, startX, startY, endX, endY }: HelperLineData) => {
    const { width, height, transform } = useStore(storeSelector, shallow)
    const { token } = theme.useToken()

    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")

      if (!ctx || !canvas) {
        return
      }

      const dpi = window.devicePixelRatio
      canvas.width = width * dpi
      canvas.height = height * dpi

      ctx.scale(dpi, dpi)
      ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = token.colorPrimary

      if (typeof vertical === "number") {
        ctx.moveTo(vertical * transform[2] + transform[0], 0)
        ctx.lineTo(vertical * transform[2] + transform[0], height)
        ctx.stroke()
      }
      if (typeof horizontal === "number") {
        ctx.moveTo(0, horizontal * transform[2] + transform[1])
        ctx.lineTo(width, horizontal * transform[2] + transform[1])
        ctx.stroke()
      }
      if (startX && startY && endX && endY) {
        ctx.setLineDash([4, 4])
        ctx.moveTo(startX * transform[2] + transform[0], startY * transform[2] + transform[1])
        ctx.lineTo(endX * transform[2] + transform[0], endY * transform[2] + transform[1])
        ctx.stroke()
      }
    }, [
      width,
      height,
      transform,
      token.colorPrimary,
      horizontal,
      vertical,
      startX,
      startY,
      endX,
      endY,
    ])
    // console.log("Render - HelperLine")
    return <canvas ref={canvasRef} className="react-flow__canvas" style={canvasStyle} />
  }
)
