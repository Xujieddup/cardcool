import type { MindNodeItem, NodeData, TempRect } from "@/types"
import type { Node, Rect } from "@/reactflow/core"
import { XYPosition } from "@/reactflow"
import { isMindRootNode } from "./node"
import { MindLayoutEnum, MindNodeDireEnum } from "@/enums"

/**
 * 从导图的所有子节点钟，筛选出指定节点的所有子节点和其他节点(排除指定节点及其所有子节点)
 * 返回第一个参数: 指定节点及其所有子节点，第二个参数: 指定节点在当前层级中的次序，第三个参数: 导图中的剩余节点
 * @param mindNodes 指定导图分组中的所有子节点(按顺序排列的)
 * @param dragNodeIds 在同一导图分组中拖拽，为拖拽的节点(第一个)及其所有子节点，否则为 undefined
 * @returns remindNodes 导图分组中除拖拽节点外的其他节点
 * @returns originIndex 同一导图分组中拖拽，为拖拽节点的层级(根节点为 0)，否则为 -1
 */
export const formatNodes = (
  mindNodes: Node<NodeData>[],
  dragNodeIds?: string[]
): [MindNodeItem[], number] => {
  // 将数组转换成 map
  const map: Map<string, MindNodeItem> = new Map(
    mindNodes.map((node) => [
      node.id,
      {
        id: node.id,
        index: 0,
        pid: node.data.pid as string,
        snum: node.data.snum || 0,
        positions: getNodeRectPositions(node),
        depth: 0,
        children: [],
      },
    ])
  )
  // 转换成树
  const tree: MindNodeItem[] = []
  map.forEach((node) => {
    if (isMindRootNode(node.pid)) {
      tree.push(node)
    } else {
      map.get(node.pid)?.children.push(node)
    }
  })
  // 再将树展开成层级数组
  const list = flatten(tree)
  // 遍历数组，找到所有子节点id，和剩余节点
  if (dragNodeIds && dragNodeIds.length) {
    const dragId = dragNodeIds[0]
    const dragNodeIdSet = new Set(dragNodeIds)
    const remainNodes: MindNodeItem[] = []
    // 指定节点在同一层级的序号(从 0 开始)
    let originIndex = -1
    list.forEach((item) => {
      if (dragNodeIdSet.has(item.id)) {
        if (item.id === dragId) {
          originIndex = item.index
        }
      } else {
        remainNodes.push(item)
      }
    })
    return [remainNodes, originIndex]
  } else {
    return [list, -1]
  }
}

// 获取节点四个锚点的坐标(中、上、右、下、左)
export const getNodeRectPositions = (node: Node): XYPosition[] => {
  const { x, y } = node.positionAbsolute || { x: 0, y: 0 }
  const width = node.width || 0
  const height = node.height || 0
  return [
    { x: x + width / 2, y: y + height / 2 },
    { x: x + width / 2, y: y },
    { x: x + width, y: y + height / 2 },
    { x: x + width / 2, y: y + height },
    { x: x, y: y + height / 2 },
  ]
}
// 获取 rect 四个锚点的坐标(中、上、右、下、左)
export const getRectPositions = (rect: Rect): XYPosition[] => {
  const { x, y, width, height } = rect
  return [
    { x: x + width / 2, y: y + height / 2 },
    { x: x + width / 2, y: y },
    { x: x + width, y: y + height / 2 },
    { x: x + width / 2, y: y + height },
    { x: x, y: y + height / 2 },
  ]
}

// 树形结构转数组
const flatten = (items: MindNodeItem[], depth = 0): MindNodeItem[] => {
  return items.reduce<MindNodeItem[]>((acc, item, index) => {
    return [...acc, { ...item, depth, index }, ...flatten(item.children, depth + 1)]
  }, [])
}

