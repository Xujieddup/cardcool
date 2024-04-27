import { Node, nodeInputRule } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { ImgPlaceholder } from "./ImgPlaceholder"

export interface ImagePlaceholderOptions {
  inline: boolean
  HTMLAttributes: Record<string, any>
}

export const inputRegex = /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/

export const ImagePlaceholder = Node.create<ImagePlaceholderOptions>({
  name: "imagePlaceholder",
  draggable: false,

  addOptions() {
    return {
      inline: false,
      HTMLAttributes: {},
    }
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? "inline" : "block"
  },

  addAttributes() {
    return {
      uploadId: {
        default: "",
      },
      width: {
        default: undefined,
      },
    }
  },

  parseHTML() {
    return [{ tag: "image-placeholder" }]
  },

  renderHTML() {
    return ["div"]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImgPlaceholder)
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => {
          const [, , uploadId] = match

          return { uploadId }
        },
      }),
    ]
  },
})
