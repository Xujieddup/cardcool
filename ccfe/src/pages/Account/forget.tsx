import React, { useCallback } from "react"
import { useHistory } from "react-router-dom"
import { loginApi } from "@/datasource"
import { LoginData, Resp } from "@/types"
import { Button, Form, Input, message } from "antd"
import { LockOutlined, MobileOutlined } from "@ant-design/icons"
import { IFlexRB } from "@/ui"
import { AccountBase } from "./base"

export const Forget: React.FC = () => {
  const history = useHistory()
  const onFinish = useCallback(
    (values: LoginData) => {
      loginApi(values.mobile, values.password).then(
        (res: Resp) => {
          const { code, msg } = res
          if (code !== 0) {
            message.error(msg)
          } else {
            history.push("/", { replace: true })
          }
        },
        (error: Error) => {
          console.error("登录请求异常", error)
          message.error("登录请求异常")
        }
      )
    },
    [history]
  )

  console.log("Login - render")
  return (
    <AccountBase>
      <Form name="loginForm" onFinish={onFinish} size="large">
        <Form.Item name="mobile" rules={[{ required: true, message: "请输入手机号" }]}>
          <Input prefix={<MobileOutlined />} placeholder="手机号" />
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
      <IFlexRB>
        <Button type="link" size="small">
          注册
        </Button>
        <Button type="link" size="small">
          忘记密码
        </Button>
      </IFlexRB>
    </AccountBase>
  )
}