// 确定遍历节点的边方向
const getDirection = (
  direction: MindLayoutEnum,
  rootCenter: XYPosition,
  nodeCenter: XYPosition
) => {
  let dire = MindNodeDireEnum.LEFT
  switch (direction) {
    case MindLayoutEnum.LR:
      dire = MindNodeDireEnum.RIGHT
      break
    case MindLayoutEnum.RL:
      dire = MindNodeDireEnum.LEFT
      break
    case MindLayoutEnum.TB:
      dire = MindNodeDireEnum.BOTTOM
      break
    case MindLayoutEnum.BT:
      dire = MindNodeDireEnum.TOP
      break
    case MindLayoutEnum.LCR:
      dire = nodeCenter.x > rootCenter.x ? MindNodeDireEnum.RIGHT : MindNodeDireEnum.LEFT
      break
    case MindLayoutEnum.TCB:
      dire = nodeCenter.y > rootCenter.y ? MindNodeDireEnum.BOTTOM : MindNodeDireEnum.TOP
      break
  }
  return dire
}
const getPointer = (
  positions: XYPosition[],
  dire: MindNodeDireEnum,
  reverse?: boolean
): XYPosition => {
  switch (dire) {
    case MindNodeDireEnum.LEFT:
      return reverse ? positions[2] : positions[4]
    case MindNodeDireEnum.RIGHT:
      return reverse ? positions[4] : positions[2]
    case MindNodeDireEnum.TOP:
      return reverse ? positions[3] : positions[1]
    case MindNodeDireEnum.BOTTOM:
      return reverse ? positions[1] : positions[3]
    default:
      return positions[0]
  }
}

/**
 * 拖拽中获取当前相交的节点位置: 对比当前拖拽节点与相交导图分组的高度比例
 *
 * 当前拖拽节点高度特别低，直接相交于中点: currHeight < (32 + 38 / 2) * 2 = 102
 * 当前拖拽节点高度最大为分组高度的一定比例(一半)，拖拽到分组中线及以下时，相交点为中点，否则按比例从起始点到中点进行偏移
 * 当前拖拽节点高度高于分组高度的一定比例(一半)，按比例从起始点到中点进行偏移
 * @param groupRect 导图分组尺寸
 * @param rect 当前拖拽节点尺寸
 * @param dire
 * @returns
 */
const getCurrPointer = (groupRect: TempRect, rect: Rect, dire: MindNodeDireEnum): XYPosition => {
  // 计算被拖拽节点四周的坐标
  const positions = getRectPositions(rect)
  const pointer = getPointer(positions, dire, true)
  // 当前只处理 LR 布局的导图逻辑，其他的后续处理 TODO
  if (dire === MindNodeDireEnum.RIGHT) {
    if (rect.height < 32 * 2 + 20) {
      return pointer
    } else if (rect.height < groupRect.height) {
      // 相交点的高度与拖拽节点相对高度的比例应该保持不变
      const scale = rect.height / groupRect.height
      const y =
        ((groupRect.height * scale - 32) / (groupRect.height * scale - rect.height * 0.5)) *
          (rect.y - groupRect.y) +
        (32 + groupRect.y)
      return { x: rect.x, y: Math.min(y, pointer.y) }
    } else {
      const y =
        ((groupRect.height + rect.height / 2 - 32) / groupRect.height) * (rect.y - groupRect.y) +
        (32 + groupRect.y)
      return { x: rect.x, y: Math.min(y, pointer.y) }
    }
  }
  return pointer
}
const getSourceHandleId = (dire: MindNodeDireEnum) => {
  switch (dire) {
    case MindNodeDireEnum.LEFT:
      return "sl"
    case MindNodeDireEnum.RIGHT:
      return "sr"
    case MindNodeDireEnum.TOP:
      return "st"
    case MindNodeDireEnum.BOTTOM:
    default:
      return "sb"
  }
}
const checkDire = (dire: MindNodeDireEnum, nodePointer: XYPosition, nPointer: XYPosition) => {
  switch (dire) {
    case MindNodeDireEnum.LEFT:
      return nPointer.x >= nodePointer.x
    case MindNodeDireEnum.RIGHT:
      return nPointer.x <= nodePointer.x
    case MindNodeDireEnum.TOP:
      return nPointer.y <= nodePointer.y
    case MindNodeDireEnum.BOTTOM:
    default:
      return nPointer.y <= nodePointer.y
  }
}

