import { Editor, Extension } from "@tiptap/core"
import { ReactRenderer } from "@tiptap/react"
import Suggestion from "@tiptap/suggestion"
import { PluginKey } from "@tiptap/pm/state"

import { menuGroups } from "./groups"
import { PopupMenu } from "../Popup"
import { MenuGroup } from "@/types"

const extensionName = "slashCommand"

export const SlashCommand = Extension.create({
  name: extensionName,

  priority: 200,

  addOptions() {
    return {
      settings: {},
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        allowSpaces: true,
        startOfLine: true,
        pluginKey: new PluginKey(extensionName),
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from)
          const isRootDepth = $from.depth === 1
          const isParagraph = $from.parent.type.name === "paragraph"
          const isStartOfNode = $from.parent.textContent?.charAt(0) === "/"
          // TODO
          const isInColumn = this.editor.isActive("column")

          const afterContent = $from.parent.textContent?.substring(
            $from.parent.textContent?.indexOf("/")
          )
          const isValidAfterContent = !afterContent?.endsWith("  ")

          return (
            ((isRootDepth && isParagraph && isStartOfNode) ||
              (isInColumn && isParagraph && isStartOfNode)) &&
            isValidAfterContent
          )
        },
        command: ({ editor, props }: { editor: Editor; props: any }) => {
          const { view, state } = editor
          const { $head, $from } = view.state.selection

          const end = $from.pos
          const from = $head?.nodeBefore
            ? end -
              ($head.nodeBefore.text?.substring($head.nodeBefore.text?.indexOf("/")).length ?? 0)
            : $from.start()

          const tr = state.tr.deleteRange(from, end)
          view.dispatch(tr)

          props.action(editor)
          view.focus()
        },
        items: ({ query }: { query: string }) => {
          const groups: MenuGroup[] = menuGroups.map((group) => ({
            ...group,
            commands: group.commands.filter((item) => {
              const queryNormalized = query.toLowerCase().trim()
              const matchAlias = item.aliases
                ? item.aliases.some((a) => a.startsWith(queryNormalized))
                : false
              return matchAlias
              // if (matchAlias) return true
              // return item.label.includes(queryNormalized)
            }),
            // .filter((command) =>
            //   command.shouldBeHidden
            //     ? !command.shouldBeHidden(this.editor, {
            //         settings: this.options.settings,
            //       })
            //     : true
            // ),
          }))
          const withoutEmptyGroups = groups.filter((group) => group.commands.length > 0)
          // const withEnabledSettings = withoutEmptyGroups.map((group) => ({
          //   ...group,
          //   commands: group.commands.map((command) => ({
          //     ...command,
          //     isEnabled: true,
          //   })),
          // }))
          // console.log("withEnabledSettings", withEnabledSettings)
          return withoutEmptyGroups
        },
        render: () => {
          let component: any = null
          return {
            // 输入 @ 触发，且只触发一次
            onStart: (props) => {
              // console.log("suggestion onStart", props)
              component = new ReactRenderer(PopupMenu, { editor: props.editor, props })
              document.body.append(component.element)
            },
            onUpdate(props) {
              // console.log("suggestion onUpdate", props)
              component?.updateProps(props)
            },
            onKeyDown(props) {
              const event = props.event as KeyboardEvent
              event.stopPropagation()
              // console.log("suggestion onKeyDown", props, event, component)
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
            onExit() {
              // console.log("suggestion onExit")
              if (component) {
                component.destroy()
                component.element.remove()
                component = null
              }
            },
          }
        },
      }),
    ]
  },
})
