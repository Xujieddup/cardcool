import React, { memo, useCallback, useEffect, useMemo, useState } from "react"
import styled from "@emotion/styled"
import { IFlexRB } from "@/ui"
import { Button, Input, Popover, Typography } from "antd"
import { Editor, EditorContent } from "@tiptap/react"
import { initValue } from "@/config"
import { CardExtensions, TextMenu } from "@/editor"

type Props = {
  value?: any
  onChange?: (value: any) => void
}
export const DefaultContent = memo(({ value, onChange }: Props) => {
  const [open, setOpen] = useState(false)
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }
  const editor = useMemo(() => new Editor({ extensions: CardExtensions("内容模板...") }), [])
  const content = value || initValue
  useEffect(() => {
    console.log("editorRef update", content)
    editor?.commands.setContent(content)
  }, [editor, content])
  const saveDefault = useCallback(() => {
    let cont = null
    if (editor && editor.getText() !== "") {
      cont = editor.getJSON()
    }
    onChange?.(cont)
    setOpen(false)
  }, [editor, onChange])
  const placeholder = value ? "修改内容模板" : "设置内容模板"
  console.log("Render: RuleWrapper")
  return (
    <Popover
      title={
        <IFlexRB>
          <Typography.Text strong>内容模板</Typography.Text>
          <Button onClick={saveDefault} size="small" type="primary">
            保存
          </Button>
        </IFlexRB>
      }
      content={
        <EditorBox>
          <EditorContent editor={editor} spellCheck={false} />
          {editor && <TextMenu editor={editor} />}
        </EditorBox>
      }
      trigger="click"
      placement="bottomRight"
      open={open}
      arrow={false}
      onOpenChange={handleOpenChange}
      overlayInnerStyle={{ padding: 8 }}
    >
      <Input value={placeholder} onClick={() => setOpen(true)} readOnly />
    </Popover>
  )
})

const EditorBox = styled("div")({
  width: 228,
  height: 240,
  overflowY: "auto",
  position: "relative",
})
