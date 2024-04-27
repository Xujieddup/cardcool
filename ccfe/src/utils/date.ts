import { DateRuleEnum, DateRuleUnitEnum } from "@/enums"
import type { DateRule } from "@/types"
import dayjs from "dayjs"
import quarterOfYear from "dayjs/plugin/quarterOfYear"
import isBetween from "dayjs/plugin/isBetween"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
dayjs.extend(quarterOfYear)
dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

// 检测是否符合日期筛选规则
export const checkDateRule = (dateRule: DateRule, date: string) => {
  if (!date) return false
  if (dateRule.type === DateRuleEnum.DAD) {
    return date === dateRule.start
  } else if (dateRule.type === DateRuleEnum.DAR) {
    if (dateRule.start && dateRule.end) {
      return date >= dateRule.start && date <= dateRule.end
    } else if (dateRule.start) {
      return date >= dateRule.start
    } else if (dateRule.end) {
      return date <= dateRule.end
    } else {
      return false
    }
  } else {
    const today = dayjs()
    const objDay = dayjs(date)
    if (dateRule.type === DateRuleEnum.DRD) {
      if (dateRule.unit === DateRuleUnitEnum.DAY) {
        const nd = today.add(dateRule.start, "day")
        return nd.isSame(objDay, "day")
      } else if (dateRule.unit === DateRuleUnitEnum.WEEK) {
        const firstDay = today.startOf("week").add(1, "day")
        const startDay = firstDay.add(dateRule.start, "week")
        const endDay = startDay.add(6, "day")
        return objDay.isBetween(startDay, endDay, "day", "[]")
      } else if (dateRule.unit === DateRuleUnitEnum.MONTH) {
        const startDay = today.startOf("month").add(dateRule.start, "month")
        const endDay = startDay.endOf("month")
        return objDay.isBetween(startDay, endDay, "day", "[]")
      } else if (dateRule.unit === DateRuleUnitEnum.QUARTER) {
        const startDay = today.startOf("quarter").add(dateRule.start, "quarter")
        const endDay = startDay.endOf("quarter")
        return objDay.isBetween(startDay, endDay, "day", "[]")
      } else if (dateRule.unit === DateRuleUnitEnum.YEAR) {
        const startDay = today.startOf("year").add(dateRule.start, "year")
        const endDay = startDay.endOf("year")
        return objDay.isBetween(startDay, endDay, "day", "[]")
      }
    } else {
      if (dateRule.start !== null && dateRule.end !== null) {
        const start = Math.min(dateRule.start, dateRule.end)
        const end = Math.max(dateRule.start, dateRule.end)
        if (dateRule.unit === DateRuleUnitEnum.DAY) {
          const startDay = today.add(start, "day")
          const endDay = today.add(end, "day")
          return objDay.isBetween(startDay, endDay, "day", "[]")
        } else if (dateRule.unit === DateRuleUnitEnum.WEEK) {
          const firstDay = today.startOf("week").add(1, "day")
          const startDay = firstDay.add(start, "week")
          const endDay = firstDay.add(end, "week").add(6, "day")
          return objDay.isBetween(startDay, endDay, "day", "[]")
        } else if (dateRule.unit === DateRuleUnitEnum.MONTH) {
          const firstDay = today.startOf("month")
          const startDay = firstDay.add(start, "month")
          const endDay = firstDay.add(end, "month").endOf("month")
          return objDay.isBetween(startDay, endDay, "day", "[]")
        } else if (dateRule.unit === DateRuleUnitEnum.QUARTER) {
          const firstDay = today.startOf("quarter")
          const startDay = firstDay.add(start, "quarter")
          const endDay = firstDay.add(end, "quarter").endOf("quarter")
          return objDay.isBetween(startDay, endDay, "day", "[]")
        } else if (dateRule.unit === DateRuleUnitEnum.YEAR) {
          const firstDay = today.startOf("year")
          const startDay = firstDay.add(start, "year")
          const endDay = firstDay.add(end, "year").endOf("year")
          return objDay.isBetween(startDay, endDay, "day", "[]")
        }
      } else if (dateRule.start !== null) {
        const start = dateRule.start
        if (dateRule.unit === DateRuleUnitEnum.DAY) {
          const startDay = today.add(start, "day")
          return objDay.isSameOrAfter(startDay, "day")
        } else if (dateRule.unit === DateRuleUnitEnum.WEEK) {
          const firstDay = today.startOf("week").add(1, "day")
          const startDay = firstDay.add(start, "week")
          return objDay.isSameOrAfter(startDay, "day")
        } else if (dateRule.unit === DateRuleUnitEnum.MONTH) {
          const firstDay = today.startOf("month")
          const startDay = firstDay.add(start, "month")
          return objDay.isSameOrAfter(startDay, "day")
        } else if (dateRule.unit === DateRuleUnitEnum.QUARTER) {
          const firstDay = today.startOf("quarter")
          const startDay = firstDay.add(start, "quarter")
          return objDay.isSameOrAfter(startDay, "day")
        } else if (dateRule.unit === DateRuleUnitEnum.YEAR) {
          const firstDay = today.startOf("year")
          const startDay = firstDay.add(start, "year")
          return objDay.isSameOrAfter(startDay, "day")
        }
      } else if (dateRule.end !== null) {
        const end = dateRule.end
        if (dateRule.unit === DateRuleUnitEnum.DAY) {
          const endDay = today.add(end, "day")
          return objDay.isSameOrBefore(endDay, "day")
        } else if (dateRule.unit === DateRuleUnitEnum.WEEK) {
          const firstDay = today.startOf("week").add(1, "day")
          const endDay = firstDay.add(end, "week").add(6, "day")
          return objDay.isSameOrBefore(endDay, "day")
        } else if (dateRule.unit === DateRuleUnitEnum.MONTH) {
          const firstDay = today.startOf("month")
          const endDay = firstDay.add(end, "month").endOf("month")
          return objDay.isSameOrBefore(endDay, "day")
        } else if (dateRule.unit === DateRuleUnitEnum.QUARTER) {
          const firstDay = today.startOf("quarter")
          const endDay = firstDay.add(end, "quarter").endOf("quarter")
          return objDay.isSameOrBefore(endDay, "day")
        } else if (dateRule.unit === DateRuleUnitEnum.YEAR) {
          const firstDay = today.startOf("year")
          const endDay = firstDay.add(end, "year").endOf("year")
          return objDay.isSameOrBefore(endDay, "day")
        }
      } else {
        return false
      }
    }
  }
  return false
}

