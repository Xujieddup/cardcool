import React, { memo, useCallback, useEffect } from "react"
import { App, Button, Form, Input, Space, Typography } from "antd"
import { useModelStore } from "@/store"
import type { UseMTypeAndPropEditId } from "@/store"
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

const selector: UseMTypeAndPropEditId = (state) => [
  state.mTypeId,
  state.setMTypeId,
  state.setMTPropTypeId,
]

export const TypeEdit: React.FC = memo(() => {
  const db = useDBStore(dbSelector)
  const { message } = App.useApp()
  const [form] = Form.useForm<EditType>()

  const [mTypeId, setMTypeId, setMTPropTypeId] = useModelStore(selector, shallow)
  const isNew = mTypeId === ""
  const isOpen = mTypeId !== undefined
  useEffect(() => {
    if (mTypeId !== undefined) {
      if (mTypeId === "") {
        form.setFieldsValue({
          id: "",
          icon: "ceshi",
          name: "",
          desc: "",
        })
      } else {
        db?.type.getTypeInfo(mTypeId).then((t) => {
          if (t) {
            form.setFieldsValue({
              id: t.id,
              icon: t.icon,
              name: t.name,
              desc: t.desc,
            })
          }
        })
      }
    }
  }, [db?.type, form, mTypeId])
  const handleCancel = useCallback(() => {
    setMTypeId()
  }, [setMTypeId])
  const handleFinish = useCallback(() => {
    const { id, name, icon, desc } = form.getFieldsValue()
    const typeName = name.trim()
    const typeDesc = desc.trim()
    if (!typeName) {
      message.error("模板名称不能为空")
      return
    }
    if (typeName.length > 32) {
      message.error("模板名称不能超过32个字符")
      return
    }
    if (typeDesc.length > 128) {
      message.error("模板简介不能超过128个字符")
      return
    }
    return db?.type.editType(id, typeName, icon, typeDesc).then((t) => {
      message.success(id === "" ? "创建模板成功" : "修改模板完成")
      setMTypeId()
      id === "" && t && setMTPropTypeId(t.id)
    })
  }, [db?.type, form, message, setMTPropTypeId, setMTypeId])
  // Icon Picker
  // const handleIconSelect = useCallback(
  //   (newIcon: string) => {
  //     form.setFieldValue("icon", newIcon)
  //   },
  //   [form]
  // )
  console.log("Type - Edit - render")
  return (
    <CardModalContainer
      title={isNew ? "新建卡片模板" : "修改卡片模板"}
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={400}
    >
      <Form name="typeEdit" autoComplete="off" form={form} onFinish={handleFinish}>
        <Form.Item name="id" noStyle>
          <Input type="hidden" />
        </Form.Item>
        <Space direction="vertical" size="middle" style={{ width: "100%", paddingTop: 16 }}>
          <Typography.Text strong>模板信息</Typography.Text>
          <Form.Item noStyle>
            <Form.Item name="icon" noStyle>
              <Input type="hidden" />
            </Form.Item>
            {/* <IPicker icon={icon} handleIconSelect={handleIconSelect} /> */}
            <Form.Item name="name" noStyle>
              <Input placeholder="模板名称" />
            </Form.Item>
          </Form.Item>
          <Form.Item name="desc" noStyle>
            <Input.TextArea rows={4} placeholder="模板简介（选填）" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            {isNew ? "新建" : "确认"}
          </Button>
        </Space>
      </Form>
    </CardModalContainer>
  )
})
