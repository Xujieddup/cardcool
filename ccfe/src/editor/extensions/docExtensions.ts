import { Blockquote } from "@tiptap/extension-blockquote"
import { Bold } from "@tiptap/extension-bold"
import { Code } from "@tiptap/extension-code"
import { Dropcursor } from "@tiptap/extension-dropcursor"
import { Gapcursor } from "@tiptap/extension-gapcursor"
import { HardBreak } from "@tiptap/extension-hard-break"
import { Heading } from "@tiptap/extension-heading"
import { History } from "@tiptap/extension-history"
import { HorizontalRule } from "@tiptap/extension-horizontal-rule"
import { Italic } from "@tiptap/extension-italic"
import { ListItem } from "@tiptap/extension-list-item"
import { OrderedList } from "@tiptap/extension-ordered-list"
import { Paragraph } from "@tiptap/extension-paragraph"
import { Strike } from "@tiptap/extension-strike"
import { Text } from "@tiptap/extension-text"
import { Extensions } from "@tiptap/react"
import {
  ExtCodeBlockLowlight,
  IImage,
  ImagePlaceholder,
  ImageUploadExtension,
} from "@/components/editor/extension"
import {
  // CharacterCount,
  // Color,
  Document,
  // Heading,
  Highlight,
  // HorizontalRule,
  // ImageBlock,
  Link,
  Placeholder,
  Typography,
  Underline,
  // emojiSuggestion,
  // Columns,
  // Column,
  TaskItem,
  TaskList,
  SlashCommand,
  IMention,
  suggestion,
  NewBulletList,
  NewListItem,
} from "."
// import { ImageUpload } from "./ImageUpload"
// import { TableOfContentNode } from "./TableOfContentNode"
import { lowlight } from "lowlight"
import { STATIC_URL } from "@/config"
import { uploadImage } from "@/services"

export const DocExtensions: Extensions = [
  Document,
  Paragraph,
  Text,
  History,
  SlashCommand,
  Heading,
  NewBulletList,
  NewListItem,
  OrderedList,
  ListItem,
  TaskList.configure({
    HTMLAttributes: { class: "task" },
  }),
  TaskItem.configure({
    nested: true,
  }),
  ExtCodeBlockLowlight.configure({
    lowlight,
  }),
  Blockquote,
  HorizontalRule,
  // 行内标签
  Bold,
  Italic,
  Underline,
  Strike,
  Code,
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
  Placeholder.configure({
    placeholder: "文档内容（斜杠 / 唤起命令）...",
    showOnlyWhenEditable: false,
  }),

  Dropcursor,
  Gapcursor,
  HardBreak,
  Highlight,
  Typography,
  Link,
  // Columns,
  // Column,
  // Selection,
  // EmbedInput,
  // CodeBlockLowlight.configure({
  //   lowlight,
  //   defaultLanguage: null,
  // }),
  // TextStyle,
  // FontSize,
  // FontFamily,
  // Color,
  // TrailingNode,
  // Link.configure({
  //   openOnClick: false,
  // }),
  // Highlight.configure({ multicolor: true }),

  // IMention.configure({
  //   suggestion,
  // }),
  // CharacterCount.configure({ limit: 50000 }),
  // TableOfContent,
  // TableOfContentNode,
  // ImageUpload.configure({
  //   clientId: provider?.document?.clientID,
  // }),
  // ImageBlock,
  // FileHandler.configure({
  //   allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
  //   onDrop: (currentEditor, files, pos) => {
  //     files.forEach(async () => {
  //       const url = await API.uploadImage()
  //       currentEditor.chain().setImageBlockAt({ pos, src: url }).focus().run()
  //     })
  //   },
  //   onPaste: (currentEditor, files) => {
  //     files.forEach(async () => {
  //       const url = await API.uploadImage()
  //       return currentEditor
  //         .chain()
  //         .setImageBlockAt({ pos: currentEditor.state.selection.anchor, src: url })
  //         .focus()
  //         .run()
  //     })
  //   },
  // }),
  // Emoji.configure({
  //   enableEmoticons: true,
  //   suggestion: emojiSuggestion,
  // }),
  // TextAlign.extend({
  //   addKeyboardShortcuts() {
  //     return {}
  //   },
  // }).configure({
  //   types: ["heading", "paragraph"],
  // }),
  // Subscript,
  // Superscript,
  // Table,
  // TableCell,
  // TableHeader,
  // TableRow,
  // Typography,
  // Placeholder.configure({
  //   includeChildren: true,
  //   showOnlyCurrent: false,
  //   placeholder: () => "",
  // }),

  // Focus,
  // Figcaption,
  // BlockquoteFigure,
  // Dropcursor.configure({
  //   width: 2,
  //   class: "ProseMirror-dropcursor border-black",
  // }),
]
