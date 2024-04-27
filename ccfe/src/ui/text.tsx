import styled from "@emotion/styled"
import { Typography } from "antd"

// 必须有 icon，且只能单行显示
export const IText = styled(Typography.Text)({
  position: "relative",
  paddingLeft: 22,
  ".iicon": {
    position: "absolute",
    top: "50%",
    left: 0,
    transform: "translate(0, -50%)",
  },
})
export const IRText = styled(Typography.Text)({
  position: "relative",
  paddingRight: 22,
  ".iicon": {
    position: "absolute",
    top: "50%",
    right: 0,
    transform: "translate(0, -50%)",
  },
})
// 必须有 icon，可以多行显示
export const IParagraph = styled(Typography.Paragraph)({
  position: "relative",
  textIndent: 20,
  fontSize: 15,
  lineHeight: "22px",
  "&.ant-typography": {
    marginBottom: 0,
    wordBreak: "break-all",
  },
  ".iicon": {
    position: "absolute",
    top: 3,
    left: -1,
    // transform: "translateY(-50%)",
  },
})

// 画布节点，可能有 icon，也可能没有
export const IconText = styled("span")({
  display: "inline-flex",
  alignItems: "center",
  verticalAlign: "bottom",
  ".iicon": {
    marginRight: 4,
  },
  ".ant-typography": {
    minHeight: 22,
  },
})

// 卡片左侧属性名
export const PropName = styled(Typography.Text)({
  width: 104,
  fontSize: "0.875rem",
  ":hover": {
    cursor: "default",
  },
})
