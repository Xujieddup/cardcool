import type { StyledToken } from "@/types"
import styled from "@emotion/styled"
import { Empty } from "antd"
import { NodeToolbar } from "@/reactflow"

export const EmptyBox = styled(Empty)({
  marginBlock: 0,
  marginInline: 0,
  position: "absolute",
  top: "30%",
  left: "50%",
  transform: "translate(-50%, -30%)",
})

export const EditorBox = styled("div")({
  height: "100%",
  position: "relative",
  overflow: "hidden",
  "&>div": {
    height: "100%",
  },
  ".ProseMirror": {
    height: "100%",
    "&:focus-visible": {
      outline: 0,
    },
  },
})

export const ToolbarBox = styled(NodeToolbar)(({ token }: StyledToken) => ({
  padding: "4px 6px",
  borderRadius: 6,
  backgroundColor: token.colorBgContainer,
  boxShadow: token.boxShadow,
  ".ant-btn:focus-visible": {
    outline: "none",
  },
  ".selectedBtn": {
    backgroundColor: token.colorBgTextHover,
  },
  ".hideHandler &.nodeToolbar": {
    display: "none",
  },
}))
