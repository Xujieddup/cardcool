import { LinkNodeType } from "@/enums"
import { JSONContent } from "@tiptap/react"

// 解析出所有的双链卡片 ID
const getLinkCardId = (docs: JSONContent[], set: Set<string>) => {
  docs.forEach((doc) => {
    if (doc.type === "mention") {
      if (doc.attrs?.id && doc.attrs?.type === LinkNodeType.CARD) {
        set.add(doc.attrs.id)
      }
    } else if (doc.content && doc.content.length > 0) {
      getLinkCardId(doc.content, set)
    }
  })
}
// 解析卡片内容中的双链卡片 ID
export const parseLinkCardId = (doc?: JSONContent) => {
  const set = new Set<string>()
  if (doc && doc.type === "doc" && doc.content) {
    getLinkCardId(doc.content, set)
  }
  return Array.from(set)
}
