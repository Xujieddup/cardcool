import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { CardObj, GrouperRule, RuleConfig } from "@/types"
import { Button, Collapse, Empty, Tooltip, Typography, theme, Row, Col } from "antd"
import type { CollapseProps } from "antd"
import { CaretRightOutlined } from "@ant-design/icons"
import { CardNodeView } from "@/views/card"
import { useDBStore, useModelStore } from "@/store"
import type { GetDBTypes, GCardOp, GetTagMap, SMCardId, GScreenProp } from "@/store"
import { shallow } from "zustand/shallow"
import { queryCards } from "@/datasource"
import styled from "@emotion/styled"
import { EmptyBox, IRText } from "@/ui"
import { IIcon } from "@/icons"
import { OpEnum } from "@/enums"
import { arrToMap, delCard } from "@/utils"

const cardSelector: SMCardId = (state) => state.setMCardId
const cardOpSelector: GCardOp = (state) => state.cardOp
const dbTypesSelector: GetDBTypes = (state) => [state.db, state.types]
const tagSelector: GetTagMap = (state) => state.tagMap
const screenSelector: GScreenProp = (state) => state.screenProp

let initData = false

type Props = { spaceId: string; ruleCfg: RuleConfig; keyword: string }

export const CardList = memo(({ spaceId, ruleCfg, keyword }: Props) => {
  const [db, types] = useDBStore(dbTypesSelector, shallow)
  const typeMap = useMemo(() => arrToMap(types, "id"), [types])
  const { token } = theme.useToken()
  const [refreshTime, setRefreshTime] = useState(0)
  const screenProp = useModelStore(screenSelector)
  // 初始化卡片列表数据
  const [data, setData] = useState<any>()
  const groupersRef = useRef<GrouperRule[]>([])
  useEffect(() => {
    // 查询所有卡片
    // console.log("CardList - queryCards", ruleCfg)
    if (db) {
      queryCards(db, spaceId, ruleCfg, types).then(([groups, groupers]) => {
        initData = true
        // console.log("groups", groups, Date.now())
        groupersRef.current = groupers
        setData(groups)
      })
    }
  }, [db, types, spaceId, ruleCfg, refreshTime])

  // 删除卡片: 遍历数据，删除数据，转换成 string，再解析成对象
  const deleteCardData = useCallback((cardId: string) => {
    setData((oldData: any) => {
      delCard(oldData, cardId)
      return JSON.parse(JSON.stringify(oldData))
    })
  }, [])
  const setMCardId = useModelStore(cardSelector)
  // 监听卡片操作状态
  const cardOp = useDBStore(cardOpSelector)
  useEffect(() => {
    // console.log("ListView - ListenCardOp", cardOp)
    if (cardOp !== undefined) {
      switch (cardOp.op) {
        case OpEnum.ADD:
        case OpEnum.UPDATE:
          // 新增和更新卡片: 直接刷新页面
          setRefreshTime(Date.now())
          // db?.card.getCard(cardOp.id).then((card) => {
          //   if (card) {
          //     const typeInfo = types.find((t) => t.id === card.type_id)
          //     const nc = formatNodeObj(card, typeInfo)
          //     // setList((oldList) => {
          //     //   // 可能修改的卡片没有存在在 list 中
          //     //   const idx = oldList.findIndex((c) => c.id === cardOp.id)
          //     //   if (idx === -1) {
          //     //     return [nc, ...oldList]
          //     //   } else {
          //     //     return oldList.map((item) => (item.id === card.id ? nc : item))
          //     //   }
          //     // })
          //   }
          // })
          break
        case OpEnum.DELETE:
          deleteCardData(cardOp.id)
          break
      }
    }
  }, [cardOp, deleteCardData])
  const handleCreateNewCard = useCallback(() => {
    setMCardId("")
  }, [setMCardId])

  const tagMap = useDBStore(tagSelector)
  const renderCards = (list: CardObj[]) => {
    let cards = list
    // 根据关键词实时过滤
    if (keyword && list.length) {
      const regexp = new RegExp(keyword, "i")
      cards = list.filter((c) => regexp.test(c.name))
    }
    return (
      <ListRow gutter={[16, 16]}>
        {cards.map((card) => (
          <Col key={"card_" + card.id} {...screenProp}>
            <CardNodeView
              card={card}
              scope="list"
              style={{
                height: 240,
                border: "1px solid " + token.colorBorderSecondary,
              }}
              tagMap={tagMap}
            />
          </Col>
        ))}
      </ListRow>
    )
  }
  const parseGroup = (maps: any, idx: number) => {
    const grouper = groupersRef.current[idx]
    // console.log("grouper", grouper)
    const isType = grouper.propId === "type_id"
    const prop = grouper.typeId
      ? typeMap.get(grouper.typeId)?.props?.find((p) => p.id === grouper.propId)
      : undefined
    const items: CollapseProps["items"] = Object.entries(maps).map(([key, value]) => {
      const isSelectProp = prop && prop.type === "select"
      const groupName = isType
        ? typeMap.get(key)?.name || "未知模板"
        : key === "undefined" || key === ""
        ? "空"
        : isSelectProp
        ? prop?.options?.find((o) => o.id === key)?.label || "未知选项"
        : key
      const isArray = Array.isArray(value)
      return {
        key,
        label: (
          <Typography.Text strong>
            {groupName}
            {isArray && (
              <Tooltip title={value.length + " 张卡片"} placement="right">
                <IRText type="secondary" className="ml-4">
                  <IIcon icon="card" />
                  {value.length}
                </IRText>
              </Tooltip>
            )}
          </Typography.Text>
        ),
        children: isArray ? renderCards(value as CardObj[]) : parseGroup(value, idx + 1),
      }
    })
    return (
      <CardCollapse
        defaultActiveKey={Object.keys(maps)}
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        ghost
        items={items}
      />
    )
  }
  // console.log("Render: CardList", viewId)
  if (!initData || !data) return null
  // 非分组模式
  if (data["all"]) {
    return data["all"].length > 0 ? (
      renderCards(data["all"])
    ) : (
      <EmptyBox image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无卡片">
        <Button onClick={handleCreateNewCard} type="primary">
          创建卡片
        </Button>
      </EmptyBox>
    )
  } else {
    return parseGroup(data, 0)
  }
})

const ListRow = styled(Row)({
  ".cardBox:hover .hide": {
    display: "block",
  },
  ".hide": {
    position: "absolute",
    top: 9,
    right: 9,
  },
})
const CardCollapse = styled(Collapse)({
  "& > .ant-collapse-item > .ant-collapse-header": {
    padding: "5px 4px",
  },
  "& > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box": {
    padding: "4px 6px",
  },
  ".ant-collapse-content-box > .ant-collapse": {
    padding: "0 10px",
  },
})
