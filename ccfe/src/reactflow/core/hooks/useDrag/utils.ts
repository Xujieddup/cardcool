import type { RefObject } from "react"

import { clampPosition, isNumeric } from "../../utils"
import type {
  CoordinateExtent,
  Edge,
  Node,
  NodeDragItem,
  NodeInternals,
  NodeOrigin,
  OnError,
  XYPosition,
} from "../../types"
import { getNodePositionWithOrigin } from "../../utils/graph"
import { errorMessages } from "../../contants"

// 递归判断指定节点的父级节点是否被选中(没有父级节点返回 false)
export function isParentSelected(node: Node, nodeInternals: NodeInternals): boolean {
  if (!node.parentNode) {
    return false
  }

  const parentNode = nodeInternals.get(node.parentNode)

  if (!parentNode) {
    return false
  }

  if (parentNode.selected) {
    return true
  }

  return isParentSelected(parentNode, nodeInternals)
}

export function hasSelector(
  target: Element,
  selector: string,
  nodeRef: RefObject<Element>
): boolean {
  let current = target

  do {
    if (current?.matches(selector)) return true
    if (current === nodeRef.current) return false
    current = current.parentElement as Element
  } while (current)

  return false
}

// looks for all selected nodes and created a NodeDragItem for each of them
// 拖拽节点时查询所有选中的节点，并转换为 NodeDragItem 类型数组
export function getDragItems(
  nodeInternals: NodeInternals,
  nodesDraggable: boolean,
  mousePos: XYPosition,
  edges: Edge[],
  nodeId?: string
): NodeDragItem[] {
  // 实际拖拽的模板节点
  let targetIds = new Set<string>()
  const node = nodeId ? nodeInternals.get(nodeId) : undefined
  if (node) {
    // 拖拽导图节点
    if (node.data.pid && node.parentNode) {
      // 拖拽导图根节点，代理到导图节点上
      if (node.data.pid === "root") {
        targetIds.add(node.parentNode)
      } else {
        // 拖拽导图非根节点，则计算该节点所有子节点
        targetIds = getChildNodeIds(edges, node.parentNode, node.id)
      }
    } else if (!node.selected) {
      // 非导图节点，且未被选中时，仅拖拽当前节点
      targetIds.add(node.id)
    }
  }
  const items = Array.from(nodeInternals.values())
    .filter(
      (n) =>
        (targetIds.size ? targetIds.has(n.id) : n.selected) &&
        (!n.parentNode || !isParentSelected(n, nodeInternals)) &&
        (n.draggable || (nodesDraggable && typeof n.draggable === "undefined"))
    )
    .map((n) => ({
      id: n.id,
      position: n.position || { x: 0, y: 0 },
      positionAbsolute: n.positionAbsolute || { x: 0, y: 0 },
      distance: {
        x: mousePos.x - (n.positionAbsolute?.x ?? 0),
        y: mousePos.y - (n.positionAbsolute?.y ?? 0),
      },
      delta: {
        x: 0,
        y: 0,
      },
      extent: n.extent,
      parentNode: n.parentNode,
      width: n.width,
      height: n.height,
      expandParent: n.expandParent,
    }))
  // targetIds.size > 1 表示拖拽的是导图分组中的非根节点，且含有子节点，需要排序将当前节点放到第一位
  if (targetIds.size > 1 && items[0].id !== nodeId) {
    const newItems: NodeDragItem[] = []
    items.forEach((i) => (i.id === nodeId ? newItems.unshift(i) : newItems.push(i)))
    return newItems
  } else {
    return items
  }
}

function clampNodeExtent(node: NodeDragItem | Node, extent?: CoordinateExtent | "parent") {
  if (!extent || extent === "parent") {
    return extent
  }
  return [extent[0], [extent[1][0] - (node.width || 0), extent[1][1] - (node.height || 0)]]
}

