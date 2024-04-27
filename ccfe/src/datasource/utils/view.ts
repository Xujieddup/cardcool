import type { Card, CardObj, MyDatabase, NodeTypeObj, View } from "@/types"
import { formatNodeObj, getFlowViewInfo, parseRuleConfig, parseViewConfig } from "@/utils"
import { queryCardsByCfg } from "./card"
import { NodeTypeEnum } from "@/enums"

// 分享视图时，获取视图数据
export const getViewContent = async (db: MyDatabase, view: View, types: NodeTypeObj[]) => {
  let content = ""
  // 查询列表视图的卡片数据
  if (view.type === 0) {
    const viewCfg = parseViewConfig(view.config)
    const ruleCfg = parseRuleConfig(viewCfg)
    const cards = await queryCardsByCfg(db, view.space_id, ruleCfg, types)
    content = JSON.stringify({
      cards: cards,
    })
  } else {
    // const typeIconMap = new Map(types.map((t) => [t.id, t.icon]))
    const typeMap = new Map(types.map((t) => [t.id, t]))
    content = await getFlowViewInfo(db, view.space_id, view.id, typeMap).then(
      async ([nodes, edges]) => {
        // 查询节点中的所有卡片信息
        const cardIds = nodes.filter((n) => n.data.nodeType === 1).map((n) => n.data.nodeId)
        const cards: CardObj[] = []
        const cardMap = await db.card.getCardsByIds(cardIds)
        cardMap.forEach((card) => {
          const typeInfo = types.find((t) => t.id === card.type_id)
          cards.push(formatNodeObj(card.toJSON() as Card, typeInfo))
        })
        return JSON.stringify({ nodes, edges, cards })
      }
    )
  }
  return content
}

// 删除视图
export const deleteView = async (db?: MyDatabase, viewId?: string) => {
  if (!db || !viewId) return []
  // 查询视图信息
  const views = await db.view.getChildViews(viewId)
  if (!views.length) {
    return []
  }
  const viewIds = views.map((v) => v.id)
  // 删除视图信息
  await db.view.deleteViewByIds(viewIds)
  // 轮循: 不直接删除白板中的卡片节点，而是自动重置为卡片标题
  for (let i = 0; i < views.length; i++) {
    await db.viewnode.resetDeleteNode(views[i].id, NodeTypeEnum.VIEW, views[i].name)
  }
  return viewIds
}
