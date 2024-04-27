import React, { ReactNode } from "react"
import { Avatar, theme, Typography } from "antd"
import styled from "@emotion/styled"
import Logo from "@/assets/logo.png"

type Props = {
  children: ReactNode
}

export const AccountBase: React.FC<Props> = ({ children }) => {
  const { token } = theme.useToken()

  console.log("Login - render")
  return (
    <Container style={{ boxShadow: token.boxShadow }}>
      <TitleBox>
        <Avatar size={64} src={Logo} />
        <Typography.Paragraph className="mt-4">组织碎片信息，构建知识模型</Typography.Paragraph>
      </TitleBox>
      {children}
    </Container>
  )
}

const Container = styled("div")({
  width: 360,
  padding: "30px 30px 16px",
  borderRadius: 8,
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  form: {
    marginBottom: 40,
  },
  ".accountIconBtn": {
    padding: 0,
    "&>.anticon+span": {
      marginInlineStart: 4,
    },
  },
  ".switchBtn": {
    paddingRight: 0,
    "&>span+.anticon": {
      marginInlineStart: 4,
    },
  },
})
const TitleBox = styled("div")({
  marginBottom: 30,
  textAlign: "center",
})
