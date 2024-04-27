import { NodeTypeEnum, ShapeTypeEnum, SpecialViewEnum, VNTypeEnum } from "@/enums"
import type {
  CardObj,
  EdgeData,
  NodeData,
  TempRect,
  VNContent,
  VNParam,
  View,
  ViewNode,
} from "@/types"
import type { Node, Edge, XYPosition, Rect } from "@/reactflow"
import { getRectOfNodes } from "@/reactflow"
import { initNode } from "@/config"
import {
  GROUP_PADDING,
  MIND_ROOT_PID,
  NODE_STYLE_FOLD,
  NODE_STYLE_FULL,
  NODE_WIDTH,
  THEME_COLOR,
  VIEWS_GROUP,
} from "@/constant"
import { nodeToRect, resetLayout, resetMindGroup } from "."

export const isGroupNodeType = (nodeType: number) => nodeType === NodeTypeEnum.GROUP
// 原 mind 节点(只有text/card/view)，需要根据 node_type 转换成新的对应节点
const getVnTypeByNodeType = (nodeType: NodeTypeEnum) => {
  switch (nodeType) {
    case NodeTypeEnum.CARD:
      return VNTypeEnum.CARD
    case NodeTypeEnum.VIEW:
      return VNTypeEnum.VIEW
    case NodeTypeEnum.TEXT:
    default:
      return VNTypeEnum.TEXT
  }
}

// 是否是老导图节点类型
const isOldMindNode = (vnType: VNTypeEnum) =>
  vnType === VNTypeEnum.MINDROOT ||
  vnType === VNTypeEnum.MINDSUB ||
  vnType === VNTypeEnum.MINDNODE ||
  vnType === VNTypeEnum.MIND
// 是否是老图形节点类型
const isOldShapeNode = (vnType: VNTypeEnum) =>
  vnType === VNTypeEnum.SQUARE || vnType === VNTypeEnum.CIRCLE || vnType === VNTypeEnum.TRIANGLE
export const isOldMindGroupNode = (vnType?: string) => vnType === VNTypeEnum.MINDGROUP
export const isAllMGroupNode = (vnType?: string) =>
  vnType === VNTypeEnum.MGROUP || vnType === VNTypeEnum.MINDGROUP
export const isShapeNode = (vnType?: string) => vnType === VNTypeEnum.SHAPE
export const isIGroupNode = (vnType?: string) => vnType === VNTypeEnum.IGROUP
export const isMGroupNode = (vnType?: string) => vnType === VNTypeEnum.MGROUP
export const isShapeOrGroupNode = (vnType?: string) =>
  vnType === VNTypeEnum.SHAPE || vnType === VNTypeEnum.IGROUP
export const isGroupCate = (vnType?: string) =>
  vnType === VNTypeEnum.IGROUP || vnType === VNTypeEnum.MGROUP
export const isBaseCate = (vnType?: string) =>
  vnType === VNTypeEnum.TEXT || vnType === VNTypeEnum.CARD || vnType === VNTypeEnum.VIEW
// 按 Space 键可以进入编辑状态的节点类型
const isEditNode = (vnType?: string) => vnType === VNTypeEnum.SHAPE || vnType === VNTypeEnum.TEXT
export const isMindRootNode = (pid?: string) => pid === MIND_ROOT_PID

// 获取节点初始化信息
export const getDefaultNode = (type: string, position?: XYPosition): VNContent => {
  const node = initNode[type]
  if (node && position && type !== VNTypeEnum.MIND) {
    node.position = position
  }
  return { ...node }
}

