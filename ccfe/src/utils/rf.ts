import { TEMP_MIND_DRAG_NODE } from "@/constant"
import type { Rect, Node } from "@/reactflow"
import { NodeData } from "@/types"

export const nodeToRect = (node: Node): Rect => ({
  ...(node.positionAbsolute || { x: 0, y: 0 }),
  width: node.width || 0,
  height: node.height || 0,
})
export const getOverlappingArea = (rectA: Rect, rectB: Rect): number => {
  const xOverlap = Math.max(
    0,
    Math.min(rectA.x + rectA.width, rectB.x + rectB.width) - Math.max(rectA.x, rectB.x)
  )
  const yOverlap = Math.max(
    0,
    Math.min(rectA.y + rectA.height, rectB.y + rectB.height) - Math.max(rectA.y, rectB.y)
  )
  return Math.ceil(xOverlap * yOverlap)
}

// 过滤出指定分组下的所有节点(排查临时拖拽导图节点)
export const filterByGroupId = (nodes: Node<NodeData>[], groupId?: string): Node<NodeData>[] => {
  return groupId === undefined
    ? nodes.filter((n) => n.parentNode === groupId && n.id !== TEMP_MIND_DRAG_NODE)
    : nodes.filter((n) => n.parentNode === groupId)
}
