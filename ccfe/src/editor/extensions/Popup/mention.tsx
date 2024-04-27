import React, { forwardRef, useCallback, useEffect, useMemo, useState } from "react"
import { MenuProps, Typography } from "antd"
import { useDebounceCallback } from "@react-hook/debounce"
import { getLocalSpaceId } from "@/datasource"
import { type GetDB, useDBStore } from "@/store"
import type { CardOption, SuggestionProps, ViewOption } from "@/types"
import { IText } from "@/ui"
import { IIcon } from "@/icons"
import { LinkNodeType } from "@/enums"
import { PopupBase } from "./base"

const dbSelector: GetDB = (state) => state.db

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
      opt = { id, name: name, type: LinkNodeType.VIEW, icon }
      vi++
    } else {
      const { id, name } = cards[ci]
      opt = { id, name: name, type: LinkNodeType.CARD, icon: "card" }
      ci++
    }
    if (opt.name === text) {
      firstOpts.push(opt)
    } else {
      remainOpts.push(opt)
    }
  }
  // console.log("formatList res", firstOpts, remainOpts)
  if (text === "") {
    return remainOpts
  } else {
    return [...firstOpts, { ...newOpt, name: text }, ...remainOpts]
  }
}

// props 参数实际上是 new ReactRenderer(PopupMention, { props, editor: props.editor }) 中的 props 值
export const PopupMention = forwardRef((props: SuggestionProps, ref) => {
  const { query, command, clientRect } = props
  // console.log("PopupMention", props)
  const db = useDBStore(dbSelector)
  const [list, setList] = useState<OptType[]>([])
  const searchCard = useDebounceCallback((text: string) => {
    if (db) {
      const spaceId = getLocalSpaceId()
      db.card.getSpaceCardsByName(spaceId, text, true).then((cards) => {
        db.view.getSpaceViewsByName(spaceId, text, true).then((views) => {
          const l = formatList(cards, views, text)
          setList(l)
        })
      })
    } else {
      setList([])
    }
  }, 300)
  useEffect(() => searchCard(query), [query, searchCard])
  const menus: MenuProps["items"] = useMemo(
    () =>
      list.map((i) => ({
        key: i.id,
        label:
          i.type === LinkNodeType.NEW ? (
            <Typography.Text ellipsis>
              <span className="prefixText">新卡片：</span>
              {i.name}
            </Typography.Text>
          ) : (
            <IText ellipsis>
              <IIcon icon={i.icon} />
              {i.name}
            </IText>
          ),
      })),
    [list]
  )
  const selectItem = useCallback(
    (key: string) => {
      const item = list.find((i) => i.id === key)
      if (item) {
        if (item.type === LinkNodeType.NEW) {
          db?.card.createCard(getLocalSpaceId(), "default", item.name).then((n) => {
            command({ id: n.id, label: item.name, type: LinkNodeType.CARD, icon: item.icon })
          })
        } else {
          command({ id: item.id, label: item.name, type: item.type, icon: item.icon })
        }
      }
    },
    [list, db?.card, command]
  )
  console.log("Render: PopupMention")
  const rect = clientRect?.()
  if (!rect) return null
  return <PopupBase ref={ref} x={rect.x} y={rect.y} menus={menus} selectItem={selectItem} />
})
