import React, { memo } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import Document from "@tiptap/extension-document"
import Paragraph from "@tiptap/extension-paragraph"
import Text from "@tiptap/extension-text"
import Placeholder from "@tiptap/extension-placeholder"
import { Extension } from "@tiptap/core"

// 白板-编辑边时，Enter 触发失去焦点事件，Shift+Enter触发换行\n
const GroupEnter = Extension.create({
  name: "groupenter",
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        // 过滤掉代码块中或引用选项中按 Enter
        if (this.editor.isActive("codeBlock") || (this.editor.state as any).mention$?.active) {
          return false
        }
        return this.editor.commands.blur()
      },
    }
  },
})

type Props = {
  config: any
}
const extensions = [
  Document,
  Paragraph,
  Text,
  // HardBreak,
  GroupEnter,
  Placeholder.configure({ placeholder: "分组名" }),
]

export const GroupEditor = memo(({ config }: Props) => {
  const editor = useEditor({ extensions, ...config })
  // 每次输入会刷新一次，onUpdate 触发 onChange 更新 value 重新刷新一次
  console.log("Render: GroupEditor")
  return <EditorContent editor={editor} spellCheck={false} className="editorBox" />
})
