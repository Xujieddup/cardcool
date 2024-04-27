import React, { memo } from "react"
import styled from "@emotion/styled"
import type { NodeProps } from "@/reactflow/core"
import type { NodeStyleType, View } from "@/types"
import { BaseNode } from "./base"
import { IParagraph } from "@/ui"
import { IIcon } from "@/icons"
import { Typography } from "antd"
import { useHistory } from "react-router-dom"
import { NODE_STYLE_FULL } from "@/constant"

export const ViewFlowNode = ({ id, type, selected, dragging, data }: NodeProps) => {
  const { nodeType, pid, bgColor, width, autoWidth, styleId, viewInfo } = data
  console.log("ReactFlow: ViewFlowNode")
  return (
    <ViewNodeBox>
      <BaseNode
        id={id}
        vnType={type}
        nodeType={nodeType}
        pid={pid}
        bgColor={bgColor}
        width={width}
        autoWidth={autoWidth}
        styleId={styleId}
        viewInfo={viewInfo}
        active={selected && !dragging}
      />
    </ViewNodeBox>
  )
}
const ViewNodeBox = styled("div")({
  // borderRadius: 6,
})

type ViewNodeProps = {
  styleId?: NodeStyleType
  viewInfo?: View
}

export const ViewNode = memo(({ styleId, viewInfo }: ViewNodeProps) => {
  const history = useHistory()
  if (!viewInfo) return null
  // 视图节点没有编辑状态
  // console.log("ReactFlow: ViewNode", viewInfo)
  return (
    <ViewBox
      className="nodeItem leftBorder"
      onDoubleClick={() => history.push("/" + viewInfo.space_id + "/" + viewInfo.id)}
    >
      <ViewNodeContainer>
        <ViewHeaderBox className="viewHeader">
          <IParagraph strong>
            <IIcon icon={viewInfo.icon} />
            {viewInfo.name || "未命名"}
          </IParagraph>
        </ViewHeaderBox>
        {styleId === NODE_STYLE_FULL && <ViewDesc>{viewInfo.desc || "暂无视图简介..."}</ViewDesc>}
      </ViewNodeContainer>
    </ViewBox>
  )
})

const ViewBox = styled("div")({
  padding: "8px 12px 8px 10px",
  borderRadius: 6,
  overflow: "hidden",
  wordBreak: "break-all",
})
const ViewNodeContainer = styled("div")({
  position: "relative",
  height: "100%",
  "& *:last-child": {
    marginBottom: 0,
  },
})
const ViewHeaderBox = styled("div")({
  marginBottom: 4,
})
const ViewDesc = styled(Typography.Paragraph)({
  opacity: 0.45,
})
