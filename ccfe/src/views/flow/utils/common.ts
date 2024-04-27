import { KeyboardEvent as ReactKeyboardEvent } from "react"

const isReactKeyboardEvent = (
  event: KeyboardEvent | ReactKeyboardEvent
): event is ReactKeyboardEvent => "nativeEvent" in event

// 判断是否是 Input 对象
export const isInputDOMNode = (event: KeyboardEvent | ReactKeyboardEvent): boolean => {
  const kbEvent = isReactKeyboardEvent(event) ? event.nativeEvent : event
  // using composed path for handling shadow dom
  const target = (kbEvent.composedPath?.()?.[0] || event.target) as HTMLElement

  let isInput = ["INPUT", "SELECT", "TEXTAREA"].includes(target?.nodeName)
  if (!isInput) {
    if (target?.hasAttribute("contenteditable")) {
      if ((target as any)?.editor) {
        if ((target as any)?.editor?.options?.editable) {
          isInput = true
        }
      } else {
        isInput = true
      }
    }
  }
  // const isInput =
  //   ["INPUT", "SELECT", "TEXTAREA"].includes(target?.nodeName) ||
  //   target?.hasAttribute("contenteditable")

  // when an input field is focused we don't want to trigger deletion or movement of nodes
  return isInput || !!target?.closest(".nokey")
}
