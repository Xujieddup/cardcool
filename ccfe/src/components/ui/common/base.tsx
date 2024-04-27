import styled from "@emotion/styled"
import { Card, Modal } from "antd"

// 空间、模板列表容器样式
export const CardContainer = styled("div")({
  padding: "4px 12px 12px",
  minHeight: "100%",
  overflowY: "auto",
})
export const CardItem = styled(Card)({
  "&:hover .hide": {
    display: "block",
  },
  ".ant-card-head": {
    padding: "0 8px 0 10px",
  },
  "& .ant-card-actions>li": {
    margin: "4px 0",
  },
  ".ant-card-body .ant-typography": {
    minHeight: 66,
    marginBottom: 0,
  },
  ".cardActBtn.ant-btn.ant-btn-icon-only": {
    width: "80%",
    opacity: 0.5,
    "&:hover": {
      opacity: 1,
    },
  },
})

// 空间、模板 card 编辑弹窗样式
export const CardModalContainer = styled(Modal)({
  ".nameInput": {
    width: "calc(100% - 38px)",
    marginLeft: 6,
  },
})
