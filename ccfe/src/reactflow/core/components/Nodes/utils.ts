import { MouseEvent, RefObject } from "react"
import { StoreApi } from "zustand"

import { getDimensions } from "../../utils"
import { Position } from "../../types"
import type { HandleElement, Node, NodeOrigin, ReactFlowState } from "../../types"
import { errorMessages } from "../../contants"

export const getHandleBounds = (
  selector: string,
  nodeElement: HTMLDivElement,
  zoom: number,
  nodeOrigin: NodeOrigin
): HandleElement[] | null => {
  const handles = nodeElement.querySelectorAll(selector)

  if (!handles || !handles.length) {
    return null
  }

  const handlesArray = Array.from(handles) as HTMLDivElement[]
  const nodeBounds = nodeElement.getBoundingClientRect()
  const nodeOffset = {
    x: nodeBounds.width * nodeOrigin[0],
    y: nodeBounds.height * nodeOrigin[1],
  }

  return handlesArray.map((handle): HandleElement => {
    const handleBounds = handle.getBoundingClientRect()

    return {
      id: handle.getAttribute("data-handleid"),
      position: handle.getAttribute("data-handlepos") as unknown as Position,
      x: (handleBounds.left - nodeBounds.left - nodeOffset.x) / zoom,
      y: (handleBounds.top - nodeBounds.top - nodeOffset.y) / zoom,
      ...getDimensions(handle),
    }
  })
}

export function getMouseHandler(
  id: string,
  getState: StoreApi<ReactFlowState>["getState"],
  handler?: (event: MouseEvent, node: Node) => void
) {
  return handler === undefined
    ? handler
    : (event: MouseEvent) => {
        const node = getState().nodeInternals.get(id)

        if (node) {
          handler(event, { ...node })
        }
      }
}

// this handler is called by
// 1. the click handler when node is not draggable or selectNodesOnDrag = false
// or
// 2. the on drag start handler when node is draggable and selectNodesOnDrag = true
// 调用场景: 1.
// unselect: 节点获取焦点时按 Escape 键为 true，表示取消节点选中状态
export function handleNodeClick({
  id,
  store,
  unselect = false,
  nodeRef,
}: {
  id: string
  store: {
    getState: StoreApi<ReactFlowState>["getState"]
    setState: StoreApi<ReactFlowState>["setState"]
  }
  unselect?: boolean
  nodeRef?: RefObject<HTMLDivElement>
}) {
  const {
    addSelectedNodes,
    unselectNodesAndEdges,
    multiSelectionActive,
    nodeInternals,
    onError,
    nodesSelectionActive,
    getNodes,
  } = store.getState()
  const node = nodeInternals.get(id)

  if (!node) {
    onError?.("012", errorMessages["error012"](id))
    return
  }

  // 点击没有选中的节点时，选中该节点
  if (!node.selected) {
    // 多选状态时选中节点
    if (multiSelectionActive) {
      // 判断所有节点是否在同一分组中
      const aMindNode = !!node.data.pid
      const ns = getNodes().filter((n) => n.selected)
      if (ns.length === 0 || (ns[0].parentNode === node.parentNode && !aMindNode)) {
        addSelectedNodes([id])
      } else {
        return
      }
      // 激活框选状态
      if (!nodesSelectionActive && !aMindNode) {
        store.setState({ nodesSelectionActive: true })
      }
    } else {
      // 非多选状态时选中新节点，取消框选激活状态
      addSelectedNodes([id])
      if (nodesSelectionActive) {
        store.setState({ nodesSelectionActive: false })
      }
    }
  } else {
    // 当前已选中的节点按 Esc 键(unselect 为 true)，或在多选状态下点击已选中的节点，取消该节点的选中，并刷新使其失去焦点
    if (unselect || multiSelectionActive) {
      unselectNodesAndEdges({ nodes: [node], edges: [] })
      // 取消选中节点，不用更新框选激活状态(若选中节点数为 0，NodesSelection 会触发取消激活状态)

      requestAnimationFrame(() => nodeRef?.current?.blur())
    }
  }
}
