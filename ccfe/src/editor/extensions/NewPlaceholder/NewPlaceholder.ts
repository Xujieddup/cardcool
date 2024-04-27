import Placeholder from "@tiptap/extension-placeholder"

export const NewPlaceholder = Placeholder.extend({
  addStorage() {
    return {
      text: "",
    }
  },
})
