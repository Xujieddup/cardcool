import { XYPos } from "@/types"
import { Editor, isNodeSelection, isTextSelection, posToDOMRect } from "@tiptap/core"
import { EditorState, Plugin, PluginKey } from "@tiptap/pm/state"
import { EditorView } from "@tiptap/pm/view"

export type IBubbleMenuPluginProps = {
  pluginKey: PluginKey | string
  editor: Editor
  element: HTMLElement
  setPos: React.Dispatch<React.SetStateAction<XYPos | undefined>>
  updateDelay?: number
  shouldShow?:
    | ((props: {
        editor: Editor
        view: EditorView
        state: EditorState
        oldState?: EditorState
        from: number
        to: number
      }) => boolean)
    | null
}

type IBubbleMenuViewProps = IBubbleMenuPluginProps & {
  view: EditorView
}

class IBubbleMenuView {
  public editor: Editor

  public element: HTMLElement
  public setPos: React.Dispatch<React.SetStateAction<XYPos | undefined>>

  public view: EditorView

  public updateDelay: number
  // 点击菜单栏按钮触发失去焦点事件的时间戳，最近 100ms 的 setPos 都应该尽快刷新菜单栏样式，避免菜单按钮闪烁问题
  public blurTime = 0

  private updateDebounceTimer: number | undefined

  public shouldShow: Exclude<IBubbleMenuPluginProps["shouldShow"], null> = ({
    view,
    state,
    from,
    to,
  }) => {
    const { doc, selection } = state
    const { empty } = selection

    // Sometime check for `empty` is not enough.
    // Doubleclick an empty paragraph returns a node size of 2.
    // So we check also for an empty text size.
    const isEmptyTextBlock = !doc.textBetween(from, to).length && isTextSelection(state.selection)

    // 点击浮动菜单中的元素时，菜单元素获取焦点，并触发 editor.blur()
    // 这种场景我们需要将菜单作为编辑器的一部分，并且菜单栏保持展示
    const isChildOfMenu = this.element.contains(document.activeElement)

    const hasEditorFocus = view.hasFocus() || isChildOfMenu

    if (!hasEditorFocus || empty || isEmptyTextBlock || !this.editor.isEditable) {
      return false
    }
    return true
  }

  constructor({
    editor,
    element,
    setPos,
    view,
    updateDelay = 350,
    shouldShow,
  }: IBubbleMenuViewProps) {
    this.editor = editor
    this.element = element
    this.setPos = setPos
    this.view = view
    this.updateDelay = updateDelay
    if (shouldShow) {
      this.shouldShow = shouldShow
    }
    this.view.dom.addEventListener("dragstart", this.dragstartHandler)
    this.editor.on("focus", this.focusHandler)
    this.editor.on("blur", this.blurHandler)
  }

  dragstartHandler = () => {
    this.hide()
  }

  focusHandler = () => {
    // we use `setTimeout` to make sure `selection` is already updated
    setTimeout(() => this.update(this.editor.view))
  }

  blurHandler = ({ event }: { event: FocusEvent }) => {
    // console.log("blurHandler event", event)
    if (event.relatedTarget && this.element.contains(event.relatedTarget as Node)) {
      this.blurTime = Date.now()
      return
    }
    this.hide()
  }
  // 编辑器 view 更新就会触发调用
  update(view: EditorView, oldState?: EditorState) {
    const { state } = view
    // console.log("IBubbleMenuView update")
    // 选中一定区块
    const hasValidSelection = state.selection.$from.pos !== state.selection.$to.pos
    if (hasValidSelection && this.updateDelay > 0) {
      this.handleDebouncedUpdate(view, oldState)
      return
    }

    const selectionChanged = !oldState?.selection.eq(view.state.selection)
    const docChanged = !oldState?.doc.eq(view.state.doc)
    this.updateHandler(view, selectionChanged, docChanged, oldState)
  }
  // 逻辑防抖，避免调用频次过高
  handleDebouncedUpdate = (view: EditorView, oldState?: EditorState) => {
    const selectionChanged = !oldState?.selection.eq(view.state.selection)
    const docChanged = !oldState?.doc.eq(view.state.doc)
    // console.log("IBubbleMenuView handleDebouncedUpdate", selectionChanged, docChanged)
    // 选区和文档都未发生变化，则直接返回
    if (!selectionChanged && !docChanged) {
      return
    }
    // 清除之前的延迟的逻辑
    if (this.updateDebounceTimer) {
      clearTimeout(this.updateDebounceTimer)
    }
    let delay = this.updateDelay
    if (Date.now() - this.blurTime < 150) {
      delay = 50
    }
    // 延迟之后处理
    this.updateDebounceTimer = window.setTimeout(() => {
      this.updateHandler(view, selectionChanged, docChanged, oldState)
    }, delay)
  }
  // 实际的更新处理
  updateHandler = (
    view: EditorView,
    selectionChanged: boolean,
    docChanged: boolean,
    oldState?: EditorState
  ) => {
    const { state, composing } = view
    const { selection } = state

    const isSame = !selectionChanged && !docChanged
    // 组合输入(输入中文拼音)，或未发生变更时，直接返回
    if (composing || isSame) {
      return
    }
    // support for CellSelections
    const { ranges } = selection
    const from = Math.min(...ranges.map((range) => range.$from.pos))
    const to = Math.max(...ranges.map((range) => range.$to.pos))
    const shouldShow = this.shouldShow?.({
      editor: this.editor,
      view,
      state,
      oldState,
      from,
      to,
    })
    if (!shouldShow) {
      this.hide()
      return
    }
    let rect = null
    // 选中节点
    if (isNodeSelection(state.selection)) {
      let node = view.nodeDOM(from) as HTMLElement
      const nodeViewWrapper = node.dataset.nodeViewWrapper
        ? node
        : node.querySelector("[data-node-view-wrapper]")
      if (nodeViewWrapper) {
        node = nodeViewWrapper.firstChild as HTMLElement
      }
      rect = node ? node.getBoundingClientRect() : posToDOMRect(view, from, to)
    } else {
      rect = posToDOMRect(view, from, to)
    }
    // console.log("rect test", rect)
    this.setPos({ x: rect.x + rect.width / 2, y: rect.y })
  }
  hide() {
    this.setPos(undefined)
  }
  // 销毁时触发调用
  destroy() {
    // console.log("IBubbleMenuView destroy test")
    this.view.dom.removeEventListener("dragstart", this.dragstartHandler)
    this.editor.off("focus", this.focusHandler)
    this.editor.off("blur", this.blurHandler)
  }
}

export const IBubbleMenuPlugin = (options: IBubbleMenuPluginProps) => {
  return new Plugin({
    // 用于确定 plugin 唯一
    key:
      typeof options.pluginKey === "string" ? new PluginKey(options.pluginKey) : options.pluginKey,
    // 插件与视图交互时，或需设置DOM时使用，插件的 state 与编辑器 view 有关联时触发调用
    view: (view) => new IBubbleMenuView({ view, ...options }),
  })
}
