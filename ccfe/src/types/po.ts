import type { JSONContent } from "@tiptap/react"
import type { XYPosition } from "@/reactflow"
import type { MangoQuerySortDirection } from "rxdb"
import type GridLayout from "react-grid-layout"
import {
  CondEnum,
  DateRuleEnum,
  DateRuleUnitEnum,
  LayoutEnum,
  PropHideEnum,
  PropNameEnum,
  ShapeTypeEnum,
  VNTypeEnum,
} from "@/enums"
import { NodeStyleType } from "./card"

export type PropObj = {
  [k: string]: any
}

export type Space = {
  id: string
  name: string
  icon: string
  desc: string
  snum: number
  update_time: number
  is_deleted: boolean
}
export type SpaceStat = { viewCnt?: number; cardCnt?: number }
export type SpaceObj = Space & SpaceStat

export type View = {
  id: string
  name: string
  space_id: string
  pid: string
  snum: number
  type: number // 视图类型: 视图类型: 0-List，1-Graph
  inline_type: number // 内联类型: 0-非内联，1-内联
  config: string
  content: string // 文档视图的内容
  is_favor: boolean // 是否收藏
  icon: string
  desc: string
  update_time: number
  is_deleted: boolean
}

export type ViewInfo = {
  viewId: string
  spaceId: string
  viewType: number // 视图类型: 视图类型: 0-List，1-Graph
  mainViewId?: string // 内联视图的主视图 id，undefined 表示无主视图(非内联视图)
}

// 甘特图特殊规则：开始时间、结束时间、标题展示等
export type GanttRule = {
  start: string
  end: string
  text: string
}
// 视图过滤规则
export type FilterRule = {
  // 筛选项类型，为""表示卡片通用属性: name/type/tag/update_time 等，"xxx" 指定卡片模板
  typeId: string
  propId: string
  cond: CondEnum
  value: string
}
export type GrouperRule = {
  // 分组规则类型，为""表示卡片通用属性: type/tag/update_time 等，"xxx" 指定卡片模板
  typeId: string
  propId: string
  value: MangoQuerySortDirection
}
export type SorterRule = {
  // 筛选项类型，为""表示卡片通用属性: name/type/tag/update_time 等，"xxx" 指定卡片模板
  typeId: string
  propId: string
  value: MangoQuerySortDirection
}
export type RuleItem = {
  id: string
  name: string
  // 限定卡片模板
  typeId: string
  // 甘特图特殊规则
  gantt?: GanttRule
  // 视图数据筛选规则
  filters: FilterRule[]
  // 视图数据分组规则
  groupers: GrouperRule[]
  // 视图数据排序规则
  sorters: SorterRule[]
}
// 列表视图配置
export type ViewCfg = {
  // 规则 ID
  ruleId: string
  // 规则条件列表
  rules: RuleItem[]
}
// 规则配置
export type RuleConfig = {
  // 规则 ID
  ruleId: string
  // 限定卡片模板
  typeId: string
  // 甘特图特殊规则
  gantt?: GanttRule
  // 视图数据筛选规则
  filters: FilterRule[]
  // 视图数据分组规则
  groupers: GrouperRule[]
  // 视图数据排序规则
  sorters: SorterRule[]
  // 设置筛选规则时，用于触发刷新的时间值
  refreshTime: number
}
// 校验之后的有效规则
export type RuleCfg = {
  // 限定卡片模板
  typeId: string
  // 限定白板 ID
  boardId: string
  // 甘特图特殊规则
  gantt?: GanttRule
  // 数据库查询条件
  dbFilters: FilterRule[]
  // 数据集遍历筛选条件
  propFilters: FilterRule[]
  // 分组排序条件
  groupers: GrouperRule[]
  // 视图数据排序规则
  sorters: SorterRule[]
  typeInfo?: NodeTypeObj
  propMap?: Map<string, NodeTypeProp>
}
// 创建视图时的配置信息
export type InsertViewCfg = ViewCfg & {
  // 看板的初始规则
  kanbanRules: RuleItem[]
  gantt?: GanttRule
}
/**
 * {
    typeId: validTypeId,
    boardId,
    dbFilters,
    propFilters,
    groupers: grouperSorters,
    sorters: validSorters,
  }
 */
