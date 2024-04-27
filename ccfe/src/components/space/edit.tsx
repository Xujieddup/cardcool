import React, { memo, useCallback, useEffect } from "react"
import { App, Button, Form, Input, Space, Typography } from "antd"
import { useModelStore } from "@/store"
import type { UseMSpaceId } from "@/store"
import { SpaceIconPicker } from "@/icons"
import { shallow } from "zustand/shallow"
import { CardModalContainer } from "@/components/ui"
import { useDBStore } from "@/store"
import type { GetDB } from "@/store"

const dbSelector: GetDB = (state) => state.db

// 编辑的模板结构
type EditType = {
  id: string
  icon: string
  name: string
  desc: string
}

const selector: UseMSpaceId = (state) => [state.mSpaceId, state.setMSpaceId]

export const SpaceEdit: React.FC = memo(() => {
  const db = useDBStore(dbSelector)
  const { message } = App.useApp()
  const [form] = Form.useForm<EditType>()
  const icon = Form.useWatch("icon", form) || "cube"

  const [mSpaceId, setMSpaceId] = useModelStore(selector, shallow)
  const isNew = mSpaceId === ""
  const isOpen = mSpaceId !== undefined
  useEffect(() => {
    if (mSpaceId !== undefined) {
      if (mSpaceId === "") {
        form.setFieldsValue({
          id: "",
          icon: "cube",
          name: "",
          desc: "",
        })
      } else {
        db?.space.getSpace(mSpaceId).then((s) => {
          s &&
            form.setFieldsValue({
              id: s.id,
              icon: s.icon,
              name: s.name,
              desc: s.desc,
            })
        })
      }
    }
  }, [db?.space, form, mSpaceId])
  const handleCancel = useCallback(() => {
    setMSpaceId()
  }, [setMSpaceId])
  const handleFinish = useCallback(() => {
    const { id, name, icon, desc } = form.getFieldsValue()
    const spaceName = name.trim()
    const spaceDesc = desc.trim()
    if (!spaceName) {
      message.error("空间名称不能为空")
      return
    }
    if (spaceName.length > 32) {
      message.error("空间名称不能超过32个字符")
      return
    }
    if (spaceDesc.length > 128) {
      message.error("空间简介不能超过128个字符")
      return
    }
    return db?.space.editSpace(id, spaceName, icon, spaceDesc).then(() => {
      message.success(id === "" ? "创建空间成功" : "修改空间完成")
      setMSpaceId()
    })
  }, [db?.space, form, message, setMSpaceId])
  // Icon Picker
  const handleIconSelect = useCallback(
    (newIcon: string) => {
      form.setFieldValue("icon", newIcon)
    },
    [form]
  )
  console.log("Type - Edit - render")
  return (
    <CardModalContainer
      title={isNew ? "新建卡片空间" : "修改卡片空间"}
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={400}
    >
      <Form name="spaceEdit" autoComplete="off" form={form} onFinish={handleFinish}>
        <Form.Item name="id" noStyle>
          <Input type="hidden" />
        </Form.Item>
        <Space direction="vertical" size="middle" style={{ width: "100%", paddingTop: 16 }}>
          <Typography.Text strong>卡片空间详情</Typography.Text>
          <Form.Item noStyle>
            <Form.Item name="icon" noStyle>
              <Input type="hidden" />
            </Form.Item>
            <SpaceIconPicker icon={icon} handleIconSelect={handleIconSelect} />
            <Form.Item name="name" noStyle>
              <Input placeholder="卡片空间名称" className="nameInput" />
            </Form.Item>
          </Form.Item>
          <Form.Item name="desc" noStyle>
            <Input.TextArea rows={4} placeholder="卡片空间简介（选填）" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            {isNew ? "新建" : "确认"}
          </Button>
        </Space>
      </Form>
    </CardModalContainer>
  )
})
