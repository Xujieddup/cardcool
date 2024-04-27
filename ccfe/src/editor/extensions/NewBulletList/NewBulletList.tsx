import { NODE_MEW_BULLET_LIST, NODE_MEW_LIST_ITEM } from "@/constant"
import { BulletList } from "@tiptap/extension-bullet-list"

export const NewBulletList = BulletList.extend({
  name: NODE_MEW_BULLET_LIST,
  priority: 200,
  addOptions() {
    return {
      ...this.parent?.(),
      itemTypeName: NODE_MEW_LIST_ITEM,
      HTMLAttributes: { class: "nbl" },
    }
  },
})
