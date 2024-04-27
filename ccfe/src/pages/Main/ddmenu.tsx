import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import { Dropdown, Menu, MenuProps, Popover, Tooltip, Typography } from "antd"
import { useDebounceCallback } from "@react-hook/debounce"
import { getLocalSpaceId } from "@/datasource"
import { GetDB, UseDdMenu, useDBStore, useModelStore } from "@/store"
import { CardOption, ViewOption } from "@/types"
import { IText } from "@/ui"
import { IIcon } from "@/icons"
import { LinkNodeType } from "@/enums"
import styled from "@emotion/styled"
import { shallow } from "zustand/shallow"

const ddMenuSelector: UseDdMenu = (state) => [state.ddMenu, state.setDdMenu]

type OptType = {
  id: string
  name: string
  type: LinkNodeType
  icon: string
}
const newOpt: OptType = {
  id: "new",
  type: LinkNodeType.NEW,
  name: "",
  icon: "card",
}
const formatList = (cards: CardOption[], views: ViewOption[], text: string) => {
  // cards 和 views 按 update_time 倒序混合排序
  let ci = 0,
    vi = 0
  const cc = cards.length,
    vc = views.length
  const firstOpts: OptType[] = []
  const remainOpts: OptType[] = []
  while (ci < cc || vi < vc) {
    const viewUpdateTime = vi < vc ? views[vi].update_time : 0
    const cardUpdateTime = ci < cc ? cards[ci].update_time : 0
    let opt: OptType
    if (viewUpdateTime >= cardUpdateTime) {
      const { id, name, icon } = views[vi]
      opt = { id, name, type: LinkNodeType.VIEW, icon }
      vi++
    } else {
      const { id, name } = cards[ci]
      opt = { id, name, type: LinkNodeType.CARD, icon: "card" }
      ci++
    }
    if (opt.name === text) {
      firstOpts.push(opt)
    } else {
      remainOpts.push(opt)
    }
  }
  console.log("formatList res", firstOpts, remainOpts)
  return [...firstOpts, { ...newOpt, name: text }, ...remainOpts]
}

type Props = {
  data: {
    x: number
    y: number
    width: number
    height: number
  }
}

export const DdMenuBox = memo(() => {
  // console.log("props", props)
  const [ddMenu, setDdMenu] = useModelStore(ddMenuSelector, shallow)
  const [activeKey, setActiveKey] = useState("")
  const items: MenuProps["items"] = [
    {
      label: "Navigation One",
      key: "mail",
    },
    {
      label: "Navigation Two",
      key: "app",
    },
    {
      label: "Navigation Three - Submenu",
      key: "SubMenu",
    },
    {
      label: (
        <a href="https://ant.design" target="_blank" rel="noopener noreferrer">
          Navigation Four - Link
        </a>
      ),
      key: "alipay",
    },
    {
      label: "Option 1",
      key: "setting:1",
    },
    {
      label: "Option 2",
      key: "setting:2",
    },
    {
      label: "Option 3",
      key: "setting:3",
    },
    {
      label: "Option 4",
      key: "setting:4",
    },
    {
      label: "Option 1",
      key: "setting:11",
    },
    {
      label: "Option 2",
      key: "setting:21",
    },
    {
      label: "Option 3",
      key: "setting:31",
    },
    {
      label: "Option 4",
      key: "setting:41",
    },
    {
      label: "Option 1",
      key: "setting:12",
    },
    {
      label: "Option 2",
      key: "setting:22",
    },
    {
      label: "Option 3",
      key: "setting:32",
    },
    {
      label: "Option 4",
      key: "setting:42",
    },
    {
      label: "Option 1",
      key: "setting:13",
    },
    {
      label: "Option 2",
      key: "setting:23",
    },
    {
      label: "Option 3",
      key: "setting:33",
    },
    {
      label: "Option 4",
      key: "setting:43",
    },
  ]
  const numRef = useRef(1)
  const width = ddMenu.w + numRef.current
  numRef.current = numRef.current === 1 ? -1 : 1
  console.log("props", width)
  return (
    <Dropdown
      menu={{ items, activeKey, className: "ddmenu" }}
      open={ddMenu.w > 0}
      overlayStyle={{ width: 200 }}
      placement="bottomLeft"
    >
      <Anchor style={{ top: ddMenu.y - 4, left: ddMenu.x, width, height: ddMenu.h + 8 }} />
    </Dropdown>
  )
})

const Anchor = styled("div")({
  position: "absolute",
  zIndex: -1,
})
