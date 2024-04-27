import type { Editor as CoreEditor } from "@tiptap/core"
import { Editor } from "@tiptap/react"
import { EditorState } from "@tiptap/pm/state"
import { EditorView } from "@tiptap/pm/view"
import { icons } from "lucide-react"

export type SuggestionProps<I = any> = {
  editor: CoreEditor
  range: Range
  query: string
  text: string
  items: I[]
  command: (props: I) => void
  decorationNode: Element | null
  clientRect?: (() => DOMRect | null) | null
}

// 菜单分组
export type MenuGroup = {
  name: string
  title: string
  commands: Command[]
}
export type Command = {
  name: string
  label: string
  aliases?: string[]
  icon: keyof typeof icons
  action: (editor: CoreEditor) => void
  shouldBeHidden?: (editor: CoreEditor, options?: GroupOptions) => boolean
  isEnabled?: boolean
}

export type GroupOptions = {
  settings: string
}

export type DDMenuProps = {
  editor: CoreEditor
  items: MenuGroup[]
  command: (command: Command) => void
  clientRect?: (() => DOMRect | null) | null
}

// TextMenu
export type MenuProps = {
  editor: Editor
  appendTo?: React.RefObject<any>
  shouldHide?: boolean
}
export type ShouldShowProps = {
  editor?: CoreEditor
  view: EditorView
  state?: EditorState
  oldState?: EditorState
  from?: number
  to?: number
}
