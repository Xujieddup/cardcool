import React, { memo, useCallback, useEffect } from "react"
import { App, Button, Form, Input, Space } from "antd"
import { CardModalContainer } from "@/components/ui"
import { useDBStore } from "@/store"
import type { GetDB } from "@/store"
import { EditTag } from "@/types"
import { PresetColorPicker } from "@/components/color"
import { useWatch } from "antd/es/form/Form"

const dbSelector: GetDB = (state) => state.db

type Props = {
  editTag: EditTag
  setEditTag: React.Dispatch<React.SetStateAction<EditTag | undefined>>
}

export const TagEdit = memo(({ editTag, setEditTag }: Props) => {
  const db = useDBStore(dbSelector)
  const { message } = App.useApp()
  const [form] = Form.useForm<EditTag>()
  useEffect(() => {
    form.setFieldsValue({
      id: editTag.id,
      name: editTag.name,
      color: editTag.color,
    })
  }, [form, editTag])
  const color = useWatch("color", form)
  const setColorType = useCallback(
    (color: string) => {
      form.setFieldValue("color", color)
    },
    [form]
  )
  const handleCancel = useCallback(() => {
    setEditTag(undefined)
  }, [setEditTag])
  const handleFinish = useCallback(() => {
    const { id, name, color } = form.getFieldsValue()
    const tagName = name.trim()
    if (!tagName) {
      message.error("标签名称不能为空")
      return
    }
    if (tagName.length > 32) {
      message.error("标签名称不能超过32个字符")
      return
    }
    return db?.tag.editTag(id, tagName, color).then(() => {
      message.success("修改标签完成")
      setEditTag(undefined)
    })
  }, [db?.tag, form, message, setEditTag])
  console.log("Type - Edit - render")
  return (
    <CardModalContainer
      title="编辑卡片标签"
      open={true}
      onCancel={handleCancel}
      footer={null}
      width={300}
    >
      <Form name="tagEdit" autoComplete="off" form={form} onFinish={handleFinish}>
        <Form.Item name="id" noStyle>
          <Input type="hidden" />
        </Form.Item>
        <Space direction="vertical" size="middle" style={{ width: "100%", paddingTop: 16 }}>
          <Form.Item noStyle>
            <Form.Item name="color" noStyle>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item name="name" noStyle>
              <Input
                prefix={<PresetColorPicker colorType={color} setColorType={setColorType} />}
                placeholder="卡片标签名称"
                style={{ padding: "3px 6px" }}
              />
            </Form.Item>
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            确认
          </Button>
        </Space>
      </Form>
    </CardModalContainer>
  )
})
