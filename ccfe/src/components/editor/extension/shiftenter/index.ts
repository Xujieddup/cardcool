import { Extension } from "@tiptap/core"

// 白板-编辑导图节点和图形节点时，Enter 除非失去焦点事件，Shift+Enter触发换行
export const ShiftEnter = Extension.create({
  name: "shiftenter",
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        // 过滤代码块中按 Enter 键
        // console.log(
        //   "Enter editor",
        //   this.editor.state,
        //   (this.editor.state as any).mention$,
        //   (this.editor.state as any).lowlight$,
        //   this.editor.isActive("mentions"),
        //   this.editor.isActive("imention"),
        //   this.editor.isActive("mention"),
        //   this.editor.isActive("mention$"),
        //   this.editor.isActive("codeBlock"),
        //   this.editor.isActive("lowlight$")
        // )
        // 过滤掉代码块中或引用选项中按 Enter
        if (this.editor.isActive("codeBlock") || (this.editor.state as any).mention$?.active) {
          return false
        }
        return this.editor.commands.blur()
      },
      "Shift-Enter": () =>
        this.editor.commands.first(({ commands }) => [
          () => commands.newlineInCode(),
          () => commands.createParagraphNear(),
          () => commands.liftEmptyBlock(),
          () => commands.splitBlock(),
        ]),
    }
  },
})