// 节点格式化工厂: 将数据库中的数据，格式化为 ReactFlow 需要的数据结构
// 原节点类型: mindGroup/mindRoot/mindSub/mindNode/mind/card/sequare/circle/triange
// 新节点类型: mgroup/igroup/card/view/text/shape
export const nodeFactory = (
  vn: ViewNode,
  cardInfo?: CardObj,
  viewInfo?: View,
  aMindNode?: boolean
) => {
  const content = JSON.parse(vn.content) as VNContent
  let { vn_type_id: vnType, node_type: nodeType, pid } = vn
  let {
    // eslint-disable-next-line prefer-const
    position = { x: 0, y: 0 },
    width,
    autoWidth,
    // eslint-disable-next-line prefer-const
    height,
    // eslint-disable-next-line prefer-const
    layout,
    styleId,
    shapeType,
    // eslint-disable-next-line prefer-const
    bgColor,
    // eslint-disable-next-line prefer-const
    snum = 0,
    ext,
  } = content
  // 原 vn_type_id 为 mindRoot/mindSub/mindNode/mind，转换为 node_type 对应的 vn_type_id
  if (isOldMindNode(vnType)) vnType = getVnTypeByNodeType(nodeType)
  else if (isOldShapeNode(vnType)) {
    shapeType = vnType as unknown as ShapeTypeEnum
    vnType = VNTypeEnum.SHAPE
  } else if (isOldMindGroupNode(vnType)) {
    // 修正之前的思维导图分组节点(vn_type_id 为 mindGroup, node_type 为 0)
    vnType = VNTypeEnum.MGROUP
    nodeType = NodeTypeEnum.GROUP
    autoWidth = true
  }
  const aShapeNode = isShapeNode(vnType)
  const aGroupCate = isGroupCate(vnType)
  // 将之前节点的 name 字段转换到 content.ext，另外删除卡片/视图也会更新为 name
  if (nodeType === NodeTypeEnum.TEXT && vn.name) {
    ext = convertTextExt(vn.name)
  }
  // 最之前的导图节点没有 width，之前的导图节点的宽度值固定为文本宽度(autoWidth === undefined)，需要重置为默认宽度
  if (aMindNode) {
    if (!width || autoWidth === undefined) width = NODE_WIDTH
    // 之前的导图根节点 pid 为 ""，需要赋默认值，pid 字段用于判断是否是导图子节点
    if (!pid) pid = MIND_ROOT_PID
  }
  // 之前的节点没有 autoWidth 属性，所有非图形节点都赋值默认值
  autoWidth = aShapeNode ? false : autoWidth === undefined ? aMindNode : autoWidth
  // 非文本节点(card/view)才可切换样式，赋值默认值
  if (styleId === undefined && (nodeType === NodeTypeEnum.CARD || nodeType === NodeTypeEnum.VIEW)) {
    styleId = aMindNode || aShapeNode ? NODE_STYLE_FOLD : NODE_STYLE_FULL
  }
  const style =
    aShapeNode || aGroupCate ? { width, height } : autoWidth ? { maxWidth: width } : { width }
  return {
    id: vn.id,
    type: vnType,
    position,
    parentNode: vn.group_id || undefined,
    style,
    data: {
      nodeId: vn.node_id,
      nodeType,
      pid,
      width,
      autoWidth,
      height,
      layout,
      styleId,
      shapeType,
      bgColor,
      snum,
      ext,
      // 附带的卡片和视图信息
      cardInfo,
      viewInfo,
    },
  } as Node<NodeData>
}
// 转换老文本节点信息
export const convertTextExt = (text: string) => {
  return JSON.stringify({
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  })
}
// 视图集导图: 将视图列表格式化为导图节点
export const viewToMindNode = (view: View): Node<NodeData> => {
  const { id, pid, snum } = view
  const isRootMind = id === SpecialViewEnum.VIEWS
  return {
    id,
    type: VNTypeEnum.VIEW,
    position: { x: 0, y: 0 },
    draggable: false,
    parentNode: VIEWS_GROUP,
    deletable: false,
    data: {
      nodeId: id,
      nodeType: NodeTypeEnum.VIEW,
      pid: pid ? pid : isRootMind ? "" : SpecialViewEnum.VIEWS,
      width: NODE_WIDTH,
      autoWidth: true,
      height: undefined,
      layout: undefined,
      styleId: NODE_STYLE_FOLD,
      bgColor: isRootMind ? THEME_COLOR : undefined,
      snum,
      ext: undefined,
      cardInfo: undefined,
      viewInfo: view,
      forbidEdit: true,
    },
  } as Node<NodeData>
}
// 视图集思维导图的 group 节点
export const viewsGroupNode: Node<NodeData> = {
  id: VIEWS_GROUP,
  type: VNTypeEnum.MGROUP,
  position: { x: 0, y: 0 },
  parentNode: undefined,
  draggable: false,
  deletable: false,
  selectable: false,
  data: {
    nodeId: "",
    nodeType: NodeTypeEnum.GROUP,
    width: undefined,
    autoWidth: true,
    height: undefined,
    layout: undefined,
    bgColor: undefined,
    forbidEdit: true,
  },
}

