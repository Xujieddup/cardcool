import { SortEnum } from "@/enums"
import type { RuleItem, ScreenProp, SorterRule, ViewCfg } from "@/types"

export const defaultRule: RuleItem = {
  id: "",
  name: "",
  typeId: "",
  filters: [],
  groupers: [],
  sorters: [],
}
export const defaultViewCfg: ViewCfg = {
  ruleId: "",
  rules: [],
}
export const defaultLVCfg: ViewCfg = {
  ruleId: "",
  rules: [{ id: "", name: "", typeId: "", filters: [], groupers: [], sorters: [] }],
}
export const defaultSorters: SorterRule[] = [
  { typeId: "", propId: "update_time", value: SortEnum.DESC },
]
// 菜单栏展开或折叠时的分栏配置
export const menuScreen: ScreenProp = { xs: 24, sm: 12, md: 8, lg: 6, xl: 4, xxl: 3 }
export const fullScreen: ScreenProp = { xs: 12, sm: 8, md: 6, lg: 4, xl: 3, xxl: 3 }
