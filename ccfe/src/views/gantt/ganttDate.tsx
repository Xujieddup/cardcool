import React, { memo } from "react"
import type { GanttOptions } from "@/types"
import styled from "@emotion/styled"
import { DateModeEnum } from "@/enums"
import dayjs, { type Dayjs } from "dayjs"

type TmpDate = {
  upperText: string
  lowerText: string
  upperX: number
  upperY: number
  lowerX: number
  lowerY: number
  isCurrDate?: boolean
}
type Props = { dateMode: DateModeEnum; dates: Dayjs[]; options: GanttOptions }

// 构建网格日期列
const calcDates = (dates: Dayjs[], dateMode: DateModeEnum, options: GanttOptions) => {
  let prevDate: Dayjs | undefined = undefined
  const lastDate = dates[dates.length - 1]
  const today = dayjs()
  const upperDates: TmpDate[] = []
  const lowerDates: TmpDate[] = []
  dates.forEach((d, i) => {
    const date = getDateInfo(d, i, lastDate, dateMode, options, prevDate)
    prevDate = d
    if (date.upperText) {
      upperDates.push(date)
      // const upperDate = createSVG("text", {
      //   x: date.upperX,
      //   y: date.upperY,
      //   innerHTML: date.upperText,
      //   class: "upper-text",
      //   filter: "url(#solid)",
      //   append_to: $dateSvg,
      // })
      // dateList.push({ x: date.upperX, el: upperDate, tx: 0 })
    }
    date.isCurrDate = today.isSame(d, dateMode)
    lowerDates.push(date)
  })
  return { upperDates, lowerDates }
}
const getDateInfo = (
  date: Dayjs,
  i: number,
  lastDate: Dayjs,
  dateMode: DateModeEnum,
  options: GanttOptions,
  prevDate?: Dayjs
): TmpDate => {
  const startX = i * options.colWidth
  const upperY = 16
  const lowerY = 40
  if (dateMode === DateModeEnum.DAY) {
    const upperText = date.month() !== prevDate?.month() ? date.format("YYYY-MM") : ""
    const lowerText = date.format("DD")
    const lowerX = startX + options.colWidth / 2
    return { upperText, lowerText, upperX: startX + 6, upperY, lowerX, lowerY }
  } else if (dateMode === DateModeEnum.MONTH) {
    const upperText = date.year() !== prevDate?.year() ? date.format("YYYY") : ""
    const lowerText = date.format("MM")
    const lowerX = startX + options.colWidth / 2
    return { upperText, lowerText, upperX: startX + 6, upperY, lowerX, lowerY }
  } else {
    const upperText = date.year() !== prevDate?.year() ? date.format("YYYY") : ""
    const lowerText = date.format("YYYY")
    const lowerX = startX + options.colWidth / 2
    return { upperText, lowerText, upperX: startX + 6, upperY, lowerX, lowerY }
  }
}

export const GanttDate = memo(({ dateMode, dates, options }: Props) => {
  const { upperDates, lowerDates } = calcDates(dates, dateMode, options)
  console.log("Render: GanttDate")
  return (
    <GanttDateBox>
      {upperDates.map((d) => (
        <text key={d.upperX + "_" + d.upperY} x={d.upperX} y={d.upperY} textAnchor="start">
          {d.upperText}
        </text>
      ))}
      {lowerDates.map((d) => (
        <text
          key={d.lowerX + "_" + d.lowerY}
          x={d.lowerX}
          y={d.lowerY}
          className={d.isCurrDate ? "lowerDate currDate" : "lowerDate"}
          textAnchor="middle"
        >
          {d.lowerText}
        </text>
      ))}
    </GanttDateBox>
  )
})
const GanttDateBox = styled("svg")({
  display: "block",
  width: "100%",
  height: 40,
  ".lowerDate": {
    fontWeight: 400,
    fontSize: 13,
  },
})
