import React, { memo, useCallback } from "react"
import { useHistory } from "react-router-dom"
import { loginApi } from "@/datasource"
import { LoginData, Resp } from "@/types"
import { Button, Form, Input, message } from "antd"
import { LockOutlined, MobileOutlined, RightOutlined } from "@ant-design/icons"
import { IFlexRB } from "@/ui"
import { AccountBase } from "./base"

type Props = { codeStr: string }

export const LoginMobile = memo(({ codeStr }: Props) => {
  const history = useHistory()
  const onFinish = useCallback((values: LoginData) => {
    loginApi(values.mobile, values.password).then(
      (res: Resp) => {
        const { code, msg } = res
        if (code !== 0) {
          message.error(msg)
        } else {
          // 登录和注册成功必须直接跳转，才会重构 rxdb
          window.location.href = "/"
        }
      },
      (error: Error) => {
        console.error("登录请求异常", error)
        message.error("登录请求异常")
      }
    )
  }, [])

  console.log("Render - LoginMobile")
  return (
    <AccountBase>
      <Form name="loginForm" onFinish={onFinish} size="large">
        <Form.Item name="mobile" rules={[{ required: true, message: "请输入手机号" }]}>
          <Input prefix={<MobileOutlined />} placeholder="手机号" autoComplete="new-user" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, message: "请输入密码" }]}>
          <Input.Password prefix={<LockOutlined />} type="password" placeholder="密码" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            登录
          </Button>
        </Form.Item>
      </Form>
    </AccountBase>
  )
})
