import React, { useEffect, useMemo } from "react"
import { useHistory, useLocation } from "react-router-dom"
import { bindWechatApi } from "@/datasource"
import type { Resp } from "@/types"
import { App, Flex, Spin, Typography } from "antd"
import { AccountBase } from "./base"

// https://i.cardcool.top/bindwechat?code=021ixc000pzG1R1r6h40099lB40ixc0N&state=
export const BindWechat: React.FC = () => {
  const { search } = useLocation()
  console.log("search", search)
  const query = useMemo(() => new URLSearchParams(search), [search])
  const code = query.get("code")
  // const mobile = query.get("state") || ""
  const { message } = App.useApp()
  const history = useHistory()
  useEffect(() => {
    const loginPath = "/"
    if (!code) {
      message.error("参数异常，请稍后重试！").then(() => {
        history.push(loginPath)
      })
    } else {
      bindWechatApi(code).then(
        (res: Resp) => {
          const { code, data, msg } = res
          console.log("callback data", data)
          if (code !== 0) {
            message.error(msg).then(() => {
              history.push(loginPath)
            })
          } else {
            // 绑定成功，直接跳转根路径，才会重构 rxdb
            message.success("微信绑定成功！").then(() => {
              window.location.href = loginPath
            })
          }
        },
        (error: Error) => {
          console.error("授权请求异常", error)
          message.error("授权请求异常")
        }
      )
    }
  }, [code, history, message])
  console.log("Render - BindWechat")
  return (
    <AccountBase>
      <Flex justify="center" align="center" gap="small" style={{ marginBottom: 24 }}>
        <Spin />
        <Typography.Text type="warning" className="ml8">
          绑定中...
        </Typography.Text>
      </Flex>
    </AccountBase>
  )
}
