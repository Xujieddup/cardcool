import { DateModeEnum } from "@/enums"
import type { DateTag } from "@/types"
import dayjs, { type Dayjs } from "dayjs"
import weekday from "dayjs/plugin/weekday"
import "dayjs/locale/zh-cn"
dayjs.locale("zh-cn")
dayjs.extend(weekday)

export const parseDates = (startDate?: Dayjs, endDate?: Dayjs) => {
  const today = dayjs()
  // 任务项为空，则默认为本周一至本周日
  if (!startDate || !endDate) {
    startDate = dayjs().startOf("day")
    endDate = dayjs().startOf("day")
  }
  let dateMode = DateModeEnum.DAY
  const days = endDate.diff(startDate, "day")
  if (days < 60) {
    // 天数小于 60，则补全 60
    const dayVal = Math.ceil((60 - days) / 2)
    startDate = startDate.subtract(dayVal, "day").weekday(0)
    endDate = endDate.add(dayVal, "day").weekday(6)
    dateMode = DateModeEnum.DAY
  } else if (days < 730) {
    // 按每天展示
    startDate = startDate.subtract(1, "day").weekday(0)
    endDate = endDate.add(1, "day").weekday(6)
    dateMode = DateModeEnum.DAY
  } else {
    const years = endDate.diff(startDate, "year")
    if (years < 50) {
      // 按每月展示
      startDate = startDate.subtract(1, "month").startOf("year")
      endDate = endDate.add(1, "month").endOf("year")
      dateMode = DateModeEnum.MONTH
    } else {
      // 按每年展示
      startDate = startDate.subtract(1, "year")
      endDate = endDate.add(1, "year")
      dateMode = DateModeEnum.YEAR
    }
  }
  // console.log("gantt date", startDate.format(), endDate.format())
  // 设置日期列表
  const dates = []
  const dateTags: DateTag[] = []
  let currDate: null | Dayjs = null
  while (currDate === null || currDate.isBefore(endDate)) {
    if (!currDate) {
      currDate = startDate
    } else {
      if (dateMode === DateModeEnum.DAY) {
        currDate = currDate.add(1, "day")
      } else if (dateMode === DateModeEnum.MONTH) {
        currDate = currDate.add(1, "month")
      } else {
        currDate = currDate.add(1, "year")
      }
    }
    dates.push(currDate)
    dateTags.push({
      isWeek: dateMode === DateModeEnum.DAY && currDate.weekday() >= 5,
      isCurr: today.isSame(currDate, dateMode),
    })
  }
  return { dateMode, ganttStartDate: startDate, ganttEndDate: endDate, dates, dateTags }
}

// 修正拖拽距离，小于半格时忽略，大于半格时+1
export const getAmendDx = (dx: number, colWidth: number) => {
  if (dx >= 0) {
    const rem = dx % colWidth
    return dx - rem + (rem < colWidth / 2 ? 0 : colWidth)
  } else {
    const rem = -dx % colWidth
    return dx + rem - (rem < colWidth / 2 ? 0 : colWidth)
  }
}
