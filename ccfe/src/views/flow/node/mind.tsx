import React from "react"
import styled from "@emotion/styled"
import type { NodeProps } from "@/reactflow/core"
import { BaseNode } from "./base"

export const MindFlowNode = ({ id, type, selected, dragging, data }: NodeProps) => {
  const {
    nodeType,
    bgColor,
    width,
    autoWidth,
    styleId,
    cardInfo,
    viewInfo,
    ext,
    etime,
    forbidEdit,
  } = data
  console.log("ReactFlow: MindFlowNode")
  return (
    <MindNodeBox>
      <BaseNode
        id={id}
        vnType={type}
        nodeType={nodeType}
        bgColor={bgColor}
        width={width}
        autoWidth={autoWidth}
        styleId={styleId}
        viewInfo={viewInfo}
        cardInfo={cardInfo}
        ext={ext}
        etime={etime}
        forbidEdit={forbidEdit}
        active={selected && !dragging}
      />
    </MindNodeBox>
  )
}
const MindNodeBox = styled("div")({
  // borderRadius: 6,
})
