import React, { useCallback } from "react"
import Mention from "@tiptap/extension-mention"
import { NodeViewWrapper, ReactNodeViewRenderer, mergeAttributes } from "@tiptap/react"
import { Typography } from "antd"
import { IIcon } from "@/icons"
import { SMCardId, useModelStore } from "@/store"
import { useHistory } from "react-router-dom"
import { LinkNodeType } from "@/enums"

const cardSelector: SMCardId = (state) => state.setMCardId

const MentionNode = (props: any) => {
  // console.log("MentionNode", props)
  const history = useHistory()
  const setMCardId = useModelStore(cardSelector)
  const {
    node: {
      attrs: { id, label, type, icon },
    },
  } = props
  const onClick = useCallback(() => {
    if (id) {
      if (type === LinkNodeType.CARD) {
        setMCardId(id)
      } else if (type === LinkNodeType.VIEW) {
        history.push("/_/" + id)
      }
    }
  }, [history, id, setMCardId, type])
  return (
    <NodeViewWrapper as="span">
      <Typography.Link className={"mention type" + type} onClick={onClick}>
        <IIcon icon={icon} />
        {label}
      </Typography.Link>
    </NodeViewWrapper>
  )
}

export const IMention = Mention.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      type: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-type"),
        renderHTML: (attributes) => {
          if (!attributes.type) {
            return {}
          }
          return {
            "data-type": attributes.type,
          }
        },
      },
      icon: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-icon"),
        renderHTML: (attributes) => {
          if (!attributes.icon) {
            return {}
          }
          return {
            "data-icon": attributes.icon,
          }
        },
      },
    }
  },
  // renderHTML({ node, HTMLAttributes }) {
  //   return [
  //     "a",
  //     mergeAttributes(
  //       { "data-type": this.name, class: "mention type" + node.attrs.type },
  //       HTMLAttributes
  //     ),
  //     [
  //       "span",
  //       { role: "img", class: "anticon iicon ifont" },
  //       [
  //         "svg",
  //         { width: "1em", height: "1em", fill: "currentColor" },
  //         ["use", { "xlink:href": "#icon-card" }],
  //       ],
  //     ],
  //     ["span", node.attrs.label],
  //   ]
  // },
  addNodeView() {
    return ReactNodeViewRenderer(MentionNode)
  },
})