// 基于 ReactFlow 节点信息提取数据库字段
export const parseNodeContent = (node: Node<NodeData>): VNContent => {
  const { position, data } = node
  const { pid, width, autoWidth, height, layout, styleId, shapeType, bgColor, snum, ext } = data
  return {
    position: pid ? undefined : position,
    width,
    autoWidth,
    height,
    layout,
    styleId,
    shapeType,
    bgColor,
    snum,
    ext,
  }
}
// 对比节点位置是否一致，如果不一致，则需要更新
export const comparePosition = (vnc: VNContent, node: Node<NodeData>) => {
  if (!vnc.position || (vnc.position.x === node.position.x && vnc.position.y === node.position.y)) {
    return
  } else {
    return parseNodeContent(node)
  }
}
// 查找可直接编辑的节点
export const findEditNode = (nodes: Node<NodeData>[]) => {
  const selectNodes = nodes.filter((n) => n.selected)
  // 只有一个思维导图节点才会生效
  if (selectNodes.length !== 1 || !isEditNode(selectNodes[0].type)) {
    return null
  }
  return selectNodes[0]
}

// 根据节点类型获取调整大小的操作类型: 0-禁止，1-四边，2-左右两边
export const getCtrlType = (vnType: string) => {
  switch (vnType) {
    case VNTypeEnum.SHAPE:
    case VNTypeEnum.IGROUP:
      return 1
    case VNTypeEnum.CARD:
    case VNTypeEnum.VIEW:
    case VNTypeEnum.TEXT:
      return 2
    case VNTypeEnum.MGROUP:
      return 0
    default:
      return 0
  }
}

export const resetMindNodes = (nodeArr: Node<NodeData>[], groupId: string) => {
  // 获取该思维导图所有结点
  const mindNodes: Node[] = []
  const newNodes: Node[] = []
  let group: Node | undefined
  nodeArr.forEach((n) => {
    if (n.parentNode === groupId) {
      isMindRootNode(n.data.pid) ? mindNodes.unshift(n) : mindNodes.push(n)
    } else if (n.id === groupId) {
      group = n
    } else {
      newNodes.push(n)
    }
  })
  const sortedNodes = mindNodes.sort((a, b) => a.data.snum - b.data.snum)
  const [nodes, width, height] = resetMindGroup(sortedNodes)
  if (group) {
    newNodes.push({ ...group, width, height, style: { width, height } })
  }
  newNodes.push(...nodes)
  return newNodes
}

// 获取所有需要删除的节点和关联 id
export const getRemoveData = (
  nodes: Node<NodeData>[],
  edges: Edge<EdgeData>[],
  rmNodeIds: string[],
  removeEdgeIds: Set<string>,
  removeDBEdgeIds: Set<string>
) => {
  const nodeMap = new Map<string, Node<NodeData>>(nodes.map((n) => [n.id, n]))
  // 需要进行删除判断的分组节点
  const checkGroupIds = new Set<string>()
  // 所有需要删除的节点 id
  const removeNodeIds = new Set<string>()
  // 需要刷新的的分组 id
  const resetGroupIds = new Set<string>()
  // 初始遍历筛选需要进行删除判断的分组节点
  rmNodeIds.forEach((nodeId) => {
    const node = nodeMap.get(nodeId)
    if (node) {
      nodeMap.delete(node.id)
      removeNodeIds.add(nodeId)
      if (isGroupCate(node.type)) {
        checkGroupIds.add(nodeId)
      }
      if (node.parentNode) {
        if (nodeMap.get(node.parentNode)) {
          resetGroupIds.add(node.parentNode)
        }
        // 思维导图，需要查询所有子节点
        if (node.data.pid) {
          // 查找其子节点
          const childNodeIds: string[] = queryMindChildNodeIds(edges, node)
          childNodeIds.forEach((nId) => {
            const n = nodeMap.get(nId)
            if (n) {
              nodeMap.delete(node.id)
              removeNodeIds.add(nId)
              if (isGroupCate(n.type)) {
                checkGroupIds.add(nId)
              }
            }
          })
          // 删除导图根节点，等价于删除整个导图分组
          if (isMindRootNode(node.data.pid)) {
            removeNodeIds.add(node.parentNode)
            resetGroupIds.delete(node.parentNode)
          }
        }
      }
    }
  })
  if (checkGroupIds.size) {
    calcRemoveNodeId(nodeMap, checkGroupIds, removeNodeIds)
  }
  if (removeNodeIds.size > 0) {
    edges.forEach((e) => {
      if (removeNodeIds.has(e.source) || removeNodeIds.has(e.target)) {
        removeEdgeIds.add(e.id)
        if (!e.data?.groupId) {
          removeDBEdgeIds.add(e.id)
        }
      }
    })
  }
  return [removeNodeIds, resetGroupIds]
}

