import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"

export const ExtCodeBlockLowlight = CodeBlockLowlight.extend({
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      Tab: () => {
        if (this.editor.isActive("codeBlock")) {
          return this.editor.commands.insertContent("    ")
        }
        return false
      },
    }
  },
})
