import { GROUP_PADDING, NODE_GAP } from "@/constant"
import { LayoutEnum } from "@/enums"
import type { XYPosition, Node, Rect } from "@/reactflow"
import type { NodeData, TempRect } from "@/types"
import { isVerticalAlign } from "@/utils"

type GetHelperLinesResult = {
  horizontal?: number
  vertical?: number
  start?: XYPosition
  end?: XYPosition
  snapPosition: Partial<XYPosition>
}

// this utility function can be called with a position change (inside onNodesChange)
// it checks all other nodes and calculated the helper line positions and the position where the current node should snap to
// 检测所有其他节点，计算辅助线的位置以及当前节点被磁吸的位置(调用于 onNodesChange-position)
export function getHelperLines(rect: Rect, nodes: Node[], distance = 5): GetHelperLinesResult {
  const defaultResult = {
    horizontal: undefined,
    vertical: undefined,
    snapPosition: { x: undefined, y: undefined },
  }
  const nodeABounds = {
    left: rect.x,
    right: rect.x + rect.width,
    top: rect.y,
    bottom: rect.y + rect.height,
    width: rect.width,
    height: rect.height,
  }

  let horizontalDistance = distance
  let verticalDistance = distance

  return nodes.reduce<GetHelperLinesResult>((result, nodeB) => {
    if (!nodeB.positionAbsolute) return result
    const nodeBBounds = {
      left: nodeB.positionAbsolute.x,
      right: nodeB.positionAbsolute.x + (nodeB.width ?? 0),
      top: nodeB.positionAbsolute.y,
      bottom: nodeB.positionAbsolute.y + (nodeB.height ?? 0),
      width: nodeB.width ?? 0,
      height: nodeB.height ?? 0,
    }

    //  |‾‾‾‾‾‾‾‾‾‾‾|
    //  |     A     |
    //  |___________|
    //  |
    //  |
    //  |‾‾‾‾‾‾‾‾‾‾‾|
    //  |     B     |
    //  |___________|
    const distanceLeftLeft = Math.abs(nodeABounds.left - nodeBBounds.left)

    if (distanceLeftLeft < verticalDistance) {
      result.snapPosition.x = nodeBBounds.left
      result.vertical = nodeBBounds.left
      verticalDistance = distanceLeftLeft
    }

    //  |‾‾‾‾‾‾‾‾‾‾‾|
    //  |     A     |
    //  |___________|
    //              |
    //              |
    //  |‾‾‾‾‾‾‾‾‾‾‾|
    //  |     B     |
    //  |___________|
    const distanceRightRight = Math.abs(nodeABounds.right - nodeBBounds.right)

    if (distanceRightRight < verticalDistance) {
      result.snapPosition.x = nodeBBounds.right - nodeABounds.width
      result.vertical = nodeBBounds.right
      verticalDistance = distanceRightRight
    }

    //              |‾‾‾‾‾‾‾‾‾‾‾|
    //              |     A     |
    //              |___________|
    //              |
    //              |
    //  |‾‾‾‾‾‾‾‾‾‾‾|
    //  |     B     |
    //  |___________|
    const distanceLeftRight = Math.abs(nodeABounds.left - nodeBBounds.right)

    if (distanceLeftRight < verticalDistance) {
      result.snapPosition.x = nodeBBounds.right
      result.vertical = nodeBBounds.right
      verticalDistance = distanceLeftRight
    }

    //  |‾‾‾‾‾‾‾‾‾‾‾|
    //  |     A     |
    //  |___________|
    //              |
    //              |
    //              |‾‾‾‾‾‾‾‾‾‾‾|
    //              |     B     |
    //              |___________|
    const distanceRightLeft = Math.abs(nodeABounds.right - nodeBBounds.left)

    if (distanceRightLeft < verticalDistance) {
      result.snapPosition.x = nodeBBounds.left - nodeABounds.width
      result.vertical = nodeBBounds.left
      verticalDistance = distanceRightLeft
    }

    //  |‾‾‾‾‾‾‾‾‾‾‾|‾‾‾‾‾|‾‾‾‾‾‾‾‾‾‾‾|
    //  |     A     |     |     B     |
    //  |___________|     |___________|
    const distanceTopTop = Math.abs(nodeABounds.top - nodeBBounds.top)

    if (distanceTopTop < horizontalDistance) {
      result.snapPosition.y = nodeBBounds.top
      result.horizontal = nodeBBounds.top
      horizontalDistance = distanceTopTop
    }

    //  |‾‾‾‾‾‾‾‾‾‾‾|
    //  |     A     |
    //  |___________|_________________
    //                    |           |
    //                    |     B     |
    //                    |___________|
    const distanceBottomTop = Math.abs(nodeABounds.bottom - nodeBBounds.top)

    if (distanceBottomTop < horizontalDistance) {
      result.snapPosition.y = nodeBBounds.top - nodeABounds.height
      result.horizontal = nodeBBounds.top
      horizontalDistance = distanceBottomTop
    }

    //  |‾‾‾‾‾‾‾‾‾‾‾|     |‾‾‾‾‾‾‾‾‾‾‾|
    //  |     A     |     |     B     |
    //  |___________|_____|___________|
    const distanceBottomBottom = Math.abs(nodeABounds.bottom - nodeBBounds.bottom)

    if (distanceBottomBottom < horizontalDistance) {
      result.snapPosition.y = nodeBBounds.bottom - nodeABounds.height
      result.horizontal = nodeBBounds.bottom
      horizontalDistance = distanceBottomBottom
    }

    //                    |‾‾‾‾‾‾‾‾‾‾‾|
    //                    |     B     |
    //                    |           |
    //  |‾‾‾‾‾‾‾‾‾‾‾|‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
    //  |     A     |
    //  |___________|
    const distanceTopBottom = Math.abs(nodeABounds.top - nodeBBounds.bottom)

    if (distanceTopBottom < horizontalDistance) {
      result.snapPosition.y = nodeBBounds.bottom
      result.horizontal = nodeBBounds.bottom
      horizontalDistance = distanceTopBottom
    }

    return result
  }, defaultResult)
}

