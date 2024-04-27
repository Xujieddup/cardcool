import React, { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import type {
  CardObj,
  DateTag,
  GanttOptions,
  GrouperRule,
  RuleConfig,
  StyledToken,
  Task,
} from "@/types"
import { App, Button, Empty, Layout, Table, Typography, theme } from "antd"
import { CaretRightOutlined } from "@ant-design/icons"
import { useConfigStore, useDBStore, useModelStore } from "@/store"
import type { GetDBTypes, GCardOp, GetColors, SRuleOpenTime, GetTagMap, SMCardId } from "@/store"
import { shallow } from "zustand/shallow"
import { queryCards } from "@/datasource"
import styled from "@emotion/styled"
import { EmptyBox, IconBtn } from "@/ui"
import dayjs, { type Dayjs } from "dayjs"
import { IIcon } from "@/icons"
import cc from "classcat"
import { parseDates } from "./utils"
import { GanttDate } from "./ganttDate"
import { GanttBar } from "./ganttBar"
import { arrToMap, delCard, formatViewRuleConfig } from "@/utils"
import { DateModeEnum, OpEnum } from "@/enums"

const cardSelector: SMCardId = (state) => state.setMCardId
const ruleOpenSelector: SRuleOpenTime = (state) => state.setRuleOpenTime
const cardOpSelector: GCardOp = (state) => state.cardOp
const dbTypesSelector: GetDBTypes = (state) => [state.db, state.types]
const tagSelector: GetTagMap = (state) => state.tagMap
const colorsSelector: GetColors = (state) => state.colors

const options: GanttOptions = {
  colWidth: 30,
  rowHeight: 38,
  barHeight: 22,
  padding: 8,
  barCornerRadius: 3,
  handleWidth: 8,
  // dateModes: [DateModeEnum.DAY, DateModeEnum.MONTH, DateModeEnum.YEAR],
  // dateMode: DateModeEnum.DAY,
  // barCornerRadius: 3,
  // header_height: 48,
  // arrow_curve: 5,
  // date_format: "YYYY-MM-DD",
  // popup_trigger: "click",
}

type Props = { spaceId: string; ruleCfg: RuleConfig; keyword: string }
type DragData = {
  el: null | HTMLElement
  id: string
  left: number
  width: number
  draggingType: number
  startX: number
}
type DataType = {
  key: string
  id: string
  name: string
  text: string
  start?: Dayjs
  end?: Dayjs
  progress?: number
  children?: DataType[]
}
type DateRange = { startDate?: Dayjs; endDate?: Dayjs }

const getDatePropVal = (card: CardObj, propId?: string) => {
  switch (propId) {
    case "create_time":
      return dayjs(card.create_time * 1000)
    case "update_time":
      return dayjs(card.update_time)
    case undefined:
      return undefined
    default:
      return card.propsObj[propId] ? dayjs(card.propsObj[propId], "YYYY-MM-DD") : undefined
  }
}
const getTextPropVal = (card: CardObj, propId?: string) => {
  switch (propId) {
    case undefined:
      return ""
    case "name":
      return card.name
    case "tags":
      return card.tags.join("、")
    case "create_time":
      return dayjs(card.create_time * 1000).format("YYYY-MM-DD")
    case "update_time":
      return dayjs(card.update_time).format("YYYY-MM-DD")
    default:
      return card.propsObj[propId] as string
  }
}
let initData = false

export const Gantt = memo(({ spaceId, ruleCfg, keyword }: Props) => {
  const [db, types] = useDBStore(dbTypesSelector, shallow)
  const typeMap = useMemo(() => arrToMap(types, "id"), [types])
  const { token } = theme.useToken()
  const setRuleOpenTime = useModelStore(ruleOpenSelector)
  // 初始化卡片列表数据
  const [refreshTime, setRefreshTime] = useState(0)
  const [data, setData] = useState<any>()
  const groupersRef = useRef<GrouperRule[]>([])
  const dateRangeRef = useRef<DateRange>({})
  const ganttBoxRef = React.useRef<HTMLDivElement>(null)
  const setMCardId = useModelStore(cardSelector)

  // const tagMap = useDBStore(tagSelector)
  // const colors = useConfigStore(colorsSelector)
  // const { message, modal } = App.useApp()
  // const [tasks, setTasks] = useState<Task[]>([])
  // const ganttRef = useRef<HTMLDivElement>(null)
  // const ganttInsRef = useRef<GanttBase | null>(null)
  // const [siderOpen, setSiderOpen] = useState(true)

  // 格式化视图配置
  const rule = useMemo(() => formatViewRuleConfig(ruleCfg, types), [ruleCfg, types])
  const nameText = useMemo(() => rule.propMap?.get("name")?.name || "卡片名称", [rule])
  // 判断是否需要配置规则
  const needConfig = useMemo(() => !rule.typeId || !rule.gantt, [rule])
  // 查询卡片数据
  useEffect(() => {
    if (db) {
      queryCards(db, spaceId, ruleCfg, types).then(([groups, groupers]) => {
        console.log("queryCards", ruleCfg, groups, groupers)
        initData = true
        groupersRef.current = groupers
        setData(groups)
      })
    }
  }, [db, types, spaceId, ruleCfg, refreshTime])

  const renderCards = useCallback(
    (list: CardObj[]): DataType[] => {
      let cards = list
      // 根据关键词实时过滤
      if (keyword && list.length) {
        const regexp = new RegExp(keyword, "i")
        cards = list.filter((c) => regexp.test(c.name))
      }
      return cards.map((c: CardObj) => {
        // 格式化开始时间和结束时间
        // 开始时间和结束时间都为空，则不显示时间线 - invalid
        // 开始时间和结束时间存在一个，则显示对应日期
        // 开始时间和结束时间同时存在，且开始时间小于结束时间，则显示时间区间
        // 开始时间和结束时间同时存在，但开始时间大于结束时间，则显示开始时间
        // 结束时间不能超过 5000 年
        let startVal = getDatePropVal(c, ruleCfg.gantt?.start)
        let endVal = getDatePropVal(c, ruleCfg.gantt?.end)
        const textVal = getTextPropVal(c, ruleCfg.gantt?.text)
        if (startVal && endVal) {
          if (endVal.isBefore(startVal)) {
            const tmpDate = startVal
            startVal = endVal
            endVal = tmpDate
          }
          // 开始时间为当天 00:00，结束时间为次日 00:00
          startVal = startVal.startOf(DateModeEnum.DAY)
          endVal = endVal.startOf(DateModeEnum.DAY).add(1, DateModeEnum.DAY)
          if (
            !dateRangeRef.current.startDate ||
            startVal.isBefore(dateRangeRef.current.startDate)
          ) {
            dateRangeRef.current.startDate = startVal
          }
          if (!dateRangeRef.current.endDate || endVal.isAfter(dateRangeRef.current.endDate)) {
            dateRangeRef.current.endDate = endVal
          }
        } else {
          startVal = undefined
          endVal = undefined
        }
        return {
          key: c.id,
          id: c.id,
          name: c.name,
          text: textVal,
          start: startVal,
          end: endVal,
          // progress: parseInt(Math.random() * 100 + "", 10),
        }
      })
    },
    [keyword, ruleCfg]
  )
  const parseGroup = useCallback(
    (maps: any, idx: number): DataType[] => {
      const grouper = groupersRef.current[idx]
      const isType = grouper.propId === "type_id"
      const prop = grouper.typeId
        ? typeMap.get(grouper.typeId)?.props?.find((p) => p.id === grouper.propId)
        : undefined
      return Object.entries(maps).map(([key, value]) => {
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
          key: key,
          id: key,
          name: groupName,
          text: "",
          children: isArray ? renderCards(value as CardObj[]) : parseGroup(value, idx + 1),
        }
      })
    },
    [renderCards, typeMap]
  )

  // 删除卡片: 遍历数据，删除数据，转换成 string，再解析成对象
  const deleteCardData = useCallback((cardId: string) => {
    setData((oldData: any) => {
      delCard(oldData, cardId)
      return JSON.parse(JSON.stringify(oldData))
    })
  }, [])
  // 监听卡片操作状态
  const cardOp = useDBStore(cardOpSelector)
  useEffect(() => {
    // console.log("GanttView - ListenCardOp", cardOp)
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

  // // 拖拽参数，draggingType：0-未拖拽，1-左拖拽，2-右拖拽，3-整条拖拽
  // const dragRef = useRef<DragData>({
  //   el: null,
  //   id: "",
  //   left: 0,
  //   width: 0,
  //   draggingType: 0,
  //   startX: 0,
  // })
  // const onMouseDown: MouseEventHandler<HTMLDivElement> = useCallback((e) => {
  //   e.stopPropagation()
  //   console.log("onMouseDown", e)
  //   const target = e.target as HTMLDivElement
  //   let barWrapper: HTMLElement | null = null
  //   if (target.classList.contains("left")) {
  //     barWrapper = target.parentElement
  //     dragRef.current.draggingType = 1
  //   } else if (target.classList.contains("right")) {
  //     barWrapper = target.parentElement
  //     dragRef.current.draggingType = 2
  //   } else if (target.classList.contains("barWrapper")) {
  //     barWrapper = target
  //     dragRef.current.draggingType = 3
  //   }
  //   if (barWrapper) {
  //     dragRef.current.el = barWrapper
  //     dragRef.current.id = barWrapper.getAttribute("data-id") || ""
  //     dragRef.current.left = parseInt(barWrapper.getAttribute("data-left") || "")
  //     dragRef.current.width = parseInt(barWrapper.getAttribute("data-width") || "")
  //     dragRef.current.startX = e.pageX
  //   } else {
  //     dragRef.current.el = null
  //   }
  //   console.log("dragRef", dragRef.current)
  // }, [])
  // const onMouseMove: MouseEventHandler<HTMLDivElement> = useCallback((e) => {
  //   e.stopPropagation()
  //   if (!dragRef.current.el) return
  //   const { el, left, width, draggingType, startX } = dragRef.current
  //   // 拖拽相对位移
  //   const dx = e.pageX - startX
  //   // console.log("onMouseMove", e, dx, left + dx, width - dx)
  //   if (draggingType === 1) {
  //     el.setAttribute("style", `left: ${left + dx}px; width: ${width - dx}px;`)
  //     // data.bar.updateBarPosition({ x: data.ox + dx, width: data.ow - dx })
  //   } else if (draggingType === 2) {
  //     el.setAttribute("style", `width: ${width + dx}px;`)
  //     // data.bar.updateBarPosition({ x: data.ox + dx })
  //   } else if (draggingType === 3) {
  //     el.setAttribute("style", `left: ${left + dx}px;`)
  //     // data.bar.updateBarPosition({ width: data.ow + dx })
  //   }
  // }, [])
  // const onMouseUp = useCallback((e: MouseEvent) => {
  //   e.stopPropagation()
  //   console.log("onMouseUp", e)
  //   if (!dragRef.current.el) return
  //   const { el, id, left, width, draggingType, startX } = dragRef.current
  //   dragRef.current.el = null
  //   // 拖拽相对位移(修正后)
  //   const dx = getAmendDx(e.pageX - startX, options.colWidth)
  //   // console.log("onMouseMove", e, dx, left + dx, width - dx)
  //   if (draggingType === 1) {
  //     el.setAttribute("style", `left: ${left + dx}px; width: ${width - dx}px;`)
  //     // data.bar.updateBarPosition({ x: data.ox + dx, width: data.ow - dx })
  //   } else if (draggingType === 2) {
  //     el.setAttribute("style", `width: ${width + dx}px;`)
  //     // data.bar.updateBarPosition({ x: data.ox + dx })
  //   } else if (draggingType === 3) {
  //     el.setAttribute("style", `left: ${left + dx}px;`)
  //     // data.bar.updateBarPosition({ width: data.ow + dx })
  //   }
  //   if (dx !== 0) {
  //     // 需要更新卡片 TODO
  //   }
  // }, [])
  // useEffect(() => {
  //   if (tblRef.current) {
  //     // console.log("tbl", tblRef.current.nativeElement)
  //     // tblRef.current.nativeElement.addEventListener(
  //     //   "mousedown",
  //     //   // ".barWrapper, .handle",
  //     //   (e: MouseEvent) => {
  //     //     const target = e.target as Element
  //     //     console.log("mousedown", e, target)
  //     //     if (target.matches(".barWrapper, .handle")) {
  //     //       console.log("mousedown mousedown", true)
  //     //     } else {
  //     //       console.log("mousedown mousedown", false)
  //     //     }
  //     //   }
  //     // )
  //   }
  //   document.addEventListener("mouseup", onMouseUp)
  //   return () => document.removeEventListener("mouseup", onMouseUp)
  // }, [onMouseUp])

  useEffect(() => {
    const handleDBClick = (e: MouseEvent) => {
      const target = e.target as Element
      const cardId = target.matches(".Opencard")
        ? target.getAttribute("data-id")
        : target.parentElement?.matches(".Opencard")
        ? target.parentElement.getAttribute("data-id")
        : null
      if (cardId) {
        setMCardId(cardId)
      }
    }
    const ganttBoxEl = ganttBoxRef.current
    ganttBoxEl?.addEventListener("dblclick", handleDBClick)
    return () => ganttBoxEl?.removeEventListener("dblclick", handleDBClick)
  }, [setMCardId])
  const items = useMemo(() => {
    dateRangeRef.current = {}
    return !data ? [] : data["all"] ? renderCards(data["all"]) : parseGroup(data, 0)
  }, [data, parseGroup, renderCards])
  const { dateMode, ganttStartDate, dates, dateTags } = useMemo(() => {
    const { startDate, endDate } = dateRangeRef.current
    return parseDates(startDate, endDate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])
  const barBg = <BarBg dateTags={dateTags} />
  console.log("Render: Gantt")
  return (
    <GanttBox
      token={token}
      ref={ganttBoxRef}
      //  onMouseDown={onMouseDown} onMouseMove={onMouseMove}
    >
      {needConfig ? (
        <EmptyBox image={Empty.PRESENTED_IMAGE_SIMPLE} description="请先选择卡片模板并设定规则">
          <Button onClick={setRuleOpenTime} type="primary">
            设置规则
          </Button>
        </EmptyBox>
      ) : !initData || !data ? (
        <></>
      ) : (
        <Table
          columns={[
            {
              key: "name",
              title: nameText,
              dataIndex: "name",
              width: 120 + groupersRef.current.length * 20,
              fixed: "left",
              ellipsis: true,
              render: (_, record) => {
                return record.children ? (
                  record.name
                ) : (
                  <CardName className="Opencard" data-id={record.id} ellipsis>
                    <IIcon icon="card" />
                    {record.name || "未命名"}
                  </CardName>
                )
              },
            },
            {
              key: "gantt",
              title: <GanttDate dateMode={dateMode} dates={dates} options={options} />,
              dataIndex: "start",
              width: dates.length * options.colWidth,
              render: (_, record) => {
                const startIndex = record.start?.diff(ganttStartDate, dateMode)
                const widthCnt = record.end?.diff(record.start, dateMode)
                // console.log("render", startIndex, record, widthCnt)
                return (
                  <GanttBar
                    id={record.id}
                    text={record.text}
                    startIndex={startIndex}
                    widthCnt={widthCnt}
                    barBg={barBg}
                    options={options}
                  />
                )
              },
            },
          ]}
          dataSource={items}
          pagination={false}
          size="small"
          bordered
          expandable={{
            defaultExpandAllRows: true,
            expandIcon: ({ expanded, onExpand, record }) => (
              <GanttSwitchBtn
                onClick={(e) => onExpand(record, e)}
                className={cc([
                  "collapseBtn",
                  { collapsedLeft: expanded, noChildren: !record.children },
                ])}
                type="text"
                icon={<CaretRightOutlined />}
              />
            ),
          }}
          scroll={{ y: window.innerHeight - 171 }}
          // scroll={{ x: 0 }}
        />
      )}
    </GanttBox>
  )

  // return (
  // <GanttContainer>
  //   <GanttLayout
  //     hasSider
  //     style={{ borderColor: token.colorBorderSecondary }}
  //     onMouseMove={handleMouseMove}
  //     onMouseLeave={handleMouseLeave}
  //     token={token}
  //   >
  //     <GanttSider
  //       width={780}
  //       collapsed={!siderOpen}
  //       collapsible
  //       collapsedWidth={0}
  //       trigger={null}
  //       style={{ backgroundColor: token.colorBgContainer }}
  //     >
  //       {/* <SwitchBtn
  //       className={cc({ siderOpen })}
  //       token={token}
  //       onClick={() => setSiderOpen((o) => !o)}
  //     >
  //       <IIcon icon="arrowleft" />
  //     </SwitchBtn> */}
  //     </GanttSider>
  // <GanttMain className="gantt" ref={ganttRef}>
  //   <GanttHeader className="ganttHeader" />
  //   <GanttBody className="ganttBody" token={token} />
  // </GanttMain>
  //   </GanttLayout>
  // </GanttContainer>
  // )
})
const GanttBox = styled("div")(({ token }: StyledToken) => ({
  height: "100%",
  ".ant-table-wrapper .ant-table-thead>tr>th": {
    textAlign: "center",
  },
  ".ant-table .ant-table-container thead.ant-table-thead>tr>th:last-of-type": {
    paddingLeft: 0,
    paddingRight: 0,
  },
  ".ant-table-wrapper .ant-table-cell-fix-left-first::after, .ant-table-wrapper .ant-table-cell-fix-left-last::after":
    {
      bottom: 0,
    },
  ".ant-table-wrapper .ant-table-tbody >tr >td": {
    borderBottom: "none",
  },
  ".ant-table-container": {
    borderBottom: "1px solid " + token.colorBorderSecondary,
  },
  ".currDate": {
    fill: token.colorPrimary,
  },
  ".bar": {
    fill: token.colorPrimary,
  },
  ".barText": {
    fill: token.colorBgBase,
    fontSize: 13,
  },
  ".barTick": {
    stroke: token.colorBorderSecondary,
    strokeWidth: 0.8,
    "&.currTick": {
      stroke: token.colorPrimary,
      opacity: 0.6,
    },
  },
  ".barWeek": {
    fill: token.colorBgLayout,
    opacity: 0.5,
  },
  ".barWrapper": {
    backgroundColor: token.colorPrimary,
    color: token.colorBgBase,
    ".handle": {
      backgroundColor: token.colorWarning,
    },
  },
  ".barWrapper:hover": {
    ".bar": {
      backgroundColor: token.colorPrimaryHover,
    },
    ".handle": {
      visibility: "visible",
      opacity: 1,
    },
  },
}))
const GanttLayout = styled(Layout)(({ token }: StyledToken) => ({
  // overflow: "hidden",
  border: "1px solid transparent",
  borderRadius: 8,
}))
const GanttSider = styled(Layout.Sider)({
  height: "100%",
  // paddingRight: 20,
  ".ant-table .ant-table-container thead.ant-table-thead>tr>th": {
    padding: "16px 8px",
  },
  ".ant-table-wrapper .ant-table.ant-table-bordered >.ant-table-container": {
    border: "none",
  },
  ".ant-table-wrapper .ant-table-tbody >tr >td": {
    borderBottom: "none",
  },
})
const GanttMain = styled("div")({
  height: "100%",
  // overflowX: "auto",
  position: "relative",
  display: "flex",
  flexDirection: "column",
})
const GanttHeader = styled("div")({
  height: 55,
  overflow: "hidden",
  // position: "relative",
})
const GanttBody = styled("div")(({ token }: StyledToken) => ({
  backgroundColor: token.colorBgContainer,
  flex: 1,
  // minWidth: "100%",
  // height: "100%",
  // paddingTop: 55,
  overflowY: "auto",
  overflowX: "auto",
  ".ganttDate": {
    minWidth: "100%",
    height: 55,
    display: "block",
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: token.colorBgLayout,
  },
  ".ganttContent": {
    minWidth: "100%",
    display: "block",
  },
}))
const SwitchBtn = styled("div")(({ token }: StyledToken) => ({
  position: "absolute",
  right: -19,
  top: "50%",
  transform: "translate(0, -50%) scaleY(1.5)",
  zIndex: 1,
  cursor: "pointer",
  borderRadius: "0 4px 4px 0",
  border: "1px solid " + token.colorPrimary,
  borderLeft: 0,
  padding: "1px 0",
  backgroundColor: token.colorPrimary,
  ".anticon": {
    display: "block",
    transform: "rotate(180deg)",
    opacity: 0.5,
  },
  "&.siderOpen": {
    backgroundColor: "inherit",
    ".anticon": {
      transform: "rotate(0deg)",
    },
  },
}))

const GanttSwitchBtn = styled(IconBtn)({
  float: "left",
  "&.ant-btn.ant-btn-icon-only": {
    width: 22,
    height: 22,
    marginRight: 2,
    "&.noChildren": {
      width: 8,
      visibility: "hidden",
    },
    ".anticon": {
      fontSize: 12,
    },
  },
})
const CardName = styled(Typography.Text)({
  display: "block",
  position: "relative",
  textIndent: 18,
  ".iicon": {
    position: "absolute",
    top: 3,
    left: -1,
  },
})

const BarBg = memo(({ dateTags }: { dateTags: DateTag[] }) => {
  // console.log("Render: GanttBarBg")
  return (
    <BarBgSvg>
      {dateTags.map((tag, i) => (
        <Fragment key={"barbg" + i}>
          {tag.isWeek && (
            <rect
              x={i * options.colWidth}
              y={0}
              width={options.colWidth}
              height={options.rowHeight}
              className="barWeek"
            />
          )}
          {tag.isCurr && (
            <path
              d={`M ${(i + 0.5) * options.colWidth} 0 v ${options.rowHeight}`}
              className="barTick currTick"
            />
          )}
          <path d={`M ${i * options.colWidth} 0 v ${options.rowHeight}`} className="barTick" />
        </Fragment>
      ))}
    </BarBgSvg>
  )
})
const BarBgSvg = styled("svg")({
  display: "block",
  width: "100%",
  height: 38,
  position: "absolute",
  top: 0,
  left: 0,
})
