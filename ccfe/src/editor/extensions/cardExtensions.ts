import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Typography from "@tiptap/extension-typography"
import Highlight from "@tiptap/extension-highlight"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import {
  ImageUploadExtension,
  ImagePlaceholder,
  IImage,
  ExtCodeBlockLowlight,
} from "@/components/editor/extension"
import { lowlight } from "lowlight"
import css from "highlight.js/lib/languages/css"
import js from "highlight.js/lib/languages/javascript"
import ts from "highlight.js/lib/languages/typescript"
import html from "highlight.js/lib/languages/xml"
import { uploadImage } from "@/services"
import { STATIC_URL } from "@/config"
import { IMention, NewBulletList, NewListItem, NewPlaceholder, suggestion } from "."
import { Extensions } from "@tiptap/react"

lowlight.registerLanguage("html", html)
lowlight.registerLanguage("css", css)
lowlight.registerLanguage("js", js)
lowlight.registerLanguage("ts", ts)

export const CardExtensions = (placeholder = "卡片内容"): Extensions => [
  StarterKit.configure({
    codeBlock: false,
  }),
  Highlight,
  NewBulletList,
  NewListItem,
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
  NewPlaceholder.configure({
    placeholder: ({ editor }) => editor.storage?.placeholder?.text || placeholder,
    showOnlyWhenEditable: false,
  }),
]
