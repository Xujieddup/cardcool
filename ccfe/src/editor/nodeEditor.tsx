import React, { memo } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import Typography from "@tiptap/extension-typography"
import Highlight from "@tiptap/extension-highlight"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import {
  ImageUploadExtension,
  ImagePlaceholder,
  IImage,
  ShiftEnter,
  ExtCodeBlockLowlight,
} from "@/components/editor/extension"
import { lowlight } from "lowlight"
import css from "highlight.js/lib/languages/css"
import js from "highlight.js/lib/languages/javascript"
import ts from "highlight.js/lib/languages/typescript"
import html from "highlight.js/lib/languages/xml"
import { uploadImage } from "@/services"
import { STATIC_URL } from "@/config"
import { IMention, suggestion } from "./extensions"

lowlight.registerLanguage("html", html)
lowlight.registerLanguage("css", css)
lowlight.registerLanguage("js", js)
lowlight.registerLanguage("ts", ts)

type Props = {
  config: any
  useShiftEnter?: boolean
}
const extensions = [
  StarterKit.configure({
    codeBlock: false,
    hardBreak: false,
    heading: {
      levels: [1, 2, 3, 4],
    },
  }),
  Highlight,
  TaskList.configure({
    HTMLAttributes: {
      class: "task",
    },
  }),
  TaskItem.configure({
    nested: true,
  }),
  IMention.configure({
    suggestion,
  }),
  IImage.configure({
    allowBase64: true,
    domain: STATIC_URL,
  }),
  ImageUploadExtension.configure({
    acceptMimes: ["image/jpeg", "image/gif", "image/png", "image/jpg"],
    ignoreDomains: [STATIC_URL],
    upload: async (file: File) => {
      // console.log("upload file", file)
      return uploadImage(file).then((url) => {
        console.log("uploadImage url", url)
        return url
      })
    },
  }),
  ImagePlaceholder.configure({
    inline: false,
  }),
  ExtCodeBlockLowlight.configure({
    lowlight,
  }),
  Link,
  Typography,
  Placeholder.configure({
    placeholder: "输入文字",
    showOnlyWhenEditable: false,
  }),
]
const extensions2 = [...extensions, ShiftEnter]

// 白板节点编辑器
export const NodeEditor = memo(({ config, useShiftEnter }: Props) => {
  const editor = useEditor({
    extensions: useShiftEnter ? extensions2 : extensions,
    ...config,
  })
  // 每次输入会刷新一次，onUpdate 触发 onChange 更新 value 重新刷新一次
  console.log("Render: IEditor")
  return <EditorContent editor={editor} spellCheck={false} className="editorBox" />
})
