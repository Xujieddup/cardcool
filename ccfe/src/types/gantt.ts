import { DateModeEnum } from "@/enums"
import type { SetMCardId } from "@/store"
import type { Dayjs } from "dayjs"

export type Task = {
  id: string
  name: string
  start?: Dayjs
  end?: Dayjs
  progress?: number
  invalid?: boolean
  customClass?: string
}
export type DateTag = { isWeek: boolean; isCurr: boolean }

// export interface EnrichedTask extends Task {
//   _start: Dayjs
//   _end: Dayjs
//   _index: number
//   invalid?: boolean
// }

export interface Options {
  dateModes: DateModeEnum[]
  dateMode: DateModeEnum

  // 头部高度
  header_height: number
  // 每一列时间块的宽度
  column_width: number
  // 间隙
  padding: number
  // 每一行的高度
  bar_height: number
  // 时间条四个角的半径
  barCornerRadius: number

  arrow_curve: number
  date_format: string
  popup_trigger: string
  onDbClick: (setMCardId: SetMCardId) => void
  on_click: (task: Task) => void
  on_date_change: (task: Task, start: Date, end: Date) => void
  on_progress_change: (task: Task, progress: number) => void
  onViewChange: (dateMode: DateModeEnum) => void
}
export type GanttOptions = {
  // dateModes: DateModeEnum[]
  // dateMode: DateModeEnum

  // 头部高度
  // header_height: number
  // 每一列时间块的宽度
  colWidth: number
  // 间隙
  padding: number
  rowHeight: number
  // 每一行的高度
  barHeight: number
  // 时间条四个角的半径
  barCornerRadius: number
  // 拖拽锚点的宽度
  handleWidth: number

  // arrow_curve: number
  // date_format: string
  // popup_trigger: string
  // onDbClick: (setMCardId: SetMCardId) => void
  // on_click: (task: Task) => void
  // on_date_change: (task: Task, start: Date, end: Date) => void
  // on_progress_change: (task: Task, progress: number) => void
  // onViewChange: (dateMode: DateModeEnum) => void
}

export interface GanttInterface {
  changeDateMode(dateMode?: DateModeEnum): void
  refresh(tasks: Task[]): void
}
