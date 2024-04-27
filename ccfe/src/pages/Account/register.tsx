import React, { useCallback } from "react"
import { useHistory } from "react-router-dom"
import { registerApi } from "@/datasource"
import { RegisterData, Resp } from "@/types"
import { App, Button, Form, Input, Popover, QRCode, Typography } from "antd"
import { LeftOutlined, LockOutlined, MobileOutlined, TagOutlined } from "@ant-design/icons"
import { IFlexRB } from "@/ui"
import { AccountBase } from "./base"
import { STATIC_URL } from "@/config"
import Logo from "@/assets/logo.png"

export const Register: React.FC = () => {
  const history = useHistory()
  const { message } = App.useApp()
  const onFinish = useCallback(
    (values: RegisterData) => {
      // if (!/^1\d{10}$/.test(values.mobile)) {
      //   message.error("请输入正确的手机号")
      //   return
      // }
      registerApi(values.mobile, values.code, values.auth_code, values.password).then(
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
          console.error("注册请求异常", error)
          message.error("注册请求异常，请稍后再试")
        }
      )
    },
    [message]
  )

  console.log("Register - render")
  return (
    <AccountBase>
      <Form name="registerForm" onFinish={onFinish} size="large">
        <Form.Item
          name="mobile"
          rules={[
            { required: true, message: "请输入手机号" },
            { pattern: /^1\d{10}$/, message: "请输入正确的手机号" },
          ]}
        >
          <Input prefix={<MobileOutlined />} placeholder="手机号" autoComplete="new-user" />
        </Form.Item>
        <Form.Item name="code" rules={[{ required: true, message: "请输入邀请码" }]}>
          <Input prefix={<TagOutlined />} placeholder="邀请码" spellCheck={false} />
        </Form.Item>
        {/* <Space>
          <Form.Item name="auth_code" rules={[{ required: true, message: "请输入验证码" }]}>
            <Input prefix={<MessageOutlined />} placeholder="验证码" />
          </Form.Item>
          <Button style={{ marginBottom: 24 }}>获取验证码</Button>
        </Space> */}
        <Form.Item
          name="password"
          rules={[
            { required: true, message: "请输入密码" },
            { min: 6, message: "密码长度最少六位" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            type="password"
            placeholder="密码"
            autoComplete="new-password"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            注册账号
          </Button>
        </Form.Item>
      </Form>
      <IFlexRB>
        <Button
          onClick={() => history.push("/login_mobile")}
          icon={<LeftOutlined />}
          type="link"
          size="small"
          className="accountIconBtn"
        >
          登录
        </Button>
        <Popover
          content={
            <>
              <Typography.Paragraph style={{ textAlign: "center" }}>
                卡酷内测中，不定时发码
              </Typography.Paragraph>
              <QRCode
                errorLevel="M"
                value="https://u.wechat.com/EPbbSqy-17gtl9moAVHxlw4"
                icon={Logo}
              />
            </>
          }
          placement="right"
        >
          <Button type="text" size="small" style={{ float: "right" }}>
            没有邀请码?
          </Button>
        </Popover>
      </IFlexRB>
    </AccountBase>
  )
}
