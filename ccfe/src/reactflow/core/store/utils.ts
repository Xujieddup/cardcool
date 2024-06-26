import { zoomIdentity } from "d3-zoom"
import type { StoreApi } from "zustand"

import { internalsSymbol, isNumeric } from "../utils"
import {
  getD3Transition,
  getRectOfNodes,
  getTransformForBounds,
  getNodePositionWithOrigin,
} from "../utils/graph"
import type {
  Edge,
  EdgeSelectionChange,
  Node,
  NodeInternals,
  NodeSelectionChange,
  ReactFlowState,
  XYZPosition,
  FitViewOptions,
  NodeOrigin,
} from "../types"

type ParentNodes = Record<string, boolean>

function calculateXYZPosition(
  node: Node,
  nodeInternals: NodeInternals,
  result: XYZPosition,
  nodeOrigin: NodeOrigin
): XYZPosition {
  if (!node.parentNode) {
    return result
  }
  const parentNode = nodeInternals.get(node.parentNode)!
  const parentNodePosition = getNodePositionWithOrigin(parentNode, nodeOrigin)
  return calculateXYZPosition(
    parentNode,
    nodeInternals,
    {
      x: (result.x ?? 0) + parentNodePosition.x,
      y: (result.y ?? 0) + parentNodePosition.y,
      z:
        (parentNode[internalsSymbol]?.z ?? 0) > (result.z ?? 0)
          ? parentNode[internalsSymbol]?.z ?? 0
          : result.z ?? 0,
    },
    nodeOrigin
  )
}

export function updateAbsoluteNodePositions(
  nodeInternals: NodeInternals,
  nodeOrigin: NodeOrigin,
  parentNodes?: ParentNodes
) {
  nodeInternals.forEach((node) => {
    if (node.parentNode && !nodeInternals.has(node.parentNode)) {
      throw new Error(`Parent node ${node.parentNode} not found`)
    }
    // 计算节点层级，白板上的第一层为 10，第二层为 12
    let layer = 1
    let parentId = node.parentNode
    // 当前节点或当前节点所属分组(嵌套)正在拖拽中
    let isDragging = !!node.dragging
    while (parentId) {
      layer++
      const parentNode = nodeInternals.get(parentId)
      parentId = parentNode?.parentNode
      if (!isDragging && parentNode) {
        isDragging = !!parentNode.dragging
      }
    }
    node.layer = layer
    node.zIndex = node[internalsSymbol]!.z = (isDragging ? 1000 : 10) + 2 * layer

    if (node.parentNode || parentNodes?.[node.id]) {
      const { x, y, z } = calculateXYZPosition(
        node,
        nodeInternals,
        {
          ...node.position,
          z: node[internalsSymbol]?.z ?? 0,
        },
        nodeOrigin
      )

      node.positionAbsolute = {
        x,
        y,
      }

      // node[internalsSymbol]!.z = z

      if (parentNodes?.[node.id]) {
        node[internalsSymbol]!.isParent = true
      }
    }
  })
}

export function createNodeInternals(
  nodes: Node[],
  nodeInternals: NodeInternals,
  nodeOrigin: NodeOrigin,
  elevateNodesOnSelect: boolean
): NodeInternals {
  const nextNodeInternals = new Map<string, Node>()
  const parentNodes: ParentNodes = {}
  const selectedNodeZ: number = elevateNodesOnSelect ? 1000 : 0
  nodes.forEach((node) => {
    // 节点默认 zIndex 为 10
    const z = (isNumeric(node.zIndex) ? node.zIndex : 10) + (node.selected ? selectedNodeZ : 0)
    const currInternals = nodeInternals.get(node.id)

    const internals: Node = {
      width: currInternals?.width,
      height: currInternals?.height,
      ...node,
      positionAbsolute: {
        x: node.position.x,
        y: node.position.y,
      },
    }

    if (node.parentNode) {
      internals.parentNode = node.parentNode
      parentNodes[node.parentNode] = true
    }

    Object.defineProperty(internals, internalsSymbol, {
      enumerable: false,
      value: {
        handleBounds: currInternals?.[internalsSymbol]?.handleBounds,
        z,
      },
    })

    nextNodeInternals.set(node.id, internals)
  })

  updateAbsoluteNodePositions(nextNodeInternals, nodeOrigin, parentNodes)

  return nextNodeInternals
}

