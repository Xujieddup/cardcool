import React, { memo, useCallback, useState } from "react"
import { App, Input, Modal } from "antd"
import { EditStyleName } from "@/types"

type Props = {
  editStyleName: EditStyleName
  setEditStyleName: React.Dispatch<React.SetStateAction<EditStyleName | undefined>>
  changeName: (id: string, name: string) => void
}
let styleName: EditStyleName | null = null
export const StyleName = memo(({ editStyleName, setEditStyleName, changeName }: Props) => {
  const { message } = App.useApp()
  const [name, setName] = useState("")
  let realName = name
  if (styleName !== editStyleName) {
    styleName = editStyleName
    realName = editStyleName.name
  }
  const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setName(e.target.value)
  }, [])
  const handleOk = () => {
    const n = name.trim()
    if (!n) {
      message.error("名称不能为空")
      return
    }
    changeName(editStyleName.id, n)
  }
  const handleCancel = useCallback(() => {
    setEditStyleName(undefined)
  }, [setEditStyleName])
  console.log("Render: StyleName")
  return (
    <Modal
      title="样式名称"
      open={true}
      onOk={handleOk}
      onCancel={handleCancel}
      closable={false}
      width={300}
    >
      <Input value={realName} onChange={onChange} className="mt-4 mb-4" placeholder="样式名称..." />
    </Modal>
  )
})
