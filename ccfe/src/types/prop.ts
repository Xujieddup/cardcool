import { ReactNode } from "react"
import type { GlobalToken, MenuProps } from "antd"
import type { CardObj, NodeTypeObj, ViewNode } from "./po"
import type { PresetColorKey } from "antd/es/theme/internal"
import { Rect, XYPosition } from "@/reactflow"
import { NodeStyleType } from "./card"
import { LayoutEnum } from "@/enums"

export type StyledToken = { token: GlobalToken }

export type ColorKey = PresetColorKey | "primary"
export type ColorMap = {
  [key in ColorKey]: string
}

/**
export declare const PresetColors: readonly ["blue", "purple", "cyan", "green", "magenta", "pink", "red", "orange", "yellow", "volcano", "geekblue", "lime", "gold"];
export type PresetColorKey = typeof PresetColors[number];
export type PresetColorType = Record<PresetColorKey, string>;
type ColorPaletteKeyIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type LegacyColorPalettes = {
    [key in `${keyof PresetColorType}-${ColorPaletteKeyIndex}`]: string;
};
export type ColorPalettes = {
    [key in `${keyof PresetColorType}${ColorPaletteKeyIndex}`]: string;
};
 */

export type LoginData = {
  mobile: string
  password: string
}
export type RegisterData = {
  mobile: string
  code: string
  auth_code: string
  password: string
}

export type OptItem = {
  label: string
  value: string
  disabled?: boolean
}

export type FormNode = {
  id?: string
  name: string
} & CardPropData
export type CardPropData = {
  [k: string]: any
}

export type ViewNodeData = {
  vn: ViewNode
  node?: Node
}

export type GraphNode = {
  id: string
  name: string
  node_type: number // 节点类型: 0-非节点，1-节点，2-视图
  item: any
}

// 列表视图中的节点信息
export type ListNode = {
  id: string
  name: string
  node_type: number // 节点类型: 0-非节点，1-节点，2-视图
  type: NodeTypeObj | undefined // 节点类型信息
  item: CardObj
}

export type GraphEdge = {
  id: string
  source: string
  target: string
  name: string
}

export type Anchor = "left" | "top" | "right" | "bottom" | "edit"

export type Layout = {
  left: number
  right: number
  top: number
  bottom: number
  edit: number
}

// 菜单栏数据列表
export type MenuViewData = {
  id: string
  name: string
  children: MenuViewData[]
}
export type MenuViewDataBackup = {
  key: string
  label: ReactNode
  icon: ReactNode
  children?: MenuViewDataBackup[]
  onTitleClick?: (info: any) => void
}

// 编辑视图属性
export type EditViewProps = {
  open: boolean
  space_id: string
  view_id: string
  name: string
  new_name: string
  pid: string
  error: string
}
export const defaultEditView = {
  open: false,
  space_id: "",
  view_id: "",
  name: "",
  new_name: "",
  pid: "",
  error: "",
}

// 编辑视图属性
export type Resp = {
  code: number
  msg: string
  data: any
}
export type TimeData = {
  last_update_time: number
  current_time: number
}

export type EditTypeProp = {
  id: string
  name: string
}
export const defaultEditTypeProp = {
  id: "",
  name: "",
}
export type EditTypeInfo = {
  id: string
  name: string
  newName: string
  open: boolean
}
export const defaultEditTypeInfo = {
  id: "",
  name: "",
  newName: "",
  open: false,
}
export type RuleSnap = {
  viewId: string
  ruleId: string
  ruleName: string
}
export type EditTag = {
  id: string
  name: string
  color: string
}
export type EditStyleName = {
  id: string
  name: string
}
export type ViewNameObj = {
  id: string
  name: string
}

export type FunType = () => void
export type UploadFunType = (url: string) => void

export type MenuInfo = {
  key: string
  keyPath: string[]
  domEvent: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
}
export declare type MenuItemClickEventHandler = (info: MenuInfo, id: string) => void
export type Colors = Map<string, { type: string; bg: string; num: number; color?: string }>

// 微信扫码授权回调的用户信息
export type CBUserData = {
  openid: string
  unionid: string
  username: string
  avatar: string
}

// 用于判断分组节点相交的临时 Rect
export type TempRect = Rect & { cnt: number; id: string; type?: string; layout?: LayoutEnum }

// 需要更新的节点参数，为 undefined 表示不更新
export type VNParam = {
  groupId?: string
  pid?: string
  position?: XYPosition | null
  snum?: number | null
  styleId?: NodeStyleType
  autoWidth?: boolean
  layout?: LayoutEnum | null
}

// 白板辅助线数据
export type HelperLineData = {
  horizontal?: number
  vertical?: number
  startX?: number
  startY?: number
  endX?: number
  endY?: number
}

export type DdMenu = {
  x: number
  y: number
  w: number
  h: number
  items: MenuProps["items"]
}

export type XYPos = { x: number; y: number }
// 屏幕分栏属性
export type ScreenProp = {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  xxl: number
}
