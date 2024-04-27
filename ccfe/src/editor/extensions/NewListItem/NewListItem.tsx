import { NODE_MEW_LIST_ITEM } from "@/constant"
import { MindListItem } from "./MindListItem"
import { handleBackspace, handleEnter } from "./utils"

export const NewListItem = MindListItem.extend({
  name: NODE_MEW_LIST_ITEM,
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      Enter: ({ editor }) => {
        const { $from } = editor.state.selection
        // 在 mListItem 内，且当前 p 为空，且不是当前层级的最后一项时，创建下一个同级节点
        if (
          $from.parent.content.size === 0 &&
          editor.isActive(this.name) &&
          $from.node(-2).childCount !== $from.indexAfter(-2)
        ) {
          return handleEnter(editor, this.type)
        } else {
          return editor.commands.splitListItem(this.type)
        }
      },
      Backspace: ({ editor }) => handleBackspace(editor, this.name, false),
      "Mod-Backspace": ({ editor }) => handleBackspace(editor, this.name, false),
    }
  },
})