// 解析日期筛选规则，返回 [0, 时间戳]
export const parseDateRule = (dateRule: DateRule): [number, number] => {
  if (dateRule.type === DateRuleEnum.DAD) {
    const startTime = dayjs(dateRule.start).valueOf()
    return [startTime, startTime + 86399999]
  } else if (dateRule.type === DateRuleEnum.DAR) {
    if (dateRule.start && dateRule.end) {
      const startTime = dayjs(dateRule.start).valueOf()
      const endTime = dayjs(dateRule.end).valueOf() + 86399999
      return [startTime, endTime]
    } else if (dateRule.start) {
      const startTime = dayjs(dateRule.start).valueOf()
      return [startTime, 0]
    } else if (dateRule.end) {
      const endTime = dayjs(dateRule.end).valueOf() + 86399999
      return [0, endTime]
    } else {
      return [0, 0]
    }
  } else {
    const today = dayjs().startOf("day")
    if (dateRule.type === DateRuleEnum.DRD) {
      if (dateRule.unit === DateRuleUnitEnum.DAY) {
        const startTime = today.add(dateRule.start, "day").valueOf()
        return [startTime, startTime + 86399999]
      } else if (dateRule.unit === DateRuleUnitEnum.WEEK) {
        const firstDay = today.startOf("week").add(1, "day")
        const startDay = firstDay.add(dateRule.start, "week")
        const endDay = startDay.add(6, "day")
        return [startDay.valueOf(), endDay.valueOf() + 86399999]
      } else if (dateRule.unit === DateRuleUnitEnum.MONTH) {
        const startDay = today.startOf("month").add(dateRule.start, "month")
        const endDay = startDay.endOf("month")
        return [startDay.valueOf(), endDay.valueOf() + 86399999]
      } else if (dateRule.unit === DateRuleUnitEnum.QUARTER) {
        const startDay = today.startOf("quarter").add(dateRule.start, "quarter")
        const endDay = startDay.endOf("quarter")
        return [startDay.valueOf(), endDay.valueOf() + 86399999]
      } else if (dateRule.unit === DateRuleUnitEnum.YEAR) {
        const startDay = today.startOf("year").add(dateRule.start, "year")
        const endDay = startDay.endOf("year")
        return [startDay.valueOf(), endDay.valueOf() + 86399999]
      }
    } else {
      if (dateRule.start !== null && dateRule.end !== null) {
        const start = Math.min(dateRule.start, dateRule.end)
        const end = Math.max(dateRule.start, dateRule.end)
        if (dateRule.unit === DateRuleUnitEnum.DAY) {
          const startDay = today.add(start, "day")
          const endDay = today.add(end, "day")
          return [startDay.valueOf(), endDay.valueOf() + 86399999]
        } else if (dateRule.unit === DateRuleUnitEnum.WEEK) {
          const firstDay = today.startOf("week").add(1, "day")
          const startDay = firstDay.add(start, "week")
          const endDay = firstDay.add(end, "week").add(6, "day")
          return [startDay.valueOf(), endDay.valueOf() + 86399999]
        } else if (dateRule.unit === DateRuleUnitEnum.MONTH) {
          const firstDay = today.startOf("month")
          const startDay = firstDay.add(start, "month")
          const endDay = firstDay.add(end, "month").endOf("month")
          return [startDay.valueOf(), endDay.valueOf() + 86399999]
        } else if (dateRule.unit === DateRuleUnitEnum.QUARTER) {
          const firstDay = today.startOf("quarter")
          const startDay = firstDay.add(start, "quarter")
          const endDay = firstDay.add(end, "quarter").endOf("quarter")
          return [startDay.valueOf(), endDay.valueOf() + 86399999]
        } else if (dateRule.unit === DateRuleUnitEnum.YEAR) {
          const firstDay = today.startOf("year")
          const startDay = firstDay.add(start, "year")
          const endDay = firstDay.add(end, "year").endOf("year")
          return [startDay.valueOf(), endDay.valueOf() + 86399999]
        }
      } else if (dateRule.start !== null) {
        const start = dateRule.start
        if (dateRule.unit === DateRuleUnitEnum.DAY) {
          const startDay = today.add(start, "day")
          return [startDay.valueOf(), 0]
        } else if (dateRule.unit === DateRuleUnitEnum.WEEK) {
          const firstDay = today.startOf("week").add(1, "day")
          const startDay = firstDay.add(start, "week")
          return [startDay.valueOf(), 0]
        } else if (dateRule.unit === DateRuleUnitEnum.MONTH) {
          const firstDay = today.startOf("month")
          const startDay = firstDay.add(start, "month")
          return [startDay.valueOf(), 0]
        } else if (dateRule.unit === DateRuleUnitEnum.QUARTER) {
          const firstDay = today.startOf("quarter")
          const startDay = firstDay.add(start, "quarter")
          return [startDay.valueOf(), 0]
        } else if (dateRule.unit === DateRuleUnitEnum.YEAR) {
          const firstDay = today.startOf("year")
          const startDay = firstDay.add(start, "year")
          return [startDay.valueOf(), 0]
        }
      } else if (dateRule.end !== null) {
        const end = dateRule.end
        if (dateRule.unit === DateRuleUnitEnum.DAY) {
          const endDay = today.add(end, "day")
          return [0, endDay.valueOf()]
        } else if (dateRule.unit === DateRuleUnitEnum.WEEK) {
          const firstDay = today.startOf("week").add(1, "day")
          const endDay = firstDay.add(end, "week").add(6, "day")
          return [0, endDay.valueOf()]
        } else if (dateRule.unit === DateRuleUnitEnum.MONTH) {
          const firstDay = today.startOf("month")
          const endDay = firstDay.add(end, "month").endOf("month")
          return [0, endDay.valueOf()]
        } else if (dateRule.unit === DateRuleUnitEnum.QUARTER) {
          const firstDay = today.startOf("quarter")
          const endDay = firstDay.add(end, "quarter").endOf("quarter")
          return [0, endDay.valueOf()]
        } else if (dateRule.unit === DateRuleUnitEnum.YEAR) {
          const firstDay = today.startOf("year")
          const endDay = firstDay.add(end, "year").endOf("year")
          return [0, endDay.valueOf()]
        }
      }
    }
  }
  return [0, 0]
}

