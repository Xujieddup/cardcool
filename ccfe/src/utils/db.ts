import type {
  MyDatabase,
  Card,
  NodeTypeObj,
  CardProps,
  CardObj,
  CardProp,
  View,
  NodeData,
  CardData,
  CardDataObj,
} from "@/types"
import type { Edge, Node } from "@/reactflow/core"
import dayjs from "dayjs"
import { NodeTypeEnum, SpecialViewEnum, ViewInlineType, ViewTypeEnum } from "@/enums"
import {
  isAllMGroupNode,
  isMindRootNode,
  nodeFactory,
  viewToMindNode,
  viewsGroupNode,
} from "./node"
import { edgeFactory, genMindEdges } from "./edge"
import { getSpecialView, tmpMindDragEdge } from "@/config"

// 获取视图信息，type: 1-白板，0-列表，-1-卡片盒，-2-视图集，-3-模板管理，-4-收藏夹，-5-回收站
export const getViewInfo = async (db: MyDatabase, spaceId: string, viewId: string) => {
  const specialView = getSpecialViewInfo(spaceId, viewId)
  if (specialView) {
    return specialView
  } else {
    return await db.view.getViewById(viewId)
  }
}

// 获取视图信息
export const getSpecialViewInfo = (spaceId: string, viewId: string) => {
  const time = Date.now()
  if (viewId === SpecialViewEnum.CARDS) {
    return {
      id: viewId,
      name: "卡片盒",
      space_id: spaceId,
      pid: "",
      snum: 0,
      type: -1,
      inline_type: ViewInlineType.NOTINLINE,
      is_favor: false,
      icon: "cates",
      desc: "",
      config:
        '{"ruleId":"","rules":[{"id":"","name":"全部","typeId":"","filters":[],"groupers":[],"sorters":[]},{"id":"_unnamed","name":"未命名","typeId":"","filters":[{"typeId":"","propId":"name","cond":4,"value":""}],"groupers":[],"sorters":[]}]}',
      content: "",
      update_time: time,
      is_deleted: false,
    }
  } else if (viewId === SpecialViewEnum.VIEWS) {
    return {
      id: viewId,
      name: "视图集",
      space_id: spaceId,
      pid: "",
      snum: 0,
      type: -2,
      inline_type: ViewInlineType.NOTINLINE,
      is_favor: false,
      icon: "boards",
      desc: "",
      config: "{}",
      content: "",
      update_time: time,
      is_deleted: false,
    }
  } else if (viewId === SpecialViewEnum.SPACES) {
    return {
      id: viewId,
      name: "空间管理",
      space_id: spaceId,
      pid: "",
      snum: 0,
      type: -3,
      inline_type: ViewInlineType.NOTINLINE,
      is_favor: false,
      icon: "database",
      desc: "",
      config: "{}",
      content: "",
      update_time: time,
      is_deleted: false,
    }
  } else if (viewId === SpecialViewEnum.TYPES) {
    return {
      id: viewId,
      name: "卡片模板",
      space_id: spaceId,
      pid: "",
      snum: 0,
      type: -4,
      inline_type: ViewInlineType.NOTINLINE,
      is_favor: false,
      icon: "cards",
      desc: "",
      config: "{}",
      content: "",
      update_time: time,
      is_deleted: false,
    }
  } else if (viewId === SpecialViewEnum.TAGS) {
    return {
      id: viewId,
      name: "卡片标签",
      space_id: spaceId,
      pid: "",
      snum: 0,
      type: -5,
      inline_type: ViewInlineType.NOTINLINE,
      is_favor: false,
      icon: "tags",
      desc: "",
      config: "{}",
      content: "",
      update_time: time,
      is_deleted: false,
    }
  } else {
    return null
  }
  // } else if (viewId === "stars") {
  //   return {
  //     id: viewId,
  //     name: "收藏夹",
  //     space_id: spaceId,
  //     pid: "",
  //     type: -5,
  //     is_favor: false,
  //     icon: "",
  //     desc: "",
  //     config: "{}",
  //     content: "",
  //     update_time: time,
  //     is_deleted: false,
  //   }
  // } else if (viewId === "deletes") {
  //   return {
  //     id: viewId,
  //     name: "回收站",
  //     space_id: spaceId,
  //     pid: "",
  //     type: -6,
  //     is_favor: false,
  //     icon: "",
  //     desc: "",
  //     config: "{}",
  //     content: "",
  //     update_time: time,
  //     is_deleted: false,
  //   }
}

// 获取列表视图的卡片信息
export const getListNode = async (db: MyDatabase, card: Card) => {
  const typeObj = await db.type.getTypeObj(card.type_id)
  return formatNodeObj(card, typeObj)
}

export const formatCardProps = (props?: CardProps, cardType?: NodeTypeObj): CardProp[] => {
  if (!props || !cardType) {
    return []
  }
  return cardType.props.map(
    (prop) =>
      ({
        id: prop.id,
        name: prop.name,
        type: prop.type,
        handles: prop.handles,
        show: prop.show,
        options: prop.options,
        val: props[prop.id] || "",
      } as CardProp)
  )
}