type InternalFitViewOptions = {
  initial?: boolean
} & FitViewOptions

export function fitView(
  get: StoreApi<ReactFlowState>["getState"],
  options: InternalFitViewOptions = {},
  // 强制初始化
  forceInit?: boolean
) {
  const {
    getNodes,
    width,
    height,
    minZoom,
    maxZoom,
    d3Zoom,
    d3Selection,
    fitViewOnInitDone,
    fitViewOnInit,
    nodeOrigin,
  } = get()
  const isInitialFitView = forceInit || (options.initial && !fitViewOnInitDone && fitViewOnInit)
  const d3initialized = d3Zoom && d3Selection
  if (d3initialized && (isInitialFitView || !options.initial)) {
    const nodes = getNodes().filter((n) => {
      const isVisible = options.includeHiddenNodes ? n.width && n.height : !n.hidden

      if (options.nodes?.length) {
        return isVisible && options.nodes.some((optionNode) => optionNode.id === n.id)
      }

      return isVisible
    })

    const nodesInitialized = nodes.every((n) => n.width && n.height)

    if (nodes.length > 0 && nodesInitialized) {
      const bounds = getRectOfNodes(nodes, nodeOrigin)

      const [x, y, zoom] = getTransformForBounds(
        bounds,
        width,
        height,
        options.minZoom ?? minZoom,
        options.maxZoom ?? maxZoom,
        options.padding ?? 0.1
      )

      const nextTransform = zoomIdentity.translate(x, y).scale(zoom)

      if (typeof options.duration === "number" && options.duration > 0) {
        d3Zoom.transform(getD3Transition(d3Selection, options.duration), nextTransform)
      } else {
        d3Zoom.transform(d3Selection, nextTransform)
      }

      return true
    }
  }

  return false
}

export function handleControlledNodeSelectionChange(
  nodeChanges: NodeSelectionChange[],
  nodeInternals: NodeInternals
) {
  nodeChanges.forEach((change) => {
    const node = nodeInternals.get(change.id)
    if (node) {
      nodeInternals.set(node.id, {
        ...node,
        [internalsSymbol]: node[internalsSymbol],
        selected: change.selected,
      })
    }
  })

  return new Map(nodeInternals)
}

export function handleControlledEdgeSelectionChange(
  edgeChanges: EdgeSelectionChange[],
  edges: Edge[]
) {
  return edges.map((e) => {
    const change = edgeChanges.find((change) => change.id === e.id)
    if (change) {
      e.selected = change.selected
    }
    return e
  })
}

type UpdateNodesAndEdgesParams = {
  changedNodes: NodeSelectionChange[] | null
  changedEdges: EdgeSelectionChange[] | null
  get: StoreApi<ReactFlowState>["getState"]
  set: StoreApi<ReactFlowState>["setState"]
}

export function updateNodesAndEdgesSelections({
  changedNodes,
  changedEdges,
  get,
  set,
}: UpdateNodesAndEdgesParams) {
  const { nodeInternals, edges, onNodesChange, onEdgesChange, hasDefaultNodes, hasDefaultEdges } =
    get()

  if (changedNodes?.length) {
    if (hasDefaultNodes) {
      set({ nodeInternals: handleControlledNodeSelectionChange(changedNodes, nodeInternals) })
    }
    // 避免触发 onNodesChange-select 事件
    // onNodesChange?.(changedNodes)
  }

  if (changedEdges?.length) {
    if (hasDefaultEdges) {
      set({ edges: handleControlledEdgeSelectionChange(changedEdges, edges) })
    }

    onEdgesChange?.(changedEdges)
  }
}
