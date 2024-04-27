import { CondEnum, NodeTypeEnum } from "@/enums"
import type {
  CardObj,
  GrouperRule,
  MyDatabase,
  NodeTypeObj,
  NodeTypeProp,
  RuleCfg,
  RuleConfig,
  SelectOpt,
  SorterRule,
} from "@/types"
import {
  arrToMap,
  formatCardObj,
  formatLinkData,
  formatNodeObj,
  formatViewRuleConfig,
  groupBy,
  groupByMulti,
} from "@/utils"

type TmpSorterRule = SorterRule & {
  type?: string
  opts?: SelectOpt[]
}

export const queryCardsByCfg = async (
  db: MyDatabase,
  spaceId: string,
  ruleConfig: RuleConfig,
  types: NodeTypeObj[]
) => {
  // console.log("queryCardsByCfg", ruleConfig)
  // 查询所有卡片
  const { filters } = ruleConfig
  // 如果指定了白板，则先查询白板中的卡片 id
  const boardId =
    filters.find((filter) => filter.propId === "board" && filter.cond === CondEnum.EQ)?.value || ""
  const cardIds = boardId === "" ? undefined : await db.viewnode.getCardIds(boardId)
  // 指定卡片模板
  const typeId = filters.find((f) => f.propId === "type" && f.cond === CondEnum.EQ)?.value || ""
  const typeInfo = typeId ? types.find((t) => t.id === typeId) : undefined
  const validTypeId = typeInfo?.id || ""
  const propMap = typeInfo ? arrToMap(typeInfo.props, "id") : undefined
  const dbFilters = filters.filter((f) => !f.typeId && f.propId !== "board")
  const propFilters = filters.filter((f) => f.typeId === validTypeId)
  // console.log("filterRules", ruleConfig, filters, dbFilters, propFilters)
  // const validSorters = sorters.filter((s) => !s.typeId || s.typeId === validTypeId)
  // const [dbSorters, propSorters] = splitSorterRule(validSorters)
  // console.log("sorterRules", dbSorters, propSorters)
  const cards = await db.card.getCards(spaceId, "", dbFilters, propFilters, propMap, cardIds)
  return cards.map((card) => {
    const typeInfo = types.find((t) => t.id === card.type_id)
    return formatNodeObj(card, typeInfo)
  })
}

export const queryCards = async (
  db: MyDatabase,
  spaceId: string,
  ruleConfig: RuleConfig,
  types: NodeTypeObj[]
): Promise<[any, GrouperRule[]]> => {
  // console.log("queryCardsByCfg", ruleConfig)
  const rule = formatViewRuleConfig(ruleConfig, types)
  const { typeId, boardId, dbFilters, propFilters, groupers, sorters, propMap } = rule
  // const { typeId = "", filters, groupers, sorters } = ruleConfig
  // 如果指定了白板，则先查询白板中的卡片 id
  // const boardId = filters.find((f) => f.propId === "board" && f.cond === CondEnum.EQ)?.value || ""
  const cardIds = boardId === "" ? undefined : await db.viewnode.getCardIds(boardId)
  // 指定有效的卡片模板
  // const typeInfo = typeId ? types.find((t) => t.id === typeId) : undefined
  // const validTypeId = typeInfo?.id || ""
  // const propMap = typeInfo ? arrToMap(typeInfo.props, "id") : undefined
  // 数据库查询条件
  // const dbFilters = filters.filter((f) => !f.typeId && f.propId !== "board" && f.propId !== "type")
  // 数据集遍历筛选条件
  // const propFilters = filters.filter((f) => f.typeId === validTypeId)
  // 分组排序条件
  // const grouperSorters = groupers.filter((g) => !g.typeId || g.typeId === validTypeId)
  // 暂不考虑 update_time: desc 的默认排序规则优化问题
  // const validSorters = sorters.filter((s) => !s.typeId || s.typeId === validTypeId)
  // 查询并过滤卡片数据
  const cardArr = await db.card.getCards(spaceId, typeId, dbFilters, propFilters, propMap, cardIds)
  if (!cardArr.length) {
    return [{ all: [] }, []]
  }
  const typeMap = arrToMap(types, "id")
  const cards = cardArr.map((card) => formatCardObj(card, typeMap.get(card.type_id)))
  // 优先进行分组排序
  if (groupers.length) {
    const groupList = sortCards(cards, groupers, propMap)
    // 然后进行分组
    const funcs = groupers.map(
      (grouper) => (c: any) => grouper.typeId ? c.propsObj[grouper.propId] : c[grouper.propId]
    )
    const groups = groupByMulti(groupList, ...funcs)
    // 再在分组中进行排序
    sortGroupers(groups, sorters, propMap)
    return [groups, groupers]
  } else {
    const list = sortCards(cards, sorters, propMap)
    return [{ all: list }, []]
  }
}