// 组装节点信息
export const formatNodeObj = (card: Card, cardType?: NodeTypeObj) => {
  const props = card.props ? (JSON.parse(card.props) as CardProps) : undefined
  const cardProps = formatCardProps(props, cardType)
  return {
    id: card.id,
    space_id: card.space_id,
    type_id: card.type_id,
    name: card.name,
    icon: cardType?.icon || "",
    tags: card.tags,
    propsObj: props,
    props: cardProps,
    content: JSON.parse(card.content),
    create_time: card.create_time,
    update_time: card.update_time,
    create_date: card.create_time ? dayjs(card.create_time * 1000).format("YYYY-MM-DD") : "",
    update_date: card.update_time ? dayjs(card.update_time).format("YYYY-MM-DD") : "",
  } as CardObj
}
export const formatCardObj = (card: CardData, cardType?: NodeTypeObj) => {
  const cardProps = formatCardProps(card.propsObj, cardType)
  return {
    id: card.id,
    space_id: card.space_id,
    type_id: card.type_id,
    name: card.name,
    icon: cardType?.icon || "",
    tags: card.tags,
    propsObj: card.propsObj,
    props: cardProps,
    content: JSON.parse(card.content),
    create_time: card.create_time,
    update_time: card.update_time,
    create_date: card.create_time ? dayjs(card.create_time * 1000).format("YYYY-MM-DD") : "",
    update_date: card.update_time ? dayjs(card.update_time).format("YYYY-MM-DD") : "",
  } as CardDataObj
}

// 获取并组装白板视图的所有节点和关联信息
type FlowViewInfoFunc = (
  db: MyDatabase,
  spaceId: string,
  viewId: string,
  typeMap: Map<string, NodeTypeObj>
) => Promise<[Node<NodeData>[], Edge[]]>
export const getFlowViewInfo: FlowViewInfoFunc = async (db, spaceId, viewId, typeMap) => {
  if (viewId === "views") return getFlowViews(db, spaceId)
  // 查询视图信息，非 Graph 类型视图不进行处理
  const view = await db.view.getViewById(viewId)
  if (!view || view.type !== ViewTypeEnum.BOARD) return [[], []]
  // 查询视图所有节点
  const vns = await db.viewnode.getAll(viewId)
  if (vns.length === 0) return [[], []]
  // 查询关联节点信息
  const cardIds = Array.from(
    new Set(vns.filter((v) => v.node_type === NodeTypeEnum.CARD).map((v) => v.node_id))
  )
  const cardMap = await db.card.getCardsByIds(cardIds)
  const viewIds = Array.from(
    new Set(vns.filter((v) => v.node_type === NodeTypeEnum.VIEW).map((v) => v.node_id))
  )
  const viewMap = await db.view.getViewsByIds(viewIds)
  // 遍历处理 map
  const allNodes: Node<NodeData>[] = []
  // 找到所有的思维导图分组，组装成 map
  const mindMap = new Map<string, Node<NodeData>[]>(
    vns.filter((v) => isAllMGroupNode(v.vn_type_id)).map((v) => [v.id, []])
  )
  // 格式化节点信息
  vns.forEach((vn) => {
    let cardInfo = undefined
    let viewInfo = undefined
    const { node_type: nodeType, node_id: nodeId, group_id: groupId } = vn
    if (nodeType === NodeTypeEnum.CARD) {
      const card = cardMap.get(nodeId)
      if (card) {
        cardInfo = formatNodeObj(card.toJSON() as Card, typeMap.get(card.type_id))
      }
    } else if (nodeType === NodeTypeEnum.VIEW) {
      const view = viewMap.get(nodeId)
      if (view) {
        viewInfo = view.toJSON() as View
      }
    }
    const aMindNode = !!vn.group_id && mindMap.has(vn.group_id)
    const node = nodeFactory(vn, cardInfo, viewInfo, aMindNode)
    if (aMindNode) {
      const info = mindMap.get(groupId)
      if (info) {
        isMindRootNode(node.data.pid) ? info.unshift(node) : info.push(node)
      }
    } else {
      allNodes.push(node)
    }
  })
  // 查询视图所有关联
  const ves = await db.viewedge.getAll(viewId)
  // 格式化关联信息
  const allEdges = ves.map((ve) => edgeFactory(ve))
  mindMap.forEach((mindNodes) => {
    allNodes.push(...mindNodes)
    allEdges.push(...genMindEdges(mindNodes.slice(1)))
  })
  // 如果白板中存在思维导图，则添加一个临时的导图拖拽节点，以便拖拽导图节点更新位置
  if (mindMap.size) {
    // allNodes.push(tmpMindDragNode)
    allEdges.push(tmpMindDragEdge)
  }
  return [allNodes, allEdges]
}
// 获取并组装视图列表
type FlowViewFunc = (db: MyDatabase, spaceId: string) => Promise<[Node<NodeData>[], Edge[]]>
const getFlowViews: FlowViewFunc = async (db: MyDatabase, spaceId: string) => {
  const baseView = getSpecialView(spaceId, SpecialViewEnum.VIEWS)
  if (!baseView) return [[], []]
  // 查询所有视图信息
  const views = await db.view.getAll(spaceId)
  const viewNodes = views.map((v) => viewToMindNode(v))
  // 生成边数组
  const edges = genMindEdges(viewNodes)
  // 添加思维导图 group 节点和 根节点
  viewNodes.push(viewsGroupNode, viewToMindNode(baseView))
  return [viewNodes, edges]
}
