import React, { useEffect, useMemo, useRef } from "react"
import { IBubbleMenuPlugin, type IBubbleMenuPluginProps } from "../../extensions"
import { Popover } from "antd"
import styled from "@emotion/styled"
import type { XYPos } from "@/types"

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

type IBubbleMenuProps = Omit<
  Optional<IBubbleMenuPluginProps, "pluginKey" | "setPos">,
  "element"
> & {
  pos?: XYPos
  setPos: React.Dispatch<React.SetStateAction<XYPos | undefined>>
  className?: string
  children: React.ReactNode
  updateDelay?: number
}

export const IBubbleMenu = (props: IBubbleMenuProps) => {
  const { pos, setPos } = props
  const anchorRef = useRef<HTMLDivElement>(null)
  const anchorStyle = useMemo(() => {
    if (!pos) return { top: -100, left: 0 }
    // 父级节点偏移量
    const parentNode = anchorRef.current?.parentElement
    // console.log("test parentNode", [parentNode])
    if (parentNode) {
      const { x, y } = parentNode.getBoundingClientRect()
      return { top: pos.y - y + parentNode.scrollTop - 4, left: pos.x - x }
    } else {
      return { top: pos.y - 4, left: pos.x }
    }
  }, [pos])

  useEffect(() => {
    if (!anchorRef.current) return
    const { pluginKey = "ibubbleMenu", editor, shouldShow } = props
    if (editor.isDestroyed) return
    const plugin = IBubbleMenuPlugin({
      editor,
      element: anchorRef.current,
      setPos,
      pluginKey,
      shouldShow,
    })
    editor.registerPlugin(plugin)
    return () => editor.unregisterPlugin(pluginKey)
  }, [props, setPos])
  // console.log("Render: IBubbleMenu")
  return (
    <Popover
      content={props.children}
      open={!!pos}
      arrow={false}
      placement="top"
      // 菜单内容及其子组件都必须渲染在当前锚点下，才能对弹窗的按钮进行操作
      getPopupContainer={(triggerNode) => triggerNode}
      overlayInnerStyle={{ padding: 8 }}
    >
      <Anchor ref={anchorRef} style={anchorStyle} />
    </Popover>
  )
}
const Anchor = styled("div")({
  position: "absolute",
  width: 0,
  height: 24,
  // backgroundColor: "red",
})