export const queryKanbanCards = async (
  db: MyDatabase,
  spaceId: string,
  rule: RuleCfg
  // types: NodeTypeObj[],
  // grouper?: GrouperRule,
  // typeInfo?: NodeTypeObj,
  // propMap?: Map<string, NodeTypeProp>
) => {
  const { typeId, boardId, dbFilters, propFilters, groupers, sorters, typeInfo, propMap } = rule
  const grouper = groupers[0]
  // 指定有效的卡片模板
  // const typeInfo = typeId ? types.find((t) => t.id === typeId) : undefined
  // const validTypeId = typeInfo?.id || ""
  // 指定单选模板的分组属性
  // const grouper =
  //   validTypeId && groupers.length && groupers[0].typeId === validTypeId ? groupers[0] : undefined
  // 不满足看板视图条件
  // if (!typeInfo || !validTypeId || !grouper) {
  //   return null
  // }
  // const propMap = arrToMap(typeInfo.props, "id")
  // 如果指定了白板，则先查询白板中的卡片 id
  // const boardId = filters.find((f) => f.propId === "board" && f.cond === CondEnum.EQ)?.value || ""
  const cardIds = boardId === "" ? undefined : await db.viewnode.getCardIds(boardId)
  // // 数据库查询条件
  // const dbFilters = filters.filter((f) => !f.typeId && f.propId !== "board" && f.propId !== "type")
  // // 数据集遍历筛选条件
  // const propFilters = filters.filter((f) => f.typeId === validTypeId)
  // // 暂不考虑 update_time: desc 的默认排序规则优化问题
  // const validSorters = sorters.filter((s) => !s.typeId || s.typeId === validTypeId)
  // 查询并过滤卡片数据
  const cardArr = await db.card.getCards(spaceId, typeId, dbFilters, propFilters, propMap, cardIds)
  if (!cardArr.length) {
    return {}
  }
  // const typeMap = arrToMap(types, "id")
  const cards = cardArr.map((card) => formatCardObj(card, typeInfo))
  // 优先进行分组排序
  const groupList = sortCards(cards, [grouper], propMap)
  // 然后进行分组
  const groups = groupBy(groupList, (c: any) => c.propsObj[grouper.propId])
  // 再在分组中进行排序
  sortGroupers(groups, sorters, propMap)
  return groups
}

const sortGroupers = (groups: any, sorters: SorterRule[], propMap?: Map<string, NodeTypeProp>) => {
  Object.keys(groups).forEach((key: string) => {
    Array.isArray(groups[key])
      ? sortCards(groups[key], sorters, propMap)
      : sortGroupers(groups[key], sorters, propMap)
  })
}

// 重新解析规则，避免因删除模板导致规则异常
export const sortCards = (
  cards: CardObj[],
  sorters: SorterRule[],
  propMap?: Map<string, NodeTypeProp>
) => {
  // 遍历排序
  if (cards.length && sorters.length) {
    // 先处理一下属性排序规则
    const propSorterList: TmpSorterRule[] = propMap
      ? sorters.map((s) => ({
          ...s,
          type: propMap.get(s.propId)?.type,
          opts: propMap.get(s.propId)?.options,
        }))
      : sorters
    return cards.sort((a: any, b: any) => {
      let res = 0
      for (let i = 0; i < propSorterList.length; i++) {
        const s = propSorterList[i]
        const aVal = (s.typeId ? a.propsObj[s.propId] : a[s.propId]) || ""
        const bVal = (s.typeId ? b.propsObj[s.propId] : b[s.propId]) || ""
        let av: any = ""
        let bv: any = ""
        if (s.type === "link") {
          av = formatLinkData(aVal).link
          bv = formatLinkData(bVal).link
        } else if (s.type === "select") {
          // 单选字段排序时，直接查找选项的索引
          av = s.opts ? s.opts.findIndex((o) => o.id === aVal) : -1
          bv = s.opts ? s.opts.findIndex((o) => o.id === bVal) : -1
        } else if (s.type === "mselect") {
          // 多选字段排序时，先去重，再查找最小索引
          if (s.opts) {
            const aArr: string[] = Array.isArray(aVal) && aVal.length ? aVal : []
            const bArr: string[] = Array.isArray(bVal) && bVal.length ? aVal : []
            const ar = aArr.length ? aArr.filter((i) => !bArr.includes(i)) : []
            const br = bArr.length ? bArr.filter((i) => !aArr.includes(i)) : []
            if (s.value === "asc") {
              av = ar.length ? s.opts.findIndex((o) => ar.includes(o.id)) : -1
              bv = br.length ? s.opts.findIndex((o) => br.includes(o.id)) : -1
              if (av !== bv) {
                res = av < bv ? -1 : 1
                break
              }
            } else {
              av = ar.length ? s.opts.findLastIndex((o) => ar.includes(o.id)) : -1
              bv = br.length ? s.opts.findLastIndex((o) => br.includes(o.id)) : -1
              if (av !== bv) {
                res = av < bv ? 1 : -1
                break
              }
            }
          }
        } else {
          // 其他类型都是字符串，直接比较即可
          av = aVal
          bv = bVal
        }
        // 没有对应值时，默认为空，视为相等
        if (av !== bv) {
          // 如果期望值为空的数据排到最后，则需: if (aVal === "") res = 1，但公共属性的排序不好如此处理，所以不将空值强制放到最后
          const tmp = av < bv ? -1 : 1
          res = s.value === "asc" ? tmp : -tmp
          break
        }
      }
      return res
    })
  } else {
    return cards
  }
}

// 删除卡片
export const deleteCard = async (db: MyDatabase, cardId: string) => {
  // 查询卡片信息
  const card = await db.card.getCard(cardId)
  if (!card) {
    throw new Error("查询卡片数据异常！")
  }
  // 删除卡片信息
  await db.card.deleteCard(cardId)
  // 不直接删除白板中的卡片节点，而是自动重置为卡片标题
  await db.viewnode.resetDeleteNode(cardId, NodeTypeEnum.CARD, card.name)
  // 删除卡片关联的 edge
  // await db.viewedge.deleteEdgeByNodeIds(vnIds)
}
