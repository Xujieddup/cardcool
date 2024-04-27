import { JSONContent, generateHTML } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Highlight from "@tiptap/extension-highlight"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Link from "@tiptap/extension-link"
import { lowlight } from "lowlight"
import css from "highlight.js/lib/languages/css"
import js from "highlight.js/lib/languages/javascript"
import ts from "highlight.js/lib/languages/typescript"
import html from "highlight.js/lib/languages/xml"
import { ExtCodeBlockLowlight, IImage } from "@/components/editor/extension"
import { STATIC_URL } from "@/config"
import { IMention, NewBulletList, NewListItem } from "./extensions"

lowlight.registerLanguage("html", html)
lowlight.registerLanguage("css", css)
lowlight.registerLanguage("js", js)
lowlight.registerLanguage("ts", ts)

export const getHTML = (json: JSONContent) => {
  if (!json || JSON.stringify(json) === "{}") {
    return ""
  }
  return generateHTML(json, [
    StarterKit.configure({
      codeBlock: false,
    }),
    NewBulletList,
    NewListItem,
    IImage.configure({
      allowBase64: true,
      domain: STATIC_URL,
    }),
    Highlight,
    Link,
    TaskList.configure({
      HTMLAttributes: {
        class: "task",
      },
    }),
    TaskItem.configure({
      nested: true,
    }),
    ExtCodeBlockLowlight.configure({
      lowlight,
    }),
    IMention,
  ])
}

export const getSimpleHTML = (json: JSONContent) => {
  if (!json) {
    return ""
  }
  return generateHTML(json, [StarterKit])
}
