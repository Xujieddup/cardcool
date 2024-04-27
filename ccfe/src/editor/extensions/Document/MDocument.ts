import { NODE_MEW_BULLET_LIST } from "@/constant"
import { Node } from "@tiptap/core"

export const MDocument = Node.create({
  name: "doc",
  topNode: true,
  content: NODE_MEW_BULLET_LIST,
})
