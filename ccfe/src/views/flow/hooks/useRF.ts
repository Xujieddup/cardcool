import { useCallback, useMemo } from "react"
import type { MyDatabase, VNParam } from "@/types"
import { getRemoveData, resetNodes } from "@/utils"
import { Instance, Transform as RFTransform, useStoreApi } from "@/reactflow"
import type {
  EdgeRemoveChange,
  EdgeResetChange,
  NodeRemoveChange,
  NodeResetChange,
  Project,
  XYPosition,
  Node,
  Edge,
  FitView,
} from "@/reactflow"
import {
  getD3Transition,
  getRectOfNodes,
  getTransformForBounds,
  rendererPointToPoint,
} from "@/reactflow/core/utils/graph"
import { zoomIdentity } from "d3-zoom"
import { gd } from "@/config"

const pointToRendererPoint = (
  { x, y }: XYPosition,
  [tx, ty, tScale]: RFTransform,
  snapToGrid: boolean,
  [snapX, snapY]: [number, number]
): XYPosition => {
  const position: XYPosition = {
    x: (x - tx) / tScale,
    y: (y - ty) / tScale,
  }
  if (snapToGrid) {
    return {
      x: snapX * Math.round(position.x / snapX),
      y: snapY * Math.round(position.y / snapY),
    }
  }
  return position
}

