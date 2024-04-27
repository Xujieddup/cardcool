import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from "react"
import { Dropdown, MenuProps } from "antd"
import styled from "@emotion/styled"
import type { MenuItemGroupType } from "antd/es/menu/hooks/useItems"

type Props = {
  menus: MenuProps["items"]
  isGroupMenu?: boolean
  x: number
  y: number
  selectItem: (key: string) => void
}

export const PopupBase = forwardRef((props: Props, ref) => {
  const { x, y, menus, isGroupMenu, selectItem } = props
  const [activeKey, setActiveKey] = useState("")
  const keys = useMemo(() => {
    let keys: string[] = []
    if (menus?.length) {
      // 分组菜单
      if (isGroupMenu) {
        for (let i = 0; i < menus.length; i++) {
          ;(menus[i] as MenuItemGroupType).children?.forEach((i) => {
            if (i) keys.push(i.key as string)
          })
        }
      } else {
        keys = menus.map((m) => m?.key as string)
      }
    }
    setActiveKey(keys.length ? keys[0] : "")
    return keys
  }, [isGroupMenu, menus])
  const arrowItem = useCallback(
    (isUp: boolean) => {
      setActiveKey((oldKey) => {
        const len = keys.length
        const idx = len > 0 ? keys.findIndex((k) => k == oldKey) : -1
        return idx === -1 ? "" : keys[(len + idx + (isUp ? -1 : 1)) % len]
      })
    },
    [keys]
  )
  const onClick: MenuProps["onClick"] = useCallback(
    ({ key }: { key: string }) => selectItem(key),
    [selectItem]
  )
  useImperativeHandle(ref, () => ({
    // 参考: https://github.com/react-component/select/blob/930b6fc21ca4ae5f01a084b04bfd641a70b3185a/src/OptionList.tsx#L165
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      // console.log("mention event", event)
      if (event.key === "ArrowUp") {
        arrowItem(true)
        return true
      } else if (event.key === "ArrowDown") {
        arrowItem(false)
        return true
      } else if (event.key === "Enter") {
        selectItem(activeKey)
        return true
      } else {
        return false
      }
    },
  }))
  const maxHeight = Math.floor((document.body.clientHeight / 2 - 20) / 32) * 32 + 8
  // console.log("PopupBase", activeKey)
  return (
    <Dropdown
      menu={{ items: menus, activeKey, onClick, className: "ddmenu", style: { maxHeight } }}
      open={menus && menus.length > 0}
      placement="bottomLeft"
    >
      <Anchor style={{ top: y - 4, left: x }} />
    </Dropdown>
  )
})

const Anchor = styled("div")({
  position: "absolute",
  zIndex: -1,
  width: 10,
  height: 24,
})
