import type { NodeType } from "@tiptap/pm/model"
import { TextSelection, type EditorState } from "@tiptap/pm/state"
import { type Editor, isAtStartOfNode } from "@tiptap/core"

export const handleEnter = (editor: Editor, type: NodeType) => {
  return editor
    .chain()
    .command(({ state, tr }) => {
      const { $from } = state.selection
      // 内容为空，直接创建下一个子节点，跳过后续逻辑（非第一层的最后一项，需自动向上提升层级）
      const nextType = $from.node(-1).contentMatchAt(0).defaultType
      const types = nextType ? [{ type }, { type: nextType }] : [{ type }]
      console.log("types", types)
      tr.split($from.pos, 2, types).scrollIntoView()
      return true
    })
    .run()
}

// 向前找到 paragraph 节点的 pos
export const findPrevParagraph = (state: EditorState, pos: number) => {
  while (pos > 0) {
    if (state.doc.resolve(pos).node().type.name === "paragraph") {
      return pos
    }
    pos -= 2
  }
  return 0
}

// forbidDeleteFirstItem 表示是否禁止删除 doc>ul中的第一个li
export const handleBackspace = (editor: Editor, typeName: string, forbidDeleteFirstItem = true) => {
  // 光标没在节点开始，则不进行特殊处理: $from.parentOffset === 0 && $from.pos === $to.pos
  if (!isAtStartOfNode(editor.state)) return false
  if (!editor.isActive(typeName)) return false
  // 特殊处理：将光标及之后的文本，拼接到之前的最后一个最底层的 item，将当前的子 list 作为最底层的下一级
  // <p>xx</p><ol><li><p>1x2</p></li>{n}</ol> 合并到上一级的 <p>aa</p>
  const { $anchor } = editor.state.selection
  const grandParent = $anchor.node(-1)
  // console.log("grandParent", grandParent)
  const from = $anchor.pos
  const to = grandParent.content.size + from - 1
  // 光标所在 p 为 ul 的第一个 li 中
  if ($anchor.node(-2).firstChild === grandParent) {
    // doc 下第一个 ul 的第一个 li，则直接返回
    if ($anchor.depth <= 3) {
      return forbidDeleteFirstItem
    } else {
      return editor
        .chain()
        .command(({ state, tr }) => {
          const contentSlice = state.doc.slice(from, to)
          tr.deleteRange(from - 2, to + 1)
          tr.replace(from - 4, from - 3, contentSlice)
          tr.setSelection(new TextSelection(tr.doc.resolve(from - 4)))
          return true
        })
        .run()
    }
  } else {
    // 当前光标所在 li 非第一个，则将当前 li 的内容转移到前一个 li 的最深层 p
    const prevParagraphPos = findPrevParagraph(editor.state, from - 4)
    if (prevParagraphPos > 0) {
      return editor
        .chain()
        .command(({ state, tr }) => {
          const contentSlice = state.doc.slice(from, to)
          tr.deleteRange(from - 2, to + 1)
          tr.replace(prevParagraphPos, prevParagraphPos + 1, contentSlice)
          tr.setSelection(new TextSelection(tr.doc.resolve(prevParagraphPos)))
          return true
        })
        .run()
    }
  }
  return false
}