type InitNodes<NodeData> = (nodes: Node<NodeData>[]) => void
type SetSelectionActive = (active: boolean) => void
type DeleteNodes = (db?: MyDatabase, nodeId?: string) => void
type SetOriginNodes<NodeData> = (nodes: Node<NodeData>[]) => void
type SetOriginEdges<EdgeData> = (edges: Edge<EdgeData>[]) => void
type UpdateConnectionLine = (
  sourceNodeId?: string,
  sourceHandleId?: string,
  targetPos?: XYPosition
) => void
type FitSelectedNodes = () => void
export type RFInstance<NodeData = any, EdgeData = any> = {
  getNodes: Instance.GetNodes<NodeData>
  getOriginNodes: Instance.GetNodes<NodeData>
  getNode: Instance.GetNode<NodeData>
  getEdges: Instance.GetEdges<EdgeData>
  getOriginEdges: Instance.GetEdges<EdgeData>
  getEdge: Instance.GetEdge<EdgeData>
  setNodes: Instance.SetNodes<NodeData>
  setOriginNodes: SetOriginNodes<NodeData>
  setEdges: Instance.SetEdges<EdgeData>
  setOriginEdges: SetOriginEdges<EdgeData>
  initNodes: InitNodes<NodeData>
  project: Project
  setSelectionActive: SetSelectionActive
  deleteNodes: DeleteNodes
  forceInitFitView: FitView
  fitSelectNodes: FitSelectedNodes
  updateConnectionLine: UpdateConnectionLine
}
function useRF<NodeData = any, EdgeData = any>(): RFInstance<NodeData, EdgeData> {
  const store = useStoreApi()

  const getNodes = useCallback<Instance.GetNodes<NodeData>>(() => {
    return store
      .getState()
      .getNodes()
      .map((n) => ({ ...n }))
  }, [store])
  // 获取原始节点，只用于查询，不要修改
  const getOriginNodes = useCallback<Instance.GetNodes<NodeData>>(() => {
    return store.getState().getNodes()
  }, [store])
  const setOriginNodes = useCallback<SetOriginNodes<NodeData>>(
    (nodes) => store.getState().setNodes(nodes),
    [store]
  )
  const getNode = useCallback<Instance.GetNode<NodeData>>(
    (id) => store.getState().nodeInternals.get(id),
    [store]
  )
  const getOriginEdges = useCallback<Instance.GetEdges<EdgeData>>(() => {
    const { edges = [] } = store.getState()
    return edges
  }, [store])
  const getEdges = useCallback<Instance.GetEdges<EdgeData>>(() => {
    const { edges = [] } = store.getState()
    return edges.map((e) => ({ ...e }))
  }, [store])
  const getEdge = useCallback<Instance.GetEdge<EdgeData>>(
    (id) => {
      const { edges = [] } = store.getState()
      return edges.find((e) => e.id === id)
    },
    [store]
  )
  const setNodes = useCallback<Instance.SetNodes<NodeData>>(
    (payload) => {
      const { getNodes, setNodes, hasDefaultNodes, onNodesChange } = store.getState()
      const nodes = getNodes()
      const nextNodes = typeof payload === "function" ? payload(nodes) : payload
      if (hasDefaultNodes) {
        setNodes(nextNodes)
      } else if (onNodesChange) {
        const changes =
          nextNodes.length === 0
            ? nodes.map((node) => ({ type: "remove", id: node.id } as NodeRemoveChange))
            : nextNodes.map((node) => ({ item: node, type: "reset" } as NodeResetChange<NodeData>))
        onNodesChange(changes)
      }
    },
    [store]
  )
  const initNodes = useCallback<InitNodes<NodeData>>(
    (nodes) => {
      const { setNodes, forceInitFitView } = store.getState()
      setNodes(nodes)
      forceInitFitView()
    },
    [store]
  )
  const setEdges = useCallback<Instance.SetEdges<EdgeData>>(
    (payload) => {
      const { edges = [], setEdges, hasDefaultEdges, onEdgesChange } = store.getState()
      const nextEdges = typeof payload === "function" ? payload(edges) : payload
      if (hasDefaultEdges) {
        setEdges(nextEdges)
      } else if (onEdgesChange) {
        const changes =
          nextEdges.length === 0
            ? edges.map((edge) => ({ type: "remove", id: edge.id } as EdgeRemoveChange))
            : nextEdges.map((edge) => ({ item: edge, type: "reset" } as EdgeResetChange<EdgeData>))
        onEdgesChange(changes)
      }
    },
    [store]
  )
  const setOriginEdges = useCallback<SetOriginEdges<EdgeData>>(
    (edges) => store.getState().setEdges(edges),
    [store]
  )
  const project: Project = useCallback(
    (position) => {
      const { transform, snapToGrid, snapGrid } = store.getState()
      return pointToRendererPoint(position, transform, snapToGrid, snapGrid)
    },
    [store]
  )
  const setSelectionActive = useCallback<SetSelectionActive>(
    (active: boolean) => store.setState({ nodesSelectionActive: active }),
    [store]
  )
  // 删除节点: 删除指定单个节点(nodeId 不为空)、删除选中的多个节点(Delete 快捷键)
  const deleteNodes: DeleteNodes = useCallback(
    (db?: MyDatabase, nodeId?: string) => {
      const { getNodes, setNodes, edges: originEdges = [], setEdges } = store.getState()
      const nodes: Node[] = getNodes().map((n) => ({ ...n }))
      const edges = originEdges.map((e) => ({ ...e }))
      // 需要删除的节点和边列表
      let selectNodeIds: string[] = []
      const removeEdgeIds = new Set<string>()
      const removeDBEdgeIds = new Set<string>()
      if (nodeId) {
        if (nodes.find((n) => n.id === nodeId)?.deletable !== false) selectNodeIds = [nodeId]
      } else {
        selectNodeIds = nodes.filter((n) => n.selected && n.deletable !== false).map((n) => n.id)
        edges.forEach((e) => {
          if (e.selected && e.deletable !== false) {
            removeEdgeIds.add(e.id)
            removeDBEdgeIds.add(e.id)
          }
        })
      }
      // 删除节点和删除边分别处理
      if (selectNodeIds.length > 0) {
        const [removeNodeIds, resetGroupIds] = getRemoveData(
          nodes,
          edges,
          selectNodeIds,
          removeEdgeIds,
          removeDBEdgeIds
        )
        // 视图更新节点和关联信息
        let ns = nodes.filter((n) => !removeNodeIds.has(n.id))
        // 重置思维导图布局
        if (resetGroupIds.size > 0) {
          // 重置节点过程中，坐标需要变更的节点
          const nodeMap = new Map<string, VNParam>()
          const res = resetNodes(ns, resetGroupIds, nodeMap)
          if (res) {
            ns = res[0]
            if (nodeMap.size) {
              db?.viewnode.batchUpdateNodeParam(nodeMap)
            }
            if (res[1].size) gd.setResizedGroupIds(res[1])
          }
        }
        // 数据库删除节点和关联信息
        db?.viewnode.deleteNodesByIds([...removeNodeIds])
        setNodes(ns)
      }
      if (removeDBEdgeIds.size > 0) {
        db?.viewedge.deleteEdgesByIds([...removeDBEdgeIds])
      }
      // 数据库删除节点和关联信息
      if (removeEdgeIds.size > 0) {
        setEdges(edges.filter((e) => !removeEdgeIds.has(e.id)))
      }
    },
    [store]
  )
  const forceInitFitView = useCallback<FitView>(
    (fitViewOptions) => store.getState().forceInitFitView(fitViewOptions),
    [store]
  )
  // 聚焦到选中的节点,maxZoom 为 1，
  const fitSelectNodes = useCallback<FitSelectedNodes>(() => {
    const { getNodes, width, height, minZoom, d3Zoom, d3Selection } = store.getState()
    const nodes = getNodes().filter((n) => n.selected)
    if (!nodes.length) return
    const bounds = getRectOfNodes(nodes)
    const [x, y, zoom] = getTransformForBounds(bounds, width, height, minZoom, 1, 0.1)
    const transform = zoomIdentity.translate(x, y).scale(zoom)
    if (d3Zoom && d3Selection) {
      d3Zoom.transform(getD3Transition(d3Selection, 600), transform)
    }
  }, [store])
  const updateConnectionLine = useCallback<UpdateConnectionLine>(
    (sourceNodeId, sourceHandleId, targetPos) => {
      if (sourceNodeId && sourceHandleId && targetPos) {
        store.setState({
          connectionNodeId: sourceNodeId,
          connectionHandleId: sourceHandleId,
          connectionPosition: rendererPointToPoint(targetPos, store.getState().transform),
        })
      } else {
        store.setState({
          connectionNodeId: null,
        })
      }
    },
    [store]
  )
  return useMemo(
    () => ({
      getNodes,
      getOriginNodes,
      getNode,
      getEdges,
      getOriginEdges,
      getEdge,
      setNodes,
      setOriginNodes,
      initNodes,
      setEdges,
      setOriginEdges,
      project,
      setSelectionActive,
      deleteNodes,
      forceInitFitView,
      fitSelectNodes,
      updateConnectionLine,
    }),
    [
      getEdge,
      getEdges,
      getOriginEdges,
      getNode,
      getNodes,
      getOriginNodes,
      setEdges,
      setOriginEdges,
      setNodes,
      setOriginNodes,
      initNodes,
      project,
      setSelectionActive,
      deleteNodes,
      forceInitFitView,
      fitSelectNodes,
      updateConnectionLine,
    ]
  )
}

export default useRF
