import { Extensions } from "@tiptap/react"
import { Paragraph } from "@tiptap/extension-paragraph"
import { Text } from "@tiptap/extension-text"
import { IMention, MDocument, MindListItem, NewBulletList, suggestion } from "."
import { NODE_MIND_LIST_ITEM } from "@/constant"

export const MDocExtensions: Extensions = [
  MDocument,
  NewBulletList.configure({ itemTypeName: NODE_MIND_LIST_ITEM }),
  MindListItem,
  Paragraph,
  Text,
  IMention.configure({ suggestion }),
]
