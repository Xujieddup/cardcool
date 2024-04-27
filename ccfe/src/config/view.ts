import { SpecialViewEnum, SpecialViewTypeEnum, ViewInlineType, ViewTypeEnum } from "@/enums"
import type { View } from "@/types"

const specialViews: View[] = [
  {
    id: SpecialViewEnum.CARDS,
    name: "卡片盒",
    space_id: "",
    pid: "",
    snum: 0,
    type: SpecialViewTypeEnum.CARDS,
    inline_type: ViewInlineType.NOTINLINE,
    is_favor: false,
    icon: "cates",
    desc: "",
    config: "{}",
    content: "",
    update_time: 0,
    is_deleted: false,
  },
  {
    id: SpecialViewEnum.VIEWS,
    name: "视图集",
    space_id: "",
    pid: "",
    snum: 0,
    type: SpecialViewTypeEnum.VIEWS,
    inline_type: ViewInlineType.NOTINLINE,
    is_favor: false,
    icon: "boards",
    desc: "所有视图的集合",
    config: "{}",
    content: "",
    update_time: 0,
    is_deleted: false,
  },
  {
    id: SpecialViewEnum.SPACES,
    name: "空间管理",
    space_id: "",
    pid: "",
    snum: 0,
    type: SpecialViewTypeEnum.SPACES,
    inline_type: ViewInlineType.NOTINLINE,
    is_favor: false,
    icon: "database",
    desc: "",
    config: "{}",
    content: "",
    update_time: 0,
    is_deleted: false,
  },
  {
    id: SpecialViewEnum.TYPES,
    name: "卡片模板",
    space_id: "",
    pid: "",
    snum: 0,
    type: SpecialViewTypeEnum.TYPES,
    inline_type: ViewInlineType.NOTINLINE,
    is_favor: false,
    icon: "cards",
    desc: "",
    config: "{}",
    content: "",
    update_time: 0,
    is_deleted: false,
  },
  {
    id: SpecialViewEnum.TAGS,
    name: "卡片标签",
    space_id: "",
    pid: "",
    snum: 0,
    type: SpecialViewTypeEnum.TAGS,
    inline_type: ViewInlineType.NOTINLINE,
    is_favor: false,
    icon: "tags",
    desc: "",
    config: "{}",
    content: "",
    update_time: 0,
    is_deleted: false,
  },
  {
    id: SpecialViewEnum.STARS,
    name: "收藏夹",
    space_id: "",
    pid: "",
    snum: 0,
    type: SpecialViewTypeEnum.STARS,
    inline_type: ViewInlineType.NOTINLINE,
    is_favor: false,
    icon: "",
    desc: "",
    config: "{}",
    content: "",
    update_time: 0,
    is_deleted: false,
  },
  {
    id: SpecialViewEnum.DELETES,
    name: "回收站",
    space_id: "",
    pid: "",
    snum: 0,
    type: SpecialViewTypeEnum.DELETES,
    inline_type: ViewInlineType.NOTINLINE,
    is_favor: false,
    icon: "",
    desc: "",
    config: "{}",
    content: "",
    update_time: 0,
    is_deleted: false,
  },
]
// 获取特殊视图信息
export const getSpecialView = (spaceId: string, viewId: SpecialViewEnum) => {
  const view = specialViews.find((v) => v.id === viewId)
  if (view) {
    return { ...view, space_id: spaceId, update_time: Date.now() }
  }
  return null
}
// 获取视图类型对应 icon
export const getIconByViewType = (viewType: ViewTypeEnum) => {
  switch (viewType) {
    case ViewTypeEnum.LIST:
      return "cate"
    case ViewTypeEnum.BOARD:
      return "board"
    case ViewTypeEnum.KANBAN:
      return "kanban"
    case ViewTypeEnum.GANTT:
      return "gantt"
    case ViewTypeEnum.DOC:
      return "doc"
    case ViewTypeEnum.MDOC:
      return "mdoc"
    default:
      return "cate"
  }
}