/**
 * 计算最近的导图节点
 * @param nodes 导图分组内所有需计算距离的节点
 * @param rect 当前节点(选区)的范围
 * @param direction 导图分组的布局方向
 * @returns closestNodeId 最近的节点 ID
 * @returns sourceHandleId 最近节点的 handle id
 * @returns nodePointer 当前节点与边的连接坐标
 */
export const getClosestNodeId = (
  groupRect: TempRect,
  nodes: MindNodeItem[],
  rect: Rect,
  direction: MindLayoutEnum
): [string, string, XYPosition] => {
  // 当前拖拽节点的中心点
  const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
  // 计算被拖拽节点四周的坐标
  // const poitions = getRectPositions(rect)
  // 计算对比方向
  const dire = getDirection(direction, nodes[0].positions[0], center)
  // 当前节点的相交位置
  // const nodePointer = { x: rect.x, y: rect.y }
  const nodePointer = getCurrPointer(groupRect, rect, dire)
  let minDistance = -1
  let nodeId = ""
  nodes.forEach((n) => {
    if (nodeId === "") {
      nodeId = n.id
    } else {
      const nPointer = getPointer(n.positions, dire)
      if (checkDire(dire, nodePointer, nPointer)) {
        const distance =
          Math.pow(nodePointer.x - nPointer.x, 2) + Math.pow(nodePointer.y - nPointer.y, 2)
        if (minDistance === -1 || distance < minDistance) {
          minDistance = distance
          nodeId = n.id
        }
      }
    }
  })
  return [nodeId, getSourceHandleId(dire), nodePointer]
}

/**
- 找到当前上级 mindDrag.current.nodeId 和原上级 node.data.pid
- 计算当前位置 index: 找到当前 pid 下所有直接子级节点，根据方向遍历中心点
  - index 无变更 -> end
  - index 有变更
    - 唯一节点: snum = 10000
    - first: snum = 原 first 的一半，如果等于 0，则更新所有同级节点
    - last: snum = 原 last 的 snum + 10000
    - middle: 前后节点的 snum 平均值，如果等于前一个节点，则更新之后的所有同级节点
- rectPos 被拖拽单个节点(或多个节点组成的新分组)四周的坐标
- inSameGroup 拖拽的导图节点未被拖拽到其他导图
 */
export const calcNodeChange = (
  rectPos: XYPosition[],
  currId: string,
  originPid: string,
  originIndex: number,
  currentPid: string,
  nodes: MindNodeItem[],
  direction: MindLayoutEnum,
  inSameGroup: boolean
) => {
  // 与导图根节点对比计算相对方向
  const dire = getDirection(direction, nodes[0].positions[0], rectPos[0])
  // 找到当前 pid 下所有直接子级节点
  const peerNodes = nodes.filter((n) => n.pid === currentPid)
  // 找到新的父级节点
  const parentNode = nodes.find((n) => n.id === currentPid)
  // 计算当前位置 index: 找到当前 pid 下所有直接子级节点，根据方向遍历中心点
  const idx = getNodeIndex(peerNodes, rectPos, dire, parentNode)
  // 节点和 snum 的映射
  const nodeMap: Map<string, number> = new Map()
  // 位置没有变更
  if (inSameGroup && originPid === currentPid && originIndex === idx) {
    return nodeMap
  } else {
    // 位置发生变更
    // 判断新位置的前一个节点
    const prevItem = idx <= 0 ? undefined : peerNodes[idx - 1]
    const nextItem = idx > peerNodes.length ? undefined : peerNodes[idx]
    if (peerNodes.length === 0) {
      // 只有一个节点，则 snum 置为 10000
      nodeMap.set(currId, 10000)
    } else {
      if (!prevItem) {
        // 移动到第一个位置，则判断第二个位置的节点的 snum 是否大于 0
        if (nextItem && nextItem.snum > 1) {
          // 只需更新当前节点的 snum
          nodeMap.set(currId, Math.floor(nextItem.snum / 2))
        } else {
          // 当前节点的 snum 置为 10000，后面的节点依次叠加 10000
          let snum = 10000
          nodeMap.set(currId, snum)
          peerNodes.forEach((i, index) => {
            if (index >= idx) {
              snum += 10000
              nodeMap.set(i.id, snum)
            }
          })
        }
      } else if (!nextItem) {
        // 移动到最后一个位置，则在前一个位置的节点的 snum + 10000
        nodeMap.set(currId, prevItem.snum + 10000)
      } else {
        // 移动到中间位置，则计算前后位置节点的 snum 的平均值
        const middleSnum = Math.floor((prevItem.snum + nextItem.snum) / 2)
        // 中间值如果和前一个值相等，则在前一个值的基础上，依次叠加 10000
        if (middleSnum === prevItem.snum) {
          let snum = middleSnum + 10000
          nodeMap.set(currId, snum)
          peerNodes.forEach((i, index) => {
            if (index >= idx) {
              snum += 10000
              nodeMap.set(i.id, snum)
            }
          })
        } else {
          // 否则直接应用中间值
          nodeMap.set(currId, middleSnum)
        }
      }
    }
    return nodeMap
  }
}