export type DateRule = {
  propId?: string
  // 时间筛选规则类型
  type: DateRuleEnum
  unit: DateRuleUnitEnum
  // 开始和结束日期
  start: any
  end: any
}
// export type TypePropRule = {
//   // 筛选项类型，common - 卡片通用属性: name/type/tag/update_time 等，"xxx" 指定卡片模板
//   type: string
//   propId: string
//   cond: CondEnum
//   value: string
// }
// export enum SortEnum {
//   ASC = "asc", // 正序
//   DESC = "desc", // 倒序
// }
// export type SortItem = {
//   propId: string
//   value: MangoQuerySortDirection
// }
// export type Filter = {
//   // 卡片通用属性(name/tag/content/create_time/update_time)、画布 Id、卡片模板 Id
//   rules: TypePropRule[]
//   // 指定卡片模板
//   cardType: {
//     // 指定卡片模板 Id
//     typeId: string
//     // 卡片模板的属性条件关系，0-或，1-且
//     filterType: number
//     propRules: TypePropRule[]
//   }
// }
// export type InterView = {
//   id: string
//   filter: Filter
//   sorts: SortItem[]
// }
// // 列表视图配置
// export type ViewConfig = {
//   // 视图数据集筛选条件
//   filter: Filter
//   // 默认展示的视图 id，默认为 default
//   vid: string
//   // 视图列表
//   views: InterView[]

//   width?: number
//   // 用于触发刷新的时间值
//   refreshTime?: number
// }
// const defaultFilter: Filter = {
//   rules: [],
//   cardType: {
//     typeId: "",
//     filterType: 0,
//     propRules: [],
//   },
// }
// export const defaultSorts: SortItem[] = [
//   {
//     propId: "update_time",
//     value: SortEnum.DESC,
//   },
// ]
// export const defaultViewConfig: ViewConfig = {
//   filter: defaultFilter,
//   vid: "default",
//   views: [
//     {
//       id: "default",
//       filter: defaultFilter,
//       sorts: [
//         {
//           propId: "update_time",
//           value: SortEnum.DESC,
//         },
//       ],
//     },
//   ],
// }
// export type ViewConfig2 = {
//   keyword: string
//   scope: string
//   cardType: string
//   sort: string
// }
// export const defaultViewConfig2: ViewConfig2 = {
//   keyword: "",
//   scope: "",
//   cardType: "",
//   sort: "id-desc",
// }

export type Card = {
  id: string
  space_id: string
  type_id: string
  name: string
  tags: string[]
  links: string[]
  props: string
  content: string
  create_time: number
  update_time?: number
  is_deleted: boolean
}
export type CardData = Card & { propsObj: CardProps }

export type CardProp = {
  id: string
  name: string
  type: string
  val: any
  handles?: string[]
  show?: string[]
  options?: SelectOpt[]
}

export type CardProps = {
  [key: string]: any
}
// export type JSONContent = {
//   type?: string
//   attrs?: Record<string, any>
//   content?: JSONContent[]
//   marks?: {
//     type: string
//     attrs?: Record<string, any>
//     [key: string]: any
//   }[]
//   text?: string
//   [key: string]: any
// }
export type CardObj = {
  id: string
  space_id: string
  type_id: string
  name: string
  icon: string
  tags: string[]
  props: CardProp[]
  propsObj: CardProps
  content: JSONContent
  create_time: number
  update_time: number
}
export type CardDataObj = CardObj & {
  create_date: string
  update_date: string
}

export type CardOption = {
  id: string
  type_id: string
  name: string
  update_time: number
}
export type ViewOption = {
  id: string
  name: string
  icon: string
  update_time: number
}

export type ViewNode = {
  id: string
  view_id: string
  group_id: string
  pid: string
  node_type: number // 视图节点类型: 0-视图内节点，1-卡片，2-视图
  node_id: string
  vn_type_id: VNTypeEnum // 视图中节点的类型 id
  name: string // 名字 & 别名
  content: string // 视图中节点的信息
  update_time: number
  is_deleted: boolean
}
// 视图节点的内容类型: card/view/text/mind/shape
export type VNContent = {
  // 节点位置: 除 mind 节点外
  position?: XYPosition
  // 节点的宽度: card/view/text/shape
  width?: number
  // 节点宽度自适应: card/view/text
  autoWidth?: boolean
  // 节点的高度: shape
  height?: number
  // 布局类型
  layout?: LayoutEnum
  // 节点展示样式: card/view - fold/full/cus
  styleId?: NodeStyleType
  // 图形节点类型
  shapeType?: ShapeTypeEnum
  // 背景颜色: 所有节点
  bgColor?: string
  // 节点排序: 仅 mind 节点
  snum?: number
  // 富文本内容: text/mind/shape
  ext?: string
}
// 视图节点的内容类型
export type CardNodeInfo = {
  id: string
  vn_type_id: string
}

