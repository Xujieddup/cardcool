import styled from "@emotion/styled"
import { Button } from "antd"

export const IconBtn = styled(Button)({
  verticalAlign: "bottom",
  "&.ant-btn.ant-btn-icon-only .anticon": {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
})

// Icon 和 文本 按钮
export const IconTextBtn = styled(Button)({
  padding: "4px 8px 4px 20px",
  ".iicon": {
    position: "absolute",
    top: "50%",
    left: 6,
    transform: "translate(0, -50%)",
  },
})
export const AddTextBtn = styled(Button)({
  padding: "4px 8px 4px 16px",
  ".iicon": {
    position: "absolute",
    top: "50%",
    left: 6,
    transform: "translate(0, -50%)",
  },
  fontSize: 13,
})
export const AddSmallBtn = styled(Button)({
  "&.ant-btn-sm": {
    padding: "0px 7px 0px 12px",
    fontSize: 13,
  },
  ".iicon": {
    position: "absolute",
    top: "50%",
    left: 4,
    transform: "translate(0, -50%)",
  },
})

// 颜色选项按钮
export const ColorItemBtn = styled(IconBtn)({
  boxShadow: "none",
  "&:hover": {
    transition: "0.3s",
    transform: "scale(1.2)",
  },
})
