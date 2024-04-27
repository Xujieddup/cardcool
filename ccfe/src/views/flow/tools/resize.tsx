import React, { memo } from "react"
import {
  ControlPosition,
  NodeResizerProps,
  ResizeControlVariant,
  ControlLinePosition,
} from "@/reactflow"
import { NodeResizeControl } from "@/reactflow"

// const allCtrlList: ControlLinePosition[] = ["top", "right", "bottom", "left"]
// const lrCtrlList: ControlLinePosition[] = ["left", "right"]
// const defaultHandleControls: ControlPosition[] = [ "top-left", "top-right", "bottom-left", "bottom-right" ]
const allCtrlList2: ControlLinePosition[] = ["right", "bottom"]
const lrCtrlList2: ControlLinePosition[] = ["right"]
const defaultHandleControls2: ControlPosition[] = ["bottom-right"]

type MyNodeResizerProps = NodeResizerProps & {
  ctrlType: number // 操作类型，0-禁止，1-四边，2-左右两边
}

export const MyNodeResizer = memo(
  ({
    nodeId,
    isVisible = true,
    handleClassName,
    handleStyle,
    lineClassName,
    lineStyle,
    color,
    minWidth = 10,
    minHeight = 10,
    onResizeStart,
    onResize,
    onResizeEnd,
    ctrlType,
  }: MyNodeResizerProps) => {
    if (!isVisible) {
      return null
    }
    const ctrlList = ctrlType === 1 ? allCtrlList2 : ctrlType === 2 ? lrCtrlList2 : []
    const handleControls = ctrlType === 1 ? defaultHandleControls2 : []
    return (
      <>
        {ctrlList.map((c) => (
          <NodeResizeControl
            key={c}
            className={lineClassName}
            style={lineStyle}
            nodeId={nodeId}
            position={c}
            variant={ResizeControlVariant.Line}
            color={color}
            minWidth={minWidth}
            minHeight={minHeight}
            onResizeStart={onResizeStart}
            onResize={onResize}
            onResizeEnd={onResizeEnd}
          />
        ))}
        {handleControls.map((c) => (
          <NodeResizeControl
            key={c}
            className={handleClassName}
            style={handleStyle}
            nodeId={nodeId}
            position={c}
            color={color}
            minWidth={minWidth}
            minHeight={minHeight}
            onResizeStart={onResizeStart}
            onResize={onResize}
            onResizeEnd={onResizeEnd}
          />
        ))}
      </>
    )
  }
)