// 日期条件列表，适用于日期类型属性
export const isAbsRule = (type: DateRuleEnum) =>
  type === DateRuleEnum.DAD || type === DateRuleEnum.DAR
export const dateAbsRuleUnitOpts = [{ value: DateRuleUnitEnum.DAY, label: "天" }]
export const dateRelateRuleUnitOpts = [
  { value: DateRuleUnitEnum.DAY, label: "天" },
  { value: DateRuleUnitEnum.WEEK, label: "周" },
  { value: DateRuleUnitEnum.MONTH, label: "月" },
  { value: DateRuleUnitEnum.QUARTER, label: "季度" },
  { value: DateRuleUnitEnum.YEAR, label: "年" },
]
const formatRelateDesc = (numVal: number, unitStr: string) => {
  const num = Math.floor(numVal)
  if (num === 0) {
    return unitStr === "天" ? "今天" : "本" + unitStr + "内"
  } else if (num > 0) {
    const text = unitStr === "天" ? "今天之后的第" : "本" + unitStr + "之后的第"
    return text + num + unitStr
  } else {
    const text = unitStr === "天" ? "今天之前的第" : "本" + unitStr + "之前的第"
    return text + -num + unitStr
  }
}
// 解析规则说明
export const parseDateRuleDesc = (rule: any) => {
  if (!rule) {
    return "点击设置日期筛选规则"
  }
  // console.log("rule", rule)
  const isAbsRule = rule.type === DateRuleEnum.DAD || rule.type === DateRuleEnum.DAR
  const unitStr = !isAbsRule
    ? dateRelateRuleUnitOpts.find((o) => o.value === rule.unit)?.label || "天"
    : "天"
  let desc = ""
  if (rule.start === null && rule.end === null) {
    desc = ""
  } else {
    switch (rule.type) {
      case DateRuleEnum.DAD:
        desc = !rule.start ? "" : "日期须为 " + dayjs(rule.start).format("YYYY-MM-DD")
        break
      case DateRuleEnum.DAR:
        if (!rule.start) {
          desc = "日期须在 " + dayjs(rule.end).format("YYYY-MM-DD") + " 之前"
        } else if (!rule.end) {
          desc = "日期须在 " + dayjs(rule.start).format("YYYY-MM-DD") + " 之后"
        } else {
          const date1 = dayjs(rule.start).format("YYYY-MM-DD")
          const date2 = dayjs(rule.end).format("YYYY-MM-DD")
          if (date1 === date2) {
            desc = "日期须为 " + dayjs(rule.start).format("YYYY-MM-DD")
          } else if (date1 < date2) {
            desc = "日期须在 " + date1 + " ~ " + date2 + " 之间"
          } else {
            desc = "日期须在 " + date2 + " ~ " + date1 + " 之间"
          }
        }
        break
      case DateRuleEnum.DRD:
        desc = rule.start === null ? "" : "日期须为 " + formatRelateDesc(rule.start, unitStr)
        break
        break
      case DateRuleEnum.DRR:
        if (rule.start === null) {
          desc = "日期须在 " + formatRelateDesc(rule.end, unitStr) + "之前"
        } else if (rule.end === null) {
          desc = "日期须在 " + formatRelateDesc(rule.start, unitStr) + "之后"
        } else {
          const date1 = formatRelateDesc(rule.start, unitStr)
          const date2 = formatRelateDesc(rule.end, unitStr)
          if (rule.start === rule.end) {
            desc = "日期须为 " + formatRelateDesc(rule.start, unitStr)
          } else if (rule.start < rule.end) {
            desc = "日期须在 " + date1 + " ~ " + date2 + "之间"
          } else {
            desc = "日期须在 " + date2 + " ~ " + date1 + "之间"
          }
        }
        break
    }
  }
  return desc
}

// 解析日期: 2023-07-04
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d)
}

// 解析时间: 2023-07-04 21:58:52
export const formatDateTime = (timestamp: number) => {
  const time = new Date(timestamp * 1000)
  const year = time.getFullYear()
  const month = time.getMonth() + 1
  const date = time.getDate()
  const hours = time.getHours()
  const minute = time.getMinutes()
  const second = time.getSeconds()
  return (
    year +
    "-" +
    (month < 10 ? "0" + month : month) +
    "-" +
    (date < 10 ? "0" + date : date) +
    " " +
    (hours < 10 ? "0" + hours : hours) +
    ":" +
    (minute < 10 ? "0" + minute : minute) +
    ":" +
    (second < 10 ? "0" + second : second)
  )
}

// 获取当前日期: 2023-07-04
export const getDate = (): string => {
  const date = new Date()
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d)
}
