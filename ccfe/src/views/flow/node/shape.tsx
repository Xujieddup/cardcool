import React from "react"
import styled from "@emotion/styled"
import type { NodeProps } from "@/reactflow/core"
import { BaseNode } from "./base"
import { theme } from "antd"
import { StyledToken } from "@/types"
import { SvgShapeBase } from "./svgShape"
import { ShapeTypeEnum } from "@/enums"

export const ShapeFlowNode = ({ id, type, selected, dragging, data }: NodeProps) => {
  const {
    nodeType,
    pid,
    bgColor,
    width,
    autoWidth,
    styleId,
    shapeType,
    cardInfo,
    viewInfo,
    ext,
    etime,
    forbidEdit,
  } = data
  const { token } = theme.useToken()
  const baseNode = (
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
      cardInfo={cardInfo}
      ext={ext}
      etime={etime}
      forbidEdit={forbidEdit}
      active={selected && !dragging}
    />
  )
  // console.log("ReactFlow: ShapeFlowNode")
  return (
    <ShapeNodeBox className={shapeType} token={token}>
      {shapeType === ShapeTypeEnum.TRIANGLE ? (
        <SvgTriangleNode>
          {baseNode}
          <svg viewBox="0 0 116 100" preserveAspectRatio="none" className="svgNode">
            <path d="M0,99.5 L58,0 L116,99.5 Z" className="svgPath"></path>
          </svg>
        </SvgTriangleNode>
      ) : (
        baseNode
      )}
    </ShapeNodeBox>
  )
}
const ShapeNodeBox = styled("div")(({ token }: StyledToken) => ({
  height: "100%",
  "& .baseNode": {
    height: "100%",
  },
  "& .nodeItem": {
    height: "100%",
    overflow: "hidden",
  },
  "&.square .nodeItem": {
    padding: 8,
    boxShadow: "0 0 0 1px " + token.colorBgSpotlight,
  },
  "&.circle .nodeItem": {
    borderRadius: "50%",
    padding: 12,
    boxShadow: "0 0 0 1px " + token.colorBgSpotlight,
  },
  "&.triangle .baseNode": {
    height: "auto",
    ".nodeItem": {
      boxShadow: "none!important",
      padding: 0,
      minWidth: 28,
    },
  },
  ".react-flow__node.selectable.selected &.triangle": {
    boxShadow: "0 0 0 2px " + token.colorPrimary,
    borderRadius: 6,
  },
  ".editorBox": {
    position: "relative",
    height: "100%",
  },
  ".ProseMirror": {
    width: "100%",
    height: "auto",
    minHeight: 22,
    position: "absolute",
    top: "50%",
    left: 0,
    transform: "translate(0, -50%)",
    textAlign: "center",
  },
  ".ProseMirror p.is-editor-empty:first-of-type::before": {
    width: "100%",
    textAlign: "center",
  },
  ".cardBox": {
    padding: 0,
    height: "100%",
    ".cardHeader": {
      width: "100%",
      position: "absolute",
      top: "50%",
      left: 0,
      transform: "translate(0, -50%)",
      textAlign: "center",
      ".ant-typography": {
        display: "inline-block",
      },
    },
  },
  ".viewHeader": {
    width: "100%",
    position: "absolute",
    top: "50%",
    left: 0,
    transform: "translate(0, -50%)",
    textAlign: "center",
    ".ant-typography": {
      display: "inline-block",
    },
  },
}))

const SvgTriangleNode = styled(SvgShapeBase)({
  height: "100%",
  ".svgPath": {
    strokeWidth: "1px",
  },
  "& .baseNode": {
    position: "absolute",
    top: "50%",
    left: "25%",
    right: "25%",
    bottom: 2,
  },
})

export const TriangleNodeBox = ({ children, ...props }: any) => (
  <SvgTriangleNode2 {...props}>
    <svg viewBox="0 0 116 100" preserveAspectRatio="none">
      <path d="M0,99.5 L58,0 L116,99.5 Z" className="svgPath"></path>
    </svg>
    {children}
  </SvgTriangleNode2>
)

const SvgTriangleNode2 = styled(SvgShapeBase)({
  height: "100%",
  borderRadius: 4,
  ".svgPath": {
    strokeWidth: "1px",
  },
  "& .editContainer": {
    position: "absolute",
    top: "50%",
    left: "25%",
    right: "25%",
    bottom: 2,
  },
})