// 递归删除分组中的所有节点
export const calcRemoveNodeId = (
  nodeMap: Map<string, Node<NodeData>>,
  groupIds: Set<string>,
  removeNodeIds: Set<string>
) => {
  // 需要进行删除判断的分组节点
  const checkGroupIds = new Set<string>()
  // 查询分组所有子节点
  nodeMap.forEach((node) => {
    if (node.parentNode && groupIds.has(node.parentNode)) {
      nodeMap.delete(node.id)
      removeNodeIds.add(node.id)
      if (isGroupCate(node.type)) {
        checkGroupIds.add(node.id)
      }
    }
  })
  if (checkGroupIds.size) {
    calcRemoveNodeId(nodeMap, checkGroupIds, removeNodeIds)
  }
}

// 查找导图中某个节点的所有子节点: 先组装导图的关联关系，再轮循查找子元素
const queryMindChildNodeIds = (edges: Edge<EdgeData>[], node: Node<NodeData>) => {
  const edgeMap = new Map<string, string[]>()
  edges
    .filter((e) => e.data?.groupId && e.data.groupId === node.parentNode)
    .forEach((e) => {
      if (edgeMap.has(e.source)) {
        edgeMap.get(e.source)?.push(e.target)
      } else {
        edgeMap.set(e.source, [e.target])
      }
    })
  const childNodeIds: string[] = []
  getMindChildNodeIds(edgeMap, node.id, childNodeIds)
  return childNodeIds
}

const getMindChildNodeIds = (
  edgeMap: Map<string, string[]>,
  nodeId: string,
  childIds: string[]
) => {
  const targets = edgeMap.get(nodeId) || []
  if (targets.length) {
    childIds.push(...targets)
    targets.forEach((t) => getMindChildNodeIds(edgeMap, t, childIds))
  }
}

// 删除节点时的弹窗判断
export const getDeleteText = (allNodes: Node<NodeData>[], nodes: Node<NodeData>[]) => {
  if (!nodes.length) {
    return ""
  }
  const hasMulti = nodes.length > 1
  let hasMind = false
  let hasGroup = false
  nodes.forEach((n) => {
    if (!hasMind && n.parentNode && n.data.pid) {
      hasMind = allNodes.some((an) => an.data.pid === n.id)
    }
    if (!hasGroup && isIGroupNode(n.type)) {
      hasGroup = true
    }
  })
  const textArr: string[] = []
  if (hasMulti) {
    textArr.push("选中的所有节点")
  }
  if (hasMind) {
    textArr.push("导图节点及其子节点")
  }
  if (hasGroup) {
    textArr.push("分组及其子节点")
  }
  if (textArr.length) {
    return "是否确认删除" + textArr.join("、") + "!?"
  }
  return ""
}

// 计算分组节点的宽高
export const calcGroupRect = (nodes: Node<NodeData>[]) => {
  const { width, height, x, y } = getRectOfNodes(nodes)
  return {
    x: x - GROUP_PADDING,
    y: y - GROUP_PADDING,
    width: Math.round(width) + GROUP_PADDING * 2,
    height: Math.round(height) + GROUP_PADDING * 2,
  }
}
export const emptyGroupRect = (group: Node<NodeData>) => {
  return {
    x: group.positionAbsolute?.x || 0,
    y: group.positionAbsolute?.y || 0,
    width: GROUP_PADDING * 2,
    height: GROUP_PADDING * 2,
  }
}
// 计算分组节点的宽高
export const calcGroupRectByRect = (rect: Rect) => {
  const { width, height, x, y } = rect
  return {
    x: x - GROUP_PADDING,
    y: y - GROUP_PADDING,
    width: Math.round(width) + GROUP_PADDING * 2,
    height: Math.round(height) + GROUP_PADDING * 2,
  }
}