export function calcNextPosition(
  node: NodeDragItem | Node,
  nextPosition: XYPosition,
  nodeInternals: NodeInternals,
  nodeExtent?: CoordinateExtent,
  nodeOrigin: NodeOrigin = [0, 0],
  onError?: OnError
): { position: XYPosition; positionAbsolute: XYPosition } {
  const clampedNodeExtent = clampNodeExtent(node, node.extent || nodeExtent)
  let currentExtent = clampedNodeExtent

  if (node.extent === "parent" && !node.expandParent) {
    if (node.parentNode && node.width && node.height) {
      const parent = nodeInternals.get(node.parentNode)
      const { x: parentX, y: parentY } = getNodePositionWithOrigin(
        parent,
        nodeOrigin
      ).positionAbsolute
      currentExtent =
        parent &&
        isNumeric(parentX) &&
        isNumeric(parentY) &&
        isNumeric(parent.width) &&
        isNumeric(parent.height)
          ? [
              [parentX + node.width * nodeOrigin[0], parentY + node.height * nodeOrigin[1]],
              [
                parentX + parent.width - node.width + node.width * nodeOrigin[0],
                parentY + parent.height - node.height + node.height * nodeOrigin[1],
              ],
            ]
          : currentExtent
    } else {
      onError?.("005", errorMessages["error005"]())

      currentExtent = clampedNodeExtent
    }
  } else if (node.extent && node.parentNode && node.extent !== "parent") {
    const parent = nodeInternals.get(node.parentNode)
    const { x: parentX, y: parentY } = getNodePositionWithOrigin(
      parent,
      nodeOrigin
    ).positionAbsolute
    currentExtent = [
      [node.extent[0][0] + parentX, node.extent[0][1] + parentY],
      [node.extent[1][0] + parentX, node.extent[1][1] + parentY],
    ]
  }

  let parentPosition = { x: 0, y: 0 }

  if (node.parentNode) {
    const parentNode = nodeInternals.get(node.parentNode)
    parentPosition = getNodePositionWithOrigin(parentNode, nodeOrigin).positionAbsolute
  }

  const positionAbsolute =
    currentExtent && currentExtent !== "parent"
      ? clampPosition(nextPosition, currentExtent as CoordinateExtent)
      : nextPosition

  return {
    position: {
      x: positionAbsolute.x - parentPosition.x,
      y: positionAbsolute.y - parentPosition.y,
    },
    positionAbsolute,
  }
}

// returns two params:
// 1. the dragged node (or the first of the list, if we are dragging a node selection)
// 2. array of selected nodes (for multi selections)
// 组装拖拽事件的参数: 1. 当前拖拽的节点或拖拽选区时的第一个节点, 2. 所有选中拖拽的节点
export function getEventHandlerParams({
  nodeId,
  dragItems,
  nodeInternals,
  isDragEnd,
}: {
  nodeId?: string
  dragItems: NodeDragItem[]
  nodeInternals: NodeInternals
  isDragEnd?: boolean
}): [Node, Node[]] {
  const extentedDragItems: Node[] = dragItems.map((n) => {
    const node = nodeInternals.get(n.id)!
    // 如果是拖拽结束，则直接使用 nodeInternals 的坐标，因为辅助线可能会更新 nodeInternals 的坐标，而 dragItems 还是鼠标对应的坐标，就会出现拖拽结束，被拖拽节点的位置偏移
    return isDragEnd
      ? { ...node }
      : {
          ...node,
          position: n.position,
          positionAbsolute: n.positionAbsolute,
        }
  })

  // 拖拽导图节点时，代理到另外的节点
  return [
    nodeId && !nodeInternals.get(nodeId)?.data.pid
      ? extentedDragItems.find((n) => n.id === nodeId)!
      : extentedDragItems[0],
    extentedDragItems,
  ]
}

// 根据边关系获取导图指定节点的所有子节点
export const getChildNodeIds = (edges: Edge[], groupId: string, nodeId: string) => {
  // 从所有边中筛选出指定导图的，再组装成 map
  const map = new Map<string, string[]>()
  edges.forEach((e) => {
    if (e.data?.groupId === groupId) {
      if (map.has(e.source)) {
        map.get(e.source)?.push(e.target)
      } else {
        map.set(e.source, [e.target])
      }
    }
  })
  let nodeIds = [nodeId]
  const allNodeIds = [nodeId]
  while (nodeIds.length) {
    const tmpNodeIds: string[] = []
    nodeIds.forEach((i) => {
      const childNodeIds = map.get(i)
      if (childNodeIds && childNodeIds.length) {
        tmpNodeIds.push(...childNodeIds)
        allNodeIds.push(...childNodeIds)
      }
    })
    nodeIds = tmpNodeIds
  }
  return new Set(allNodeIds)
}