// 按斜率计算节点的新索引
const getNodeIndex = (
  nodes: MindNodeItem[],
  nodePositions: XYPosition[],
  dire: MindNodeDireEnum,
  parentNode?: MindNodeItem
) => {
  if (nodes.length && parentNode) {
    let idx = -1
    // 上级节点的坐标
    const parentPoint = getPointer(parentNode.positions, dire)
    // 当前节点的位置
    const nodePointer = getPointer(nodePositions, dire, true)
    // 当前节点的斜率
    const nodeSlope = calcSlope(parentPoint, nodePointer, dire)
    for (let index = 0; index < nodes.length; index++) {
      const nPointer = getPointer(nodes[index].positions, dire, true)
      const nSlope = calcSlope(parentPoint, nPointer, dire)
      if (nodeSlope >= nSlope) {
        idx = index
        break
      }
    }
    return idx === -1 ? nodes.length : idx
  } else {
    return 0
  }
}
const calcSlope = (parentPoint: XYPosition, nodePointer: XYPosition, dire: string) => {
  if (dire === "L") {
    const x = parseFloat((parentPoint.x - nodePointer.x).toFixed(2))
    const y = parseFloat((parentPoint.y - nodePointer.y).toFixed(2))
    return x <= 0 ? (y > 0 ? Infinity : -Infinity) : y / x
  } else if (dire === "R") {
    const x = parseFloat((nodePointer.x - parentPoint.x).toFixed(2))
    const y = parseFloat((parentPoint.y - nodePointer.y).toFixed(2))
    return x <= 0 ? (y > 0 ? Infinity : -Infinity) : y / x
  } else if (dire === "T") {
    const x = parseFloat((parentPoint.x - nodePointer.x).toFixed(2))
    const y = parseFloat((parentPoint.y - nodePointer.y).toFixed(2))
    return y <= 0 ? (x > 0 ? Infinity : -Infinity) : x / y
  } else {
    // dire === "B"
    const x = parseFloat((parentPoint.x - nodePointer.x).toFixed(2))
    const y = parseFloat((nodePointer.y - parentPoint.y).toFixed(2))
    return y <= 0 ? (x > 0 ? Infinity : -Infinity) : x / y
  }
}

export const getChildNodeIds = (nodes: Node[], nodeId: string) => {
  const totalIds = [nodeId]
  let ids = getChildIds(nodes, [nodeId])
  while (ids.length) {
    totalIds.push(...ids)
    ids = getChildIds(nodes, ids)
  }
  return totalIds
}
const getChildIds = (nodes: Node[], childNodeIds: string[]) => {
  return nodes.filter((n) => childNodeIds.includes(n.data.pid)).map((n) => n.id)
}
// const arrayToTree = (nodes: Node[]) => {
//   // 先将数组转换成 map
//   const map = new Map(nodes.map((node) => [node.id, node]))
//   const tree = []
//   for (const node of nodes) {
//     if (node.data.pid === "") {
//       tree.push(node)
//     } else {
//       map.get(node.data.pid)?.children.push(node)
//     }
//   }
//   return tree
// }
