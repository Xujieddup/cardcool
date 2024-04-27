import styled from "@emotion/styled"
import { Button } from "antd"

export const IconBtn = styled(Button)({
  // 对应 emoji size 为 18px，Button size 为 32px
  "span.iicon": {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  svg: {
    fontSize: 20,
  },
})

// Icon 和 文本 按钮
export const IconTextBtn = styled(Button)({
  position: "relative",
  padding: "4px 12px 4px 28px",
  ".iicon": {
    position: "absolute",
    top: "50%",
    left: 6,
    transform: "translate(0, -50%)",
  },
  "&.ant-btn > .anticon+span": {
    marginInlineStart: 0,
  },
})
export const IconTextSmallBtn = styled(Button)({
  "&.ant-btn-sm": {
    fontSize: 13,
    paddingLeft: 20,
  },
  position: "relative",
  ".iicon": {
    fontSize: 14,
    position: "absolute",
    top: "50%",
    left: 6,
    transform: "translate(0, -50%)",
  },
  "&.ant-btn > .anticon+span": {
    marginInlineStart: 0,
  },
})
// SVG Icon 和 文本 按钮(可调整 icon size)
export const SvgIconTextBtn = styled(IconTextBtn)({
  ".ant-btn-icon": {
    marginInlineEnd: "0px!important",
    ".iicon": {
      fontSize: 16,
      left: 8,
    },
  },
})
