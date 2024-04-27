import React, { useCallback } from "react"
import { Node, mergeAttributes } from "@tiptap/core"
import { NodeViewWrapper, ReactNodeViewRenderer, NodeViewContent } from "@tiptap/react"
import cc from "classcat"
import { handleBackspace, handleEnter } from "./utils"
import { NODE_MEW_BULLET_LIST, NODE_MIND_LIST_ITEM } from "@/constant"

const MItemNode: React.FC = (props: any) => {
  // console.log("MItemNode", props, props.node.childCount)
  const {
    node: {
      attrs: { coll },
    },
  } = props
  const onClick = useCallback(() => {
    if (props.node.childCount > 1) {
      props.updateAttributes({ coll: !props.node.attrs.coll })
    }
  }, [props])
  return (
    <NodeViewWrapper className={cc(["item", { coll }])}>
      <div className="dot normalBg" onClick={onClick}>
        <div />
      </div>
      <NodeViewContent className="item-content" />
    </NodeViewWrapper>
  )
}

export interface MListItemOptions {
  HTMLAttributes: Record<string, any>
}

export const MindListItem = Node.create<MListItemOptions>({
  name: NODE_MIND_LIST_ITEM,
  content: `paragraph ${NODE_MEW_BULLET_LIST}?`,
  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },
  defining: true,
  parseHTML() {
    return [{ tag: "li" }]
  },
  renderHTML({ HTMLAttributes }) {
    return ["li", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
  // renderHTML({ HTMLAttributes }) {
  //   return [
  //     "li",
  //     { class: HTMLAttributes.coll ? "coll" : "" },
  //     ["div", { class: "dot" }, ["div"]],
  //     ["div", { class: "item" }, 0],
  //   ]
  // },
  // renderHTML({ HTMLAttributes }) {
  //   return ["div", { class: HTMLAttributes.coll ? "coll" : "" }, 0]
  // },
  addAttributes() {
    return { coll: { default: false } }
  },
  addNodeView() {
    return ReactNodeViewRenderer(MItemNode)
  },
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { $from } = editor.state.selection
        // 在 MindListItem 内，且当前 p 为空，且(处于第一层级 或 不是当前层级的最后一项)时，创建下一个同级节点
        if (
          $from.parent.content.size === 0 &&
          editor.isActive(this.name) &&
          ($from.depth <= 3 || $from.node(-2).childCount !== $from.indexAfter(-2))
        ) {
          return handleEnter(editor, this.type)
        } else {
          return editor.commands.splitListItem(this.type)
        }
      },
      // 向后删除字符
      // Delete: ({ editor }) => handleDelete(editor, this.name),
      // "Mod-Delete": ({ editor }) => handleDelete(editor, this.name),
      // 向前删除字符
      Backspace: ({ editor }) => handleBackspace(editor, this.name),
      "Mod-Backspace": ({ editor }) => handleBackspace(editor, this.name),
      Tab: () => this.editor.commands.sinkListItem(this.name),
      "Shift-Tab": () => this.editor.commands.liftListItem(this.name),
    }
  },
})