// // 计算需要重置宽高的节点
// export const calcResizeGroups = (
//   nodes: Node<NodeData>[],
//   groupId: string,
//   map: Map<string, Rect>
// ) => {
//   // 找到所有子节点，计算分组宽高
//   const group = nodes.find((n) => n.id === groupId)
//   const groupNodes = nodes.filter((n) => n.parentNode === groupId)
//   if (group && group.positionAbsolute) {
//     const groupRect: Rect = groupNodes.length
//       ? calcGroupRect(groupNodes)
//       : { ...group.positionAbsolute, width: GROUP_PADDING * 2, height: GROUP_PADDING * 2 }
//     // 分组节点的宽高位置没有变更，直接终止
//     if (checkNodeRect(group, groupRect)) {
//       return
//     } else {
//       // 分组节点的宽高位置发生变更，则保存分组新的比例
//       map.set(groupId, groupRect)
//       // 如果当前分组节点存在父级分组，则递归更新
//       if (group.parentNode) {
//         const newNodes = nodes.map((n) =>
//           n.id === groupId
//             ? {
//                 ...n,
//                 positionAbsolute: { x: groupRect.x, y: groupRect.y },
//                 width: groupRect.width,
//                 height: groupRect.height,
//               }
//             : n
//         )
//         calcResizeGroups(newNodes, group.parentNode, map)
//       }
//     }
//   }
// }

// 判断分组节点是否完全包含子节点(padding)
export const inclueNodeRect = (group: Node<NodeData>, node: Node<NodeData>) => {
  const grect = nodeToRect(group)
  const nrect = nodeToRect(node)
  return (
    grect.x + GROUP_PADDING <= nrect.x &&
    grect.y + GROUP_PADDING <= nrect.y &&
    grect.x + grect.width - GROUP_PADDING >= nrect.x + nrect.width &&
    grect.y + grect.height - GROUP_PADDING >= nrect.y + nrect.height
  )
}
// 判断分组节点是否完全包含子节点(padding)
export const checkInGroup = (group: Node<NodeData>, nrect: Rect) => {
  const grect = nodeToRect(group)
  return (
    grect.x + GROUP_PADDING <= nrect.x &&
    grect.y + GROUP_PADDING <= nrect.y &&
    grect.x + grect.width - GROUP_PADDING >= nrect.x + nrect.width &&
    grect.y + grect.height - GROUP_PADDING >= nrect.y + nrect.height
  )
}

// 基于节点和分组的 positionAbsolute，修正节点的 position 和 positionAbsolute
// 如果分组 autoWidth，且节点处于分组的左侧或上侧 padding 区，则需修正位置
export const resetNodePos = (
  groupPos: XYPosition,
  nodePos: XYPosition
): [XYPosition, XYPosition] => {
  const { x: offsetX, y: offsetY } = getPositionOffset(groupPos, nodePos)
  const posAbs = { x: nodePos.x + offsetX, y: nodePos.y + offsetY }
  const posRelate = { x: posAbs.x - groupPos.x, y: posAbs.y - groupPos.y }
  return [posRelate, posAbs]
}

// 获取位置偏移: 分组 autoWidth，且节点处于分组的左侧或上侧 padding 区，则需位置偏移
export const getPositionOffset = (groupPos: XYPosition, pos: XYPosition): XYPosition => {
  const offset = { x: 0, y: 0 }
  if (pos.x < groupPos.x + GROUP_PADDING) offset.x = groupPos.x + GROUP_PADDING - pos.x
  if (pos.y < groupPos.y + GROUP_PADDING) offset.y = groupPos.y + GROUP_PADDING - pos.y
  return offset
}

/**
 * 重置所有节点
 * @param nodes
 * @param gids 为空时表示重置所有分组，不为空时表示仅重置指定 groupId 及其父级分组
 * @returns nodeMap 重置节点过程中，坐标需要变更的节点
 */