// 布局分组中的辅助线
export function getLayoutHelperLines(
  rect: Rect,
  nodes: Node<NodeData>[],
  groupRect: TempRect,
  layout: LayoutEnum
): GetHelperLinesResult {
  const res: GetHelperLinesResult = {
    snapPosition: { x: undefined, y: undefined },
    start: undefined,
    end: undefined,
  }
  if (nodes.length === 0) return res
  const bounds = nodes.map((n) => {
    const { positionAbsolute = { x: 0, y: 0 }, width, height } = n
    return {
      left: positionAbsolute.x,
      right: positionAbsolute.x + (width ?? 0),
      top: positionAbsolute.y,
      bottom: positionAbsolute.y + (height ?? 0),
      snum: n.data.snum || 0,
    }
  })
  const boundSize = bounds.length
  // 排序
  const sortBounds = bounds.sort((a, b) => a.snum - b.snum)
  const gap = NODE_GAP / 2
  let line = 0
  // 竖直方向对齐
  if (isVerticalAlign(layout)) {
    // 在第一个之前
    if (rect.y <= sortBounds[0].bottom) {
      line = sortBounds[0].top - GROUP_PADDING / 2
      if (rect.y <= sortBounds[0].top) {
        res.snapPosition.y = line
      }
    }
    // 在最后一个之后
    else if (rect.y > sortBounds[boundSize - 1].bottom) {
      res.snapPosition.y = line = sortBounds[boundSize - 1].bottom + GROUP_PADDING / 2
    }
    // 在中间
    else {
      for (let i = 1; i < boundSize; i++) {
        if (rect.y <= sortBounds[i].bottom) {
          line = sortBounds[i - 1].bottom + gap
          if (rect.y <= line + gap) {
            res.snapPosition.y = line
          }
          break
        }
      }
    }
    res.start = { x: groupRect.x + GROUP_PADDING / 2, y: line }
    res.end = { x: groupRect.x + groupRect.width - GROUP_PADDING / 2, y: line }
  } else {
    // 在第一个之前
    if (rect.x <= sortBounds[0].right) {
      line = sortBounds[0].left - GROUP_PADDING / 2
      if (rect.x <= sortBounds[0].left) {
        res.snapPosition.x = line
      }
    }
    // 在最后一个之后
    else if (rect.x > sortBounds[boundSize - 1].right) {
      res.snapPosition.x = line = sortBounds[boundSize - 1].right + GROUP_PADDING / 2
    }
    // 在中间
    else {
      for (let i = 1; i < boundSize; i++) {
        if (rect.x <= sortBounds[i].right) {
          line = sortBounds[i - 1].right + gap
          if (rect.x <= line + gap) {
            res.snapPosition.x = line
          }
          break
        }
      }
    }
    res.start = { x: line, y: groupRect.y + GROUP_PADDING / 2 }
    res.end = { x: line, y: groupRect.y + groupRect.height - GROUP_PADDING / 2 }
  }
  return res
}
