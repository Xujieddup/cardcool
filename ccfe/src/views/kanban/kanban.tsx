import React, {
  CSSProperties,
  ReactNode,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { CardObj, CardTag, RuleCfg, RuleConfig, SelectOpt } from "@/types"
import { Button, Empty, Tag, Tooltip, Typography, theme } from "antd"
import { CardNodeView } from "@/views/card"
import { useConfigStore, useDBStore, useModelStore } from "@/store"
import type { GetDBTypes, GCardOp, GetColors, SRuleOpenTime, GetTagMap } from "@/store"
import { shallow } from "zustand/shallow"
import { queryKanbanCards, sortCards } from "@/datasource"
import styled from "@emotion/styled"
import { EmptyBox, IFlexC, IFlexR, IFlexRB, IRText } from "@/ui"
import { IIcon } from "@/icons"
import { OpEnum, SortEnum } from "@/enums"
import { delCard, formatCardProps, formatViewRuleConfig } from "@/utils"
import {
  DndContext,
  useDraggable,
  UniqueIdentifier,
  DragOverlay,
  useDroppable,
  DragEndEvent,
  useSensors,
  useSensor,
  PointerSensor,
} from "@dnd-kit/core"
import { createPortal } from "react-dom"

const ruleOpenSelector: SRuleOpenTime = (state) => state.setRuleOpenTime
const cardOpSelector: GCardOp = (state) => state.cardOp
const dbTypesSelector: GetDBTypes = (state) => [state.db, state.types]
const tagSelector: GetTagMap = (state) => state.tagMap
const colorsSelector: GetColors = (state) => state.colors

type ActiveData = { optId: string; card: CardObj } | null
const emptyOpt: SelectOpt = { id: "", label: "空值", color: "N500" }
// 检查是否需要配置规则
const checkNeedConfig = (rule: RuleCfg) => {
  if (!rule.typeId || rule.groupers.length !== 1 || !rule.propMap) {
    return true
  }
  const grouper = rule.groupers[0]
  const propInfo = rule.propMap.get(grouper.propId)
  return !grouper.typeId || !propInfo || propInfo.type !== "select"
}
const findCard = (activeId: UniqueIdentifier | null, data?: DataType): ActiveData => {
  if (!data || !activeId) {
    return null
  }
  for (const k in data) {
    const card = data[k].find((c) => c.id === activeId)
    if (card) {
      return { optId: k, card }
    }
  }
  return null
}
const refreshData = (
  data: DataType,
  card: CardObj,
  oldOptId: string,
  newOptId: string,
  rule: RuleCfg
) => {
  const newData: DataType = {}
  for (const optId in data) {
    if (optId === oldOptId) {
      newData[optId] = data[optId].filter((c) => c.id !== card.id)
    } else if (optId === newOptId) {
      // 添加到新选项列表中，再进行排序
      newData[optId] = data[optId].length
        ? sortCards([...data[optId], card], rule.sorters, rule.propMap)
        : [card]
    } else {
      newData[optId] = [...data[optId]]
    }
  }
  if (!(newOptId in data)) {
    newData[newOptId] = [card]
  }
  return newData
}
type Props = { spaceId: string; ruleCfg: RuleConfig; keyword: string }
type DataType = { [key: string]: CardObj[] }

export const Kanban = memo(({ spaceId, ruleCfg, keyword }: Props) => {
  const [db, types] = useDBStore(dbTypesSelector, shallow)
  const tagMap = useDBStore(tagSelector)
  const colors = useConfigStore(colorsSelector)
  const { token } = theme.useToken()
  const [refreshTime, setRefreshTime] = useState(0)
  // 初始化卡片列表数据
  const [data, setData] = useState<DataType>({})
  // 格式化视图配置
  const rule = useMemo(() => formatViewRuleConfig(ruleCfg, types), [ruleCfg, types])
  // 判断是否需要配置规则
  const needConfig = useMemo(() => checkNeedConfig(rule), [rule])
  const grouper = !needConfig ? rule.groupers[0] : undefined
  // 查询卡片数据
  useEffect(() => {
    console.log("Kanban - queryKanbanCards", rule)
    if (db && !needConfig) {
      queryKanbanCards(db, spaceId, rule).then((cardsData) => {
        console.log("cardsData", cardsData)
        setData(cardsData)
      })
    }
  }, [db, needConfig, rule, spaceId, refreshTime])

  // 当前拖动中的选项
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const activeData = useMemo(() => findCard(activeId, data), [activeId, data])
  // 指针传感器
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const style = useMemo(
    () => ({
      height: 240,
      border: "1px solid " + token.colorBorderSecondary,
      backgroundColor: token.colorBgElevated,
    }),
    [token]
  )
  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      console.log("handleDragEnd", active, over, activeData)
      // 拖拽导致状态变更，更新数据(相当于更新卡片的单选属性值)
      if (data && activeData && grouper && over && activeData.optId !== over.id) {
        const { id, propsObj } = activeData.card
        const newProps = { ...propsObj, [grouper.propId]: over.id }
        const cardProps = formatCardProps(newProps, rule.typeInfo)
        const newCard = { ...activeData.card, props: cardProps, update_time: Date.now() }
        // 更新 data 值: 从当前选项列表中删除，再新选项列表中添加并排序
        const newData = refreshData(data, newCard, activeData.optId, over.id as string, rule)
        setData(newData)
        // 更新单选属性值
        db?.card.updateCardProps(id, JSON.stringify(newProps))
      }
      setActiveId(null)
    },
    [activeData, data, db?.card, grouper, rule]
  )
  // 删除卡片: 遍历数据，删除数据，转换成 string，再解析成对象
  const deleteCardData = useCallback((cardId: string) => {
    setData((oldData: any) => {
      delCard(oldData, cardId)
      return JSON.parse(JSON.stringify(oldData))
    })
  }, [])
  const setRuleOpenTime = useModelStore(ruleOpenSelector)
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
          break
        case OpEnum.DELETE:
          deleteCardData(cardOp.id)
          break
      }
    }
  }, [cardOp, deleteCardData])
  // 展示设置筛选规则的提示
  if (needConfig || !grouper) {
    return (
      <EmptyBox image={Empty.PRESENTED_IMAGE_SIMPLE} description="请先选择卡片模板并设定分组规则">
        <Button onClick={setRuleOpenTime} type="primary">
          设置规则
        </Button>
      </EmptyBox>
    )
  }
  // 分组单选属性信息
  const propInfo = rule.propMap?.get(grouper.propId) || undefined
  const options = propInfo && propInfo.options ? [emptyOpt, ...propInfo.options] : [emptyOpt]
  const opts = grouper.value === SortEnum.ASC ? options : options.reverse()
  console.log("Render: kanban")
  return (
    <DndContext
      sensors={sensors}
      onDragMove={({ active }) => {
        !activeId && setActiveId(active.id)
      }}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <KanbanContainer id="kanbanContainer">
        {opts.map((opt) => {
          let cards = data && opt.id in data ? data[opt.id] : []
          // 根据关键词实时过滤
          if (keyword && cards.length) {
            const regexp = new RegExp(keyword, "i")
            cards = cards.filter((c) => regexp.test(c.name))
          }
          const color = colors.get(opt.color)?.bg || opt.color
          return (
            <CardCol
              key={opt.id}
              id={opt.id}
              width={activeData && activeData.optId === opt.id ? 0.1 : 0}
              title={<Tag color={color}>{opt.label}</Tag>}
              extra={
                <Tooltip title={cards.length + " 张卡片"} placement="left">
                  <IRText type="secondary">
                    {cards.length}
                    <IIcon icon="card" />
                  </IRText>
                </Tooltip>
              }
              bgColor={token.colorBgLayout}
            >
              {cards.map((card) => (
                <CardItem key={"card_" + card.id} card={card} style={style} tagMap={tagMap} />
              ))}
            </CardCol>
          )
        })}
        {createPortal(
          <DragOverlay>
            {activeData ? <CardItem card={activeData.card} tagMap={tagMap} style={style} /> : null}
          </DragOverlay>,
          document.body
        )}
      </KanbanContainer>
    </DndContext>
  )
})

