import { ViewTypeEnum } from "@/enums"

export type ViewItem = {
  id: string
  name: string
  pid: string
  snum: number
  type: ViewTypeEnum
  icon: string
  is_favor: boolean
  children: ViewItem[]
  // collapsed?: boolean
}

export type FlattenedItem = ViewItem & {
  // parentId: string
  depth: number
  index: number
}
