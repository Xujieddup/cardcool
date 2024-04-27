import type { XYPosition, Transform, FitViewOptions, ReactFlowState } from "@/reactflow"
import type { Selection as D3Selection } from "d3"
import { getRectOfNodes, getTransformForBounds } from "@/reactflow"
import { StoreApi } from "zustand"
import { zoomIdentity } from "d3-zoom"

export const pointToRendererPoint = (
  { x, y }: XYPosition,
  [tx, ty, tScale]: Transform,
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

export const getD3Transition = (
  selection: D3Selection<Element, unknown, null, undefined>,
  duration = 0
) => {
  return selection.transition().duration(duration)
}

type InternalFitViewOptions = {
  initial?: boolean
} & FitViewOptions

export function fitView(
  get: StoreApi<ReactFlowState>["getState"],
  options: InternalFitViewOptions = {}
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
  const isInitialFitView = options.initial && !fitViewOnInitDone && fitViewOnInit
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