// 视图 - 节点关联关系
export type ViewEdge = {
  id: string
  view_id: string
  source: string // 开始节点
  target: string // 结束节点
  source_handle: string // 开始节点 handle
  target_handle: string // 结束节点 handle
  ve_type_id: string // 视图中关联边的类型 id
  name: string // 名字
  content: string // 视图中关联边的信息
  update_time: number
  is_deleted: boolean
}

export type TypeProp = {
  id: string
  name: string
  nameType: PropNameEnum
  type: string
  defaultVal: any
  hide: PropHideEnum
  layout: GridLayout.Layout
  handles?: string[]
  show?: string[]
  options?: SelectOpt[]
}
export type PropStyleLayout = {
  w: number
  h: number
  x: number
  y: number
}
export type PropStyle = {
  id: string
  nameType: PropNameEnum
  hide: PropHideEnum
  layout: PropStyleLayout
  show?: string[]
}
// 卡片样式
export type TypeStyle = {
  id: string
  name: string
  styles: PropStyle[]
}
export type TypePropStyle = {
  id: string
  name: string
  props: TypeProp[]
}
// 应该被 TypeProp 替代 TODO
export type NodeTypeProp = {
  id: string
  name: string
  type: string
  handles?: string[]
  show?: string[]
  options?: SelectOpt[]
}
export type SelectOpt = {
  id: string
  label: string
  color: string
}

export type NodeType = {
  id: string
  name: string
  icon: string
  snum: number
  props: string
  styles: string
  desc: string
  update_time?: number
  is_deleted: boolean
}

export type TypeInfo = {
  id: string
  name: string
  icon: string
  props: TypeProp[]
  styles: TypeStyle[]
  desc: string
  // snum: number
}
export type TypeItem = NodeTypeInfo & { cardCnt?: number }

export type NodeTypeInfo = {
  id: string
  name: string
  icon: string
  snum: number
  props: NodeTypeProp[]
  desc?: string
}
export type TypeItemInfo = NodeTypeInfo & { cardCnt?: number }
export type NodeTypeObj = {
  id: string
  name: string
  icon: string
  snum: number
  props: NodeTypeProp[]
  props2: TypeProp[]
  desc?: string
}
export type TypeItemObj = NodeTypeObj & { cardCnt?: number }

export type CardTag = {
  id: string
  name: string
  space_id: string
  pid: string
  color: string
  snum: number
  update_time: number
  is_deleted: boolean
}
export type FlowNodeData = {
  nodeId: string
  label: string
  width: number
  height: number
}

export type NodeData = {
  nodeId: string
  nodeType: number
  // label 即将删除
  // label: string
  // icon 即将删除
  // icon: string
  // 导图节点的上级节点 id
  pid?: string
  width?: number
  // 宽度自适应，所有图形节点 autoWidth 强制为 false
  autoWidth?: boolean
  height?: number
  styleId?: NodeStyleType
  layout?: LayoutEnum
  // 图形节点类型
  shapeType?: ShapeTypeEnum
  // 背景颜色，undefined-透明色
  bgColor?: string
  snum?: number
  ext?: string
  cardInfo?: CardObj
  viewInfo?: View
  // 前端临时字段
  // 是否在调整节点大小中
  resizing?: boolean
  // 节点初始化时自动进入编辑状态，只有拖拽创建导图根节点、按 Tab/Enter 键创建导图节点、按 Space 进入编辑状态、双击创建文本节点时会赋值(Date.now())，其他都是 undefined
  etime?: number
  // 禁止编辑，只有视图集导图的所有节点禁止编辑(设为 true)，其他都是 undefined
  forbidEdit?: boolean
  // 导图节点拖拽时，需要保存拖拽前的位置，因此在计算导图布局时，将其缓存
  px?: number
  py?: number
}
export type EdgeData = {
  label?: string
  groupId?: string
  et?: number
}
export type MindNodeItem = {
  id: string
  // 节点在同一层级的序号(从 0 开始)
  index: number
  pid: string
  snum: number
  positions: XYPosition[]
  // 节点在导图中的层级深度(根节点为 0)
  depth: number
  children: MindNodeItem[]
}