type ResetNodesRes = [Node<NodeData>[], Set<string>] | undefined
export const resetNodes = (
  nodes: Node<NodeData>[],
  gids: Set<string>,
  nodeMap: Map<string, VNParam>
): ResetNodesRes => {
  const resizedGroupIds = new Set<string>()
  // 先将数组转换成 group map
  const map = new Map<string, { group?: Node<NodeData>; nodes: Node<NodeData>[] }>()
  map.set("", { group: undefined, nodes: [] })
  const needSetGidMap = gids.size === 0
  // 将分组节点按嵌套进行排序，最顶层到最底层
  const groups: { groupId: string; layer: number }[] = []
  // 组装所有分组
  nodes.forEach((n) => {
    if (isGroupCate(n.type)) {
      map.set(n.id, { group: n, nodes: [] })
      groups.push({ groupId: n.id, layer: n.layer || 1 })
      if (needSetGidMap) gids.add(n.id)
    }
  })
  // 没有需要重置的分组，则直接返回
  if (!gids.size) return
  // 按 cnt 由大到小排序(最顶层到最底层)
  const sortGroups = groups.sort((a, b) => b.layer - a.layer)
  // 组装所有子节点
  nodes.forEach((n) => {
    const parent = map.get(n.parentNode || "")
    if (parent) parent.nodes.push(n)
  })
  let changed = false
  // 从最顶层到最底层(不包含白板: group == undefined)，轮循计算所有分组的真实宽高
  for (let i = 0; i < sortGroups.length; i++) {
    if (!gids.size) break
    const groupId = sortGroups[i].groupId
    const item = map.get(groupId)
    const group = item?.group
    if (group && group.positionAbsolute && group.width && group.height && gids.has(groupId)) {
      gids.delete(groupId)
      // 思维导图: 重置导图节点位置
      if (isMGroupNode(group.type)) {
        // 思维导图所有节点排序(根节点为第一个)
        const mindNodes: Node[] = []
        item.nodes.forEach((n) =>
          isMindRootNode(n.data.pid) ? mindNodes.unshift(n) : mindNodes.push(n)
        )
        const sortedNodes = mindNodes.sort((a, b) => a.data.snum - b.data.snum)
        // 思维导图布局
        const [layoutNodes, width, height] = resetMindGroup(sortedNodes)
        item.nodes = layoutNodes
        changed = true
        if (group.width !== width || group.height !== height) {
          resizedGroupIds.add(group.id)
          // 计算导图分组尺寸
          const parent = map.get(group.parentNode || "")
          if (parent) {
            parent.nodes = parent.nodes.map((n) =>
              n.id === group.id ? { ...n, width, height, style: { width, height } } : n
            )
            if (parent.group) gids.add(parent.group.id)
          }
        }
      }
      // 一般分组(type: group)
      else {
        const autoWidth = group.data.autoWidth || false
        // 自动布局分组
        if (group.data.layout) {
          // 思维导图布局
          const [w, h, layoutNodes] = resetLayout(item.nodes, group.data.layout)
          item.nodes = layoutNodes
          changed = true
          // 固定宽高的分组，需要对比固定宽高和计算宽高
          const width = !autoWidth && group.width > w ? group.width : w
          const height = !autoWidth && group.height > h ? group.height : h
          if (group.width !== width || group.height !== height) {
            resizedGroupIds.add(group.id)
            // 计算导图分组尺寸
            const parent = map.get(group.parentNode || "")
            if (parent) {
              parent.nodes = parent.nodes.map((n) =>
                n.id === group.id ? { ...n, width, height, style: { width, height } } : n
              )
              if (parent.group) gids.add(parent.group.id)
            }
          }
        }
        // 非自动布局分组
        else {
          const { x: groupX, y: groupY } = group.positionAbsolute
          let { x, y, width, height } = item.nodes.length
            ? calcGroupRect(item.nodes)
            : emptyGroupRect(group)
          // 固定宽度分组，需要对比节点块和分组的坐标与尺寸
          if (!autoWidth) {
            // 右下角左边
            const rbPos = { x: x + width, y: y + height }
            x = Math.min(x, groupX)
            y = Math.min(y, groupY)
            width = Math.max(rbPos.x, groupX + (group.data.width || group.width)) - x
            height = Math.max(rbPos.y, groupY + (group.data.height || group.height)) - y
          }
          // 分组的坐标发生变化，需要重置分组内所有节点的相对坐标
          if (groupX !== x || groupY !== y) {
            const offsetX = x - groupX
            const offsetY = y - groupY
            const newPos = { x: group.position.x + offsetX, y: group.position.y + offsetY }
            console.error("坐标变更", group.positionAbsolute, { x, y }, newPos)
            item.nodes = item.nodes.map((n) => {
              const np = { x: n.position.x - offsetX, y: n.position.y - offsetY }
              // 组装 DB 变更参数
              nodeMap.set(n.id, { position: np })
              return { ...n, position: np }
            })
            changed = true
            if (group.width !== width || group.height !== height) {
              resizedGroupIds.add(group.id)
            }
            const parent = map.get(group.parentNode || "")
            if (parent) {
              parent.nodes = parent.nodes.map((n) =>
                n.id === group.id
                  ? {
                      ...n,
                      position: newPos,
                      positionAbsolute: { x, y },
                      width,
                      height,
                      style: { width, height },
                      // data: { ...n.data, width, height },
                    }
                  : n
              )
              // 组装 DB 变更参数: 父级为白板或非导图分组时，更新位置
              if (!parent.group || !isMGroupNode(parent.group.type)) {
                nodeMap.set(group.id, { position: newPos })
              }
              if (parent.group) gids.add(parent.group.id)
            }
          } else if (group.width !== width || group.height !== height) {
            const parent = map.get(group.parentNode || "")
            if (parent) {
              parent.nodes = parent.nodes.map((n) =>
                n.id === group.id
                  ? {
                      ...n,
                      width,
                      height,
                      style: { width, height },
                      // data: { ...n.data, width, height },
                    }
                  : n
              )
              changed = true
              resizedGroupIds.add(group.id)
              if (parent.group) gids.add(parent.group.id)
            }
          }
        }
      }
    }
  }
  if (!changed) return
  // 返回所有的子节点
  const newNodes: Node<NodeData>[] = []
  map.forEach((item) => newNodes.push(...item.nodes))
  return [newNodes, resizedGroupIds]
}

