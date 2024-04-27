import type { EdgeData, NodeData, ViewEdge } from "@/types"
import { MarkerType } from "@/reactflow"
import type { Edge, Node } from "@/reactflow/core"

const convTargetHandle = (th: string) => {
  switch (th) {
    case "tt":
      return "st"
    case "tr":
      return "sr"
    case "tb":
      return "sb"
    case "tl":
      return "sl"
    default:
      return th
  }
}
// 格式化视图节点信息
export const edgeFactory = (ve: ViewEdge, direction?: string) => {
  const sourceHandle = direction ? (direction === "LR" ? "sr" : "sb") : ve.source_handle
  const targetHandle = direction
    ? direction === "LR"
      ? "tl"
      : "tt"
    : convTargetHandle(ve.target_handle)
  return {
    id: ve.id,
    type: ve.ve_type_id,
    source: ve.source,
    target: ve.target,
    sourceHandle,
    targetHandle,
    data: { label: ve.name },
    markerEnd: { type: MarkerType.ArrowClosed },
  } as Edge<EdgeData>
}
// 基于导图节点生成导图关联
export const genMindEdges = (nodes: Node<NodeData>[], direction?: string) => {
  return nodes.map((n) => genMindEdge(n, direction))
}
// 格式化视图节点信息
export const genMindEdge = (node: Node<NodeData>, direction?: string) => {
  const sourceHandle = direction ? (direction === "LR" ? "sr" : "sb") : "sr"
  const targetHandle = direction ? (direction === "LR" ? "sl" : "st") : "sl"
  return {
    id: mindEdgeId(node.id),
    type: "mindEdge",
    source: node.data.pid,
    target: node.id,
    sourceHandle,
    targetHandle,
    deletable: false,
    selected: false,
    data: {
      groupId: node.parentNode,
    },
  } as Edge<EdgeData>
}
export const mindEdgeId = (targetId: string) => {
  return "me_" + targetId
}
