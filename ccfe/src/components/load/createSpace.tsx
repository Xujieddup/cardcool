import React, { memo, useCallback } from "react"
import { App, Button, Form, Input, Space } from "antd"
import { CardModalContainer } from "../ui"
import { SpaceIconPicker } from "@/icons"
import type { MyDatabase } from "@/types"

// 编辑的模板结构
type EditType = {
  icon: string
  name: string
  desc: string
}
const defaultData = {
  icon: "box",
  name: "",
  desc: "",
}
export const CreateSpace = memo(({ db }: { db: MyDatabase }) => {
  const [form] = Form.useForm<EditType>()
  const { message } = App.useApp()
  const icon = Form.useWatch("icon", form) || "box"
  const handleFinish = useCallback(() => {
    const { name, icon, desc } = form.getFieldsValue()
    if (!name) {
      message.error("空间名称不能为空")
      return
    }
    db.space.editSpace("", name, icon, desc).then(() => {
      window.location.href = "/"
    })
  }, [db.space, form, message])
  // Icon Picker
  const handleIconSelect = useCallback(
    (newIcon: string) => {
      form.setFieldValue("icon", newIcon)
    },
    [form]
  )
  console.log("Render: CreateSpace")
  return (
    <CardModalContainer
      title="请先创建卡片空间"
      open={true}
      closable={false}
      footer={null}
      width={400}
    >
      <Form
        name="createSpace"
        autoComplete="off"
        form={form}
        initialValues={defaultData}
        onFinish={handleFinish}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%", paddingTop: 16 }}>
          <Form.Item noStyle>
            <Form.Item name="icon" noStyle>
              <Input type="hidden" />
            </Form.Item>
            <SpaceIconPicker icon={icon} handleIconSelect={handleIconSelect} />
            <Form.Item name="name" noStyle>
              <Input placeholder="空间名称" className="nameInput" />
            </Form.Item>
          </Form.Item>
          <Form.Item name="desc" noStyle>
            <Input.TextArea rows={4} placeholder="卡片空间简介（选填）" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            创建
          </Button>
        </Space>
      </Form>
    </CardModalContainer>
  )
})
