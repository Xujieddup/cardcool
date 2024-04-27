import React, { useEffect, useMemo } from "react"
import { useHistory, useLocation } from "react-router-dom"
import { callback } from "@/datasource"
import type { Resp } from "@/types"
import { App, Flex, Spin, Typography } from "antd"
import { AccountBase } from "./base"

// https://i.cardcool.top/callback?code=041nAyGa1FOMOF0BYaHa1FKknt2nAyGS&state=Df3QWc80ZDHz
export const Callback: React.FC = () => {
  const { search } = useLocation()
  const query = useMemo(() => new URLSearchParams(search), [search])
  const code = query.get("code")
  const inviteCode = query.get("state") || ""
  const { message } = App.useApp()
  const history = useHistory()
  useEffect(() => {
    const loginPath = inviteCode ? "/login_mobile?" + inviteCode : "/login_mobile"
    if (!code) {
      message.error("参数异常，请稍后重试！").then(() => {
        history.push(loginPath)
      })
    } else {
      callback(code, inviteCode).then(
        (res: Resp) => {
          const { code, data, msg } = res
          console.log("callback data", data)
          if (code !== 0) {
            message.error(msg).then(() => {
              history.push(loginPath)
            })
          } else {
            // 登录成功，直接跳转根路径，才会重构 rxdb
            window.location.href = "/"
          }
        },
        (error: Error) => {
          console.error("授权请求异常", error)
          message.error("授权请求异常")
        }
      )
    }
  }, [code, history, inviteCode, message])
  console.log("Render - Callback")
  return (
    <AccountBase>
      <Flex justify="center" align="center" gap="small" style={{ marginBottom: 24 }}>
        <Spin />
        <Typography.Text type="warning" className="ml8">
          登录中...
        </Typography.Text>
      </Flex>
    </AccountBase>
  )
}
