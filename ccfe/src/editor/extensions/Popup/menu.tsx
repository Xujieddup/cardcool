import React, { forwardRef, useCallback, useMemo } from "react"
import { MenuProps, Typography } from "antd"
import type { Command, DDMenuProps } from "@/types"
import { IFlexR } from "@/ui"
import { NIcon } from "@/icons"
import { PopupBase } from "./base"

// props 参数实际上是 new ReactRenderer(PopupMenu, { props, editor: props.editor }) 中的 props 值
export const PopupMenu = forwardRef((props: DDMenuProps, ref) => {
  const { command, clientRect, items: groups } = props
  const menus: MenuProps["items"] = useMemo(
    () =>
      groups.map((g) => ({
        key: g.name,
        type: "group",
        label: g.title,
        children: g.commands.map((c) => ({
          key: c.name,
          label: (
            <IFlexR>
              <NIcon icon={c.icon} />
              <Typography.Text className="flexPlace" ellipsis>
                {c.label}
              </Typography.Text>
              {c.aliases?.length && (
                <Typography.Text type="secondary">{c.aliases[0]}</Typography.Text>
              )}
            </IFlexR>
          ),
        })),
      })),
    [groups]
  )
  const selectItem = useCallback(
    (key: string) => {
      let item: Command | undefined = undefined
      for (let i = 0; i < groups.length; i++) {
        item = groups[i].commands.find((c) => c.name === key)
        if (item) break
      }
      if (item) command(item)
    },
    [groups, command]
  )
  // console.log("Render: PopupMenu")
  const rect = clientRect?.()
  if (!rect) return null
  return (
    <PopupBase ref={ref} x={rect.x} y={rect.y} menus={menus} isGroupMenu selectItem={selectItem} />
  )
})
