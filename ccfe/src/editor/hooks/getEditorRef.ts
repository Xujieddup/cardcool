import { EditorOptions } from "@tiptap/core"
import { Editor } from "@tiptap/react"

export const getEditorRef = (options: Partial<EditorOptions> = {}): Editor | null => {
  console.log("getEditorRef: ")
  const {
    onBeforeCreate,
    onBlur,
    onCreate,
    onDestroy,
    onFocus,
    onSelectionUpdate,
    onTransaction,
    onUpdate,
  } = options
  const editor = new Editor(options)
  if (onBeforeCreate) {
    editor.on("beforeCreate", onBeforeCreate)
  }
  if (onBlur) {
    editor.on("blur", onBlur)
  }
  if (onCreate) {
    editor.on("create", onCreate)
  }
  if (onDestroy) {
    editor.on("destroy", onDestroy)
  }
  if (onFocus) {
    editor.on("focus", onFocus)
  }
  if (onSelectionUpdate) {
    editor.on("selectionUpdate", onSelectionUpdate)
  }
  if (onTransaction) {
    editor.on("transaction", onTransaction)
  }
  if (onUpdate) {
    editor.on("update", onUpdate)
  }
  return editor
}