// 计算相交的分组节点 ID
export const calcIntersectGroup = ({ x, y }: XYPosition, rects?: TempRect[]) => {
  return rects && rects.length ? rects.find((r) => checkPositionInRect(x, y, r)) : undefined
}
// 过滤能够计算相交的分组列表
export const calcGroupRects = (nodes: Node<NodeData>[], groupSet?: Set<string>) => {
  const groups = nodes.filter((n) => isGroupCate(n.type))
  if (!groups.length) return []
  // 将分组节点按嵌套进行排序
  const parentMap = new Map<string, string | undefined>()
  groups.forEach((n) => parentMap.set(n.id, n.parentNode))
  const rects: TempRect[] = []
  groups.forEach((n) => {
    let pId = parentMap.get(n.id)
    let cnt = 0
    let hitFilter = groupSet && groupSet.has(n.id)
    while (pId) {
      cnt++
      if (!hitFilter) hitFilter = groupSet && groupSet.has(pId)
      pId = parentMap.get(pId)
    }
    if (!hitFilter) {
      rects.push({
        ...(n.positionAbsolute || { x: 0, y: 0 }),
        width: n.width || 0,
        height: n.height || 0,
        cnt,
        id: n.id,
        type: n.type,
        layout: n.data.layout,
      })
    }
  })
  // 按 cnt 由大到小排序
  return rects.length ? rects.sort((a, b) => b.cnt - a.cnt) : []
}

const checkPositionInRect = (x: number, y: number, rect: Rect): boolean => {
  return x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.height
}

// 视图节点转换为文本节点(删除视图时触发)
export const viewConvText = (node: Node<NodeData>, name: string) => {
  const vnType = node.type === VNTypeEnum.VIEW ? VNTypeEnum.TEXT : node.type
  return {
    ...node,
    type: vnType,
    data: {
      ...node.data,
      nodeId: "",
      nodeType: NodeTypeEnum.TEXT,
      ext: convertTextExt(name),
      viewInfo: undefined,
    },
  }
}

// 卡片节点转换为文本节点(删除卡片时触发)
export const cardConvText = (node: Node<NodeData>, name: string) => {
  const vnType = node.type === VNTypeEnum.CARD ? VNTypeEnum.TEXT : node.type
  return {
    ...node,
    type: vnType,
    data: {
      ...node.data,
      nodeId: "",
      nodeType: NodeTypeEnum.TEXT,
      ext: convertTextExt(name),
      cardInfo: undefined,
    },
  }
}

// 检测分组节点是否已经重置
export const checkResizedGroup = (changeNodeIds: string[], resizedGroupIds: Set<string>) => {
  if (changeNodeIds.length !== resizedGroupIds.size) return false
  return changeNodeIds.every((id) => resizedGroupIds.has(id))
}
