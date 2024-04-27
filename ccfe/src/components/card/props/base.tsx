import React, { ReactNode } from "react"
import { Form, theme } from "antd"
import styled from "@emotion/styled"
import type { StyledToken } from "@/types"
import { IFlexRB } from "@/ui"

type Props = {
  itemId: string
  leftPropName: ReactNode
  children: ReactNode
  handler?: ReactNode
}

export const BaseProp: React.FC<Props> = ({ itemId, leftPropName, children, handler }) => {
  const { token } = theme.useToken()
  return (
    <IFlexRB style={{ paddingLeft: leftPropName ? 6 : undefined }}>
      {leftPropName}
      <PropBody token={token}>
        <Form.Item name={itemId} noStyle>
          {children}
        </Form.Item>
        <div className="propHandler">{handler}</div>
      </PropBody>
    </IFlexRB>
  )
}

const PropBody = styled("div")(({ token }: StyledToken) => ({
  flex: 1,
  position: "relative",
  overflow: "hidden",
  "textarea.ant-input": {
    minHeight: 30,
  },
  ".propItem": {
    fontSize: "0.875rem",
    borderRadius: 4,
  },
  ".editBox & .cardName": {
    fontSize: 18,
    fontWeight: 600,
    lineHeight: "28px",
  },
  ".inputProp, .dateProp": {
    paddingLeft: 6,
    paddingRight: 6,
  },
  ".numberProp input": {
    padding: "4px 6px",
    height: "auto",
  },
  ".linkProp": {
    padding: "4px 0 4px 6px",
    ".linkPlace": {
      flex: 1,
      height: 22,
    },
  },
  ".numberProp": {
    width: "100%",
  },
  ".dateProp": {
    width: "100%",
    border: 0,
  },
  ":hover": {
    ".propItem": {
      backgroundColor: token.colorBorderSecondary,
    },
    ".propHandler": {
      display: "flex",
    },
  },
  ".inputProp:focus, .selectProp.ant-select-focused, .ant-input-number-input:focus, .linkPropFocus, .ant-picker-focused":
    {
      backgroundColor: token.colorBorderSecondary,
    },
  ".propHandler": {
    position: "absolute",
    top: "3px",
    right: "3px",
    display: "none",
    backgroundColor: token.colorBorderSecondary,
  },
}))