type CardColProps = {
  id: string
  title: ReactNode
  extra: ReactNode
  children: ReactNode
  bgColor: string
  width: number
}
const CardCol = memo(({ id, title, extra, children, bgColor, width }: CardColProps) => {
  const { isOver, setNodeRef } = useDroppable({ id })
  const style = {
    backgroundColor: isOver ? bgColor : undefined,
    width: 280 + width,
  }
  // console.log("Render CardCol", id, width)
  return (
    <ColCard ref={setNodeRef} style={style} className="cardCol">
      <IFlexRB className="col-head">
        <Typography.Text strong>{title}</Typography.Text>
        {extra}
      </IFlexRB>
      <div className="col-body">{children}</div>
    </ColCard>
  )
})

type CardItemProps = {
  card: CardObj
  style: CSSProperties
  tagMap: Map<string, CardTag>
}
const CardItem = memo(({ card, style, tagMap }: CardItemProps) => {
  const { isDragging, setNodeRef, listeners } = useDraggable({ id: card.id })
  const itemStyle: React.CSSProperties = {
    marginBottom: 8,
    opacity: isDragging ? 0.5 : undefined,
  }
  return (
    <div ref={setNodeRef} {...listeners} style={itemStyle}>
      <CardNodeView card={card} scope="list" tagMap={tagMap} style={style} />
    </div>
  )
})

const KanbanContainer = styled(IFlexR)({
  flex: 1,
  margin: "0 -8px",
  overflowX: "auto",
})
const ColCard = styled(IFlexC)({
  flexShrink: 0,
  margin: "0 2px",
  height: "100%",
  borderRadius: 6,
  ".col-head": {
    marginBottom: 6,
    padding: "6px 6px 0",
  },
  ".col-body": {
    flex: 1,
    overflowY: "auto",
    padding: "0 5px 4px",
  },
})
