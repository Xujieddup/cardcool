import { ReactRenderer } from "@tiptap/react"
import { MentionOptions } from "@tiptap/extension-mention"
import { PopupMention } from "../Popup"

export const suggestion: MentionOptions["suggestion"] = {
  render: () => {
    let component: any = null
    return {
      // 输入 @ 触发，且只触发一次
      onStart: (props) => {
        console.log("suggestion onStart", props)
        component = new ReactRenderer(PopupMention, { editor: props.editor, props })
        document.body.append(component.element)
      },
      // 等待 items 返回数据之后才会触发
      onUpdate(props) {
        console.log("suggestion onUpdate", props)
        component?.updateProps(props)
      },
      // 每次按下键盘触发
      onKeyDown(props) {
        const event = props.event as KeyboardEvent
        event.stopPropagation()
        console.log("suggestion onKeyDown", props, event, component)
        if (component) {
          if (event.key === "Escape") {
            component.destroy()
            component.element.remove()
            component = null
            return true
          } else if (
            event.key === "ArrowUp" ||
            event.key === "ArrowDown" ||
            event.key === "Enter"
          ) {
            return component.ref?.onKeyDown(props)
          }
        }
        return false
      },
      // 结束时触发
      onExit() {
        console.log("suggestion onExit")
        if (component) {
          component.destroy()
          component.element.remove()
          component = null
        }
      },
    }
  },
}
