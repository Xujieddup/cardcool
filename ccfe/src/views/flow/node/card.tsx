import React, { memo } from "react"
import styled from "@emotion/styled"
import type { NodeProps } from "@/reactflow/core"
import { GetTagMap, useDBStore } from "@/store"
import type { CardObj, NodeData, NodeStyleType } from "@/types"
import { CardNodeView } from "@/views/card"
import { BaseNode } from "./base"

const tagSelector: GetTagMap = (state) => state.tagMap

export const CardFlowNode = ({ id, type, selected, dragging, data }: NodeProps<NodeData>) => {
  const { nodeType, pid, bgColor, width, autoWidth, styleId, cardInfo } = data
  // console.log("ReactFlow: CardFlowNode")
  return (
    <CardNodeBox>
      <BaseNode
        id={id}
        vnType={type}
        nodeType={nodeType}
        pid={pid}
        bgColor={bgColor}
        width={width}
        autoWidth={autoWidth}
        styleId={styleId}
        cardInfo={cardInfo}
        active={selected && !dragging}
      />
    </CardNodeBox>
  )
}
const CardNodeBox = styled("div")({
  // borderRadius: 6,
})

type CardNodeProps = {
  styleId?: NodeStyleType
  cardInfo?: CardObj
}

export const CardNode = memo(({ styleId, cardInfo }: CardNodeProps) => {
  const tagMap = useDBStore(tagSelector)
  if (!cardInfo) return null
  // console.log("ReactFlow: CardNode")
  return (
    <CardBox className="nodeItem">
      <CardNodeView card={cardInfo} scope="graph" tagMap={tagMap} styleId={styleId} />
    </CardBox>
  )
})
const CardBox = styled("div")({
  borderRadius: 8,
})
