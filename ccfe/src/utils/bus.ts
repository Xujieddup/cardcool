import { CondEnum } from "@/enums"
import type { CardObj, NodeTypeObj, RuleCfg, RuleConfig, SorterRule, ViewCfg } from "@/types"
import { arrToMap } from "./array"
import { defaultLVCfg, defaultSorters } from "@/config"

// 解析视图规则配置
export const parseViewConfig = (viewConfigStr: string): ViewCfg => {
  // 判断配置中是否存在，如果存在则直接返回，否则返回默认配置
  const cfg = JSON.parse(viewConfigStr) as ViewCfg
  return cfg.ruleId !== undefined && cfg.rules.length ? cfg : { ...defaultLVCfg }
}
// 解析视图规则配置
export const parseRuleConfig = (cfg: ViewCfg, ruleId?: string): RuleConfig => {
  // 判断配置中是否存在，如果存在则直接返回，否则返回默认配置
  const rid = ruleId === undefined ? cfg.ruleId : ruleId
  const config =
    cfg.rules.find((r) => r.id === rid) || (cfg.rules.length > 0 ? cfg.rules[0] : undefined)
  if (config) {
    const { id: ruleId, typeId = "", gantt, filters, groupers = [], sorters } = config
    return { ruleId, typeId, gantt, filters, groupers, sorters, refreshTime: Date.now() }
  } else {
    return {
      ruleId: "",
      typeId: "",
      gantt: undefined,
      filters: [],
      groupers: [],
      sorters: [],
      refreshTime: Date.now(),
    }
  }
}
// 解析视图规则配置
// export const parseViewRuleConfig = (viewConfigStr: string): RuleConfig => {
//   // 判断配置中是否存在，如果存在则直接返回，否则返回默认配置
//   const cfg = JSON.parse(viewConfigStr) as ViewCfg
//   const config = cfg.ruleId !== undefined ? cfg.rules.find((r) => r.id === cfg.ruleId) : undefined
//   if (config) {
//     const { id: ruleId, typeId = "", filters, groupers = [], sorters } = config
//     return { ruleId, typeId, filters, groupers, sorters, refreshTime: Date.now() }
//   } else {
//     return {
//       ruleId: "",
//       typeId: "",
//       filters: [],
//       groupers: [],
//       sorters: [],
//       refreshTime: Date.now(),
//     }
//   }
// }
// 解析视图规则配置
export const formatViewRuleConfig = (ruleConfig: RuleConfig, types: NodeTypeObj[]): RuleCfg => {
  const { typeId = "", gantt, filters, groupers, sorters } = ruleConfig
  // 如果指定了白板，则先查询白板中的卡片 id
  const boardId = filters.find((f) => f.propId === "board" && f.cond === CondEnum.EQ)?.value || ""
  // const cardIds = boardId === "" ? undefined : await db.viewnode.getCardIds(boardId)
  // 指定有效的卡片模板
  const typeInfo = typeId ? types.find((t) => t.id === typeId) : undefined
  const validTypeId = typeInfo?.id || ""
  const propMap = typeInfo ? arrToMap(typeInfo.props, "id") : undefined
  // 数据库查询条件
  const dbFilters = filters.filter((f) => !f.typeId && f.propId !== "board" && f.propId !== "type")
  // 数据集遍历筛选条件
  const propFilters = filters.filter((f) => f.typeId === validTypeId)
  // 分组排序条件
  const validGroupers = groupers.filter((g) => !g.typeId || g.typeId === validTypeId)
  // 暂不考虑 update_time: desc 的默认排序规则优化问题
  const validSorters = sorters.filter((s) => !s.typeId || s.typeId === validTypeId)
  // 设置的分组条件时，如果没有排序规则，则默认为更新时间倒序
  const sorterList = validSorters.length || !validGroupers.length ? validSorters : defaultSorters
  return {
    typeId: validTypeId,
    boardId,
    gantt,
    dbFilters,
    propFilters,
    groupers: validGroupers,
    sorters: sorterList,
    typeInfo,
    propMap,
  }
}
// 解析视图规则配置
export const getViewRuleConfig = (viewConfig: ViewCfg, ruleId: string): RuleConfig => {
  // 判断配置中是否存在，如果存在则直接返回，否则返回默认配置
  const config = viewConfig.rules.find((r) => r.id === ruleId)
  if (config) {
    const { typeId = "", filters, groupers, sorters } = config
    return { ruleId, typeId, filters, groupers, sorters, refreshTime: Date.now() }
  } else {
    return { ruleId, typeId: "", filters: [], groupers: [], sorters: [], refreshTime: Date.now() }
  }
}
// 拆分排序规则，拆分成直接查询的通用属性排序和基于数据集处理的卡片模板数据
export const splitSorterRule = (sorters: SorterRule[]): [SorterRule[], SorterRule[]] => {
  if (!sorters.length) return [[], []]
  const idx = sorters.findIndex((s) => s.typeId)
  if (idx === -1) {
    return [sorters, []]
  } else if (idx === 0) {
    return [[], sorters]
  } else {
    return [sorters.slice(0, idx), sorters.slice(idx)]
  }
}
// 列表视图和甘特视图中，删除指定卡片
export const delCard = (maps: any, cardId: string) => {
  for (const key in maps) {
    if (Array.isArray(maps[key])) {
      if (maps[key].find((c: CardObj) => c.id === cardId)) {
        maps[key] = maps[key].filter((c: CardObj) => c.id !== cardId)
      }
    } else {
      delCard(maps[key], cardId)
    }
  }
}
