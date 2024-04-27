import React, { memo, useCallback, useEffect, useMemo, useState } from "react"
import type { CardObj, ViewCfg } from "@/types"
import { IFlexC } from "@/ui"
import styled from "@emotion/styled"
import { Input } from "antd"
import { SearchOutlined } from "@ant-design/icons"
import { CardNodeView } from "@/views/card"
import { useDebounceCallback } from "@react-hook/debounce"
import { shallow } from "zustand/shallow"
import { GetDBTypes, GetTagMap, useDBStore } from "@/store"
import { queryCardsByCfg } from "@/datasource"
import { getViewRuleConfig } from "@/utils"
import { defaultLVCfg, gd } from "@/config"
import { NodeTypeEnum, VNTypeEnum } from "@/enums"

const dbTypesSelector: GetDBTypes = (state) => [state.db, state.types]
const tagSelector: GetTagMap = (state) => state.tagMap

type Props = {
  spaceId: string
}

export const SiderList = memo(({ spaceId }: Props) => {
  const [db, types] = useDBStore(dbTypesSelector, shallow)
  const tagMap = useDBStore(tagSelector)
  // 初始化卡片列表
  const [viewCfg, setViewCfg] = useState<ViewCfg>(defaultLVCfg)
  // 初始化卡片列表
  const [list, setList] = useState<CardObj[]>([])
  useEffect(() => {
    // 查询所有卡片
    // console.log("useListNodes", viewCfg)
    if (db) {
      const cfg = getViewRuleConfig(viewCfg, "")
      queryCardsByCfg(db, spaceId, cfg, types).then((cards) => {
        setList(cards)
      })
    }
  }, [db, types, spaceId, viewCfg])
  // 根据关键词实时过滤
  const [keyword, setKeyword] = useState("")
  const cards = useMemo(() => {
    if (keyword) {
      const regexp = new RegExp(keyword, "i")
      return list.filter((c) => regexp.test(c.name))
    } else {
      return list
    }
  }, [list, keyword])
  const searchKeyword = useDebounceCallback((word: string) => {
    console.log("searchKeyword", word)
    setKeyword(word)
    // setViewCfg((oldCfg) => ({ ...oldCfg, keyword: word }))
  }, 500)
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      searchKeyword(e.target.value)
    },
    [searchKeyword]
  )
  const onDragStart = useCallback((event: React.DragEvent, nodeId: string) => {
    console.log("onDragStart", event)
    // event.nativeEvent.offsetX 是拖拽点相对于卡片左上角的坐标
    const { offsetX, offsetY } = event.nativeEvent
    const { clientWidth: width, clientHeight: height } = event.target as HTMLDivElement
    gd.setDropParam({ id: Date.now(), offsetX, offsetY, width, height })
    // console.log("params", { offsetX, offsetY, width, height })
    event.dataTransfer.setData("vn_type", VNTypeEnum.CARD)
    event.dataTransfer.setData("node_type", NodeTypeEnum.CARD.toString())
    event.dataTransfer.setData("node_id", nodeId)
    event.dataTransfer.effectAllowed = "move"
  }, [])
  console.log("Render: SiderList")
  return (
    <SiderContainer>
      <SearchHeader>
        <Input
          onChange={handleChange}
          autoFocus
          bordered={false}
          placeholder="搜索关键词..."
          prefix={<SearchOutlined />}
        />
      </SearchHeader>
      <CardListBox>
        {cards.map((card) => (
          <CardBox key={card.id} draggable onDragStart={(event) => onDragStart(event, card.id)}>
            <CardNodeView
              card={card}
              tagMap={tagMap}
              scope="siderlist"
              style={{ maxHeight: 220 }}
            />
          </CardBox>
        ))}
      </CardListBox>
    </SiderContainer>
  )
})

const SiderContainer = styled(IFlexC)({
  height: "100%",
})
const SearchHeader = styled("div")({
  paddingTop: 16,
})
const CardListBox = styled("div")({
  padding: "6px 10px 8px 2px",
  overflowY: "auto",
})
const CardBox = styled("div")({
  marginBottom: 10,
})
