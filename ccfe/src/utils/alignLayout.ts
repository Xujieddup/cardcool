import { getRectOfNodes, type Node, type XYPosition } from "@/reactflow/core"
import { LayoutEnum } from "@/enums"
import { nodeToRect } from "./rf"
import { GROUP_PADDING, NODE_GAP } from "@/constant"
import { NodeData } from "@/types"

// 竖直对齐
export const isVerticalAlign = (alignType: LayoutEnum) =>
  alignType === LayoutEnum.ALIGNL ||
  alignType === LayoutEnum.ALIGNCV ||
  alignType === LayoutEnum.ALIGNR

export const resetLayout = (
  nodes: Node<NodeData>[],
  alignType: LayoutEnum
): [number, number, Node<NodeData>[]] => {
  // 节点最大宽高
  let maxWidth = 0
  let maxHeight = 0
  const verticalAlign = isVerticalAlign(alignType)
  // 将节点转换为 rect
  const rects = nodes.map((node) => {
    const w = node.width || 0
    const h = node.height || 0
    if (verticalAlign) {
      if (w > maxWidth) maxWidth = w
    } else {
      if (h > maxHeight) maxHeight = h
    }
    return { id: node.id, width: w, height: h, snum: node.data.snum || 0 }
  })
  // 排序
  const sortedRects = rects.sort((a, b) => a.snum - b.snum)
  let width = 0
  let height = 0
  const nodeMap = new Map<string, XYPosition>()
  sortedRects.forEach((rect) => {
    let tmpPos = { x: 0, y: 0 }
    switch (alignType) {
      case LayoutEnum.ALIGNL:
        tmpPos = { x: 0, y: height }
        height += rect.height + NODE_GAP
        break
      case LayoutEnum.ALIGNCV:
        tmpPos = { x: (maxWidth - rect.width) / 2, y: height }
        height += rect.height + NODE_GAP
        break
      case LayoutEnum.ALIGNR:
        tmpPos = { x: maxWidth - rect.width, y: height }
        height += rect.height + NODE_GAP
        break
      case LayoutEnum.ALIGNT:
        tmpPos = { x: width, y: 0 }
        width += rect.width + NODE_GAP
        break
      case LayoutEnum.ALIGNCH:
        tmpPos = { x: width, y: (maxHeight - rect.height) / 2 }
        width += rect.width + NODE_GAP
        break
      case LayoutEnum.ALIGNB:
        tmpPos = { x: width, y: maxHeight - rect.height }
        width += rect.width + NODE_GAP
        break
    }
    nodeMap.set(rect.id, { x: tmpPos.x + GROUP_PADDING, y: tmpPos.y + GROUP_PADDING })
  })
  if (verticalAlign) {
    width = maxWidth
    height -= NODE_GAP
  } else {
    width -= NODE_GAP
    height = maxHeight
  }
  // 遍历更新节点
  const newNodes = nodes.map((node) => ({
    ...node,
    position: nodeMap.get(node.id) || node.position,
  }))
  return [width + GROUP_PADDING * 2, height + GROUP_PADDING * 2, newNodes]
}

type TmpPos = XYPosition & { snum: number }
export const resetAlign = (nodes: Node[], alignType: LayoutEnum): Map<string, TmpPos> => {
  // 节点最大宽高
  let maxWidth = 0
  let maxHeight = 0
  const posMap = new Map<string, TmpPos>()
  // 左上角坐标
  const pos = { ...(nodes[0].positionAbsolute || { x: 0, y: 0 }) }
  const verticalAlign = isVerticalAlign(alignType)
  // 将节点转换为 rect
  const rects = nodes.map((node) => {
    const rect = nodeToRect(node)
    if (verticalAlign) {
      if (rect.width > maxWidth) maxWidth = rect.width
    } else {
      if (rect.height > maxHeight) maxHeight = rect.height
    }
    if (rect.x < pos.x) pos.x = rect.x
    if (rect.y < pos.y) pos.y = rect.y
    return { ...rect, id: node.id }
  })
  // 排序
  const sortRects = rects.sort((a, b) => (verticalAlign ? a.y - b.y : a.x - b.x))
  let width = 0
  let height = 0
  sortRects.forEach((rect, index) => {
    let tmpPos = { x: 0, y: 0 }
    switch (alignType) {
      case LayoutEnum.ALIGNL:
        tmpPos = { x: 0, y: height }
        height += rect.height + NODE_GAP
        break
      case LayoutEnum.ALIGNCV:
        tmpPos = { x: (maxWidth - rect.width) / 2, y: height }
        height += rect.height + NODE_GAP
        break
      case LayoutEnum.ALIGNR:
        tmpPos = { x: maxWidth - rect.width, y: height }
        height += rect.height + NODE_GAP
        break
      case LayoutEnum.ALIGNT:
        tmpPos = { x: width, y: 0 }
        width += rect.width + NODE_GAP
        break
      case LayoutEnum.ALIGNCH:
        tmpPos = { x: width, y: (maxHeight - rect.height) / 2 }
        width += rect.width + NODE_GAP
        break
      case LayoutEnum.ALIGNB:
        tmpPos = { x: width, y: maxHeight - rect.height }
        width += rect.width + NODE_GAP
        break
    }
    posMap.set(rect.id, { x: pos.x + tmpPos.x, y: pos.y + tmpPos.y, snum: (index + 1) * 10000 })
  })
  return posMap
}

// 计算当前选中节点在布局分组中的位置
export const calcLayoutSort = (
  groupNodes: Node<NodeData>[],
  currNodes: Node<NodeData>[],
  layout: LayoutEnum
) => {
  // 计算节点总区域
  const { x, y } = getRectOfNodes(currNodes)
  if (currNodes.length > 1) {
    currNodes.sort((a, b) => (a.data.snum || 0) - (b.data.snum || 0))
  }
  const sortNodeIds = currNodes.map((n) => n.id)
  return calcLayoutSnum(groupNodes, { x, y }, sortNodeIds, layout)
}

// 计算当前选中节点在布局分组中的位置
export const calcLayoutSnum = (
  groupNodes: Node<NodeData>[],
  rectPos: XYPosition,
  sortNodeIds: string[],
  layout: LayoutEnum
) => {
  // 节点和 snum 的映射
  const snumMap: Map<string, number> = new Map()
  const currNodeCnt = sortNodeIds.length
  // 分组内没有子节点，直接返回
  if (groupNodes.length === 0) {
    sortNodeIds.forEach((id, i) => snumMap.set(id, (i + 1) * 10000))
    return snumMap
  }
  // 处理分组内节点信息并排序
  const bounds = groupNodes.map((n) => {
    const { positionAbsolute = { x: 0, y: 0 }, width, height } = n
    return {
      left: positionAbsolute.x,
      right: positionAbsolute.x + (width ?? 0),
      top: positionAbsolute.y,
      bottom: positionAbsolute.y + (height ?? 0),
      snum: n.data.snum || 0,
      id: n.id,
    }
  })
  const sortBounds = bounds.sort((a, b) => a.snum - b.snum)
  // 计算拖拽节点的目标位置
  const verticalAlign = isVerticalAlign(layout)
  const isFirstNode = verticalAlign
    ? rectPos.y <= sortBounds[0].bottom
    : rectPos.x <= sortBounds[0].right
  const isLastNode = verticalAlign
    ? rectPos.y > sortBounds[sortBounds.length - 1].bottom
    : rectPos.x > sortBounds[sortBounds.length - 1].right
  if (isFirstNode) {
    // 移动到第一个位置，则判断第二个位置的节点的 snum 是否大于 0
    const step = Math.floor((sortBounds[0].snum - 1) / currNodeCnt)
    if (step > 0) {
      // 只需更新当前节点的 snum
      sortNodeIds.forEach((id, i) => snumMap.set(id, (i + 1) * step))
    } else {
      // 当前节点的 snum 置为 10000，后面的节点依次叠加 10000
      sortNodeIds.forEach((id, i) => snumMap.set(id, (i + 1) * 10000))
      sortBounds.forEach((i, index) => {
        snumMap.set(i.id, (index + currNodeCnt + 1) * 10000)
      })
    }
  } else if (isLastNode) {
    // 移动到最后一个位置，则在前一个位置的节点的 snum + 10000
    const lastSnum = sortBounds[sortBounds.length - 1].snum
    sortNodeIds.forEach((id, i) => snumMap.set(id, lastSnum + (i + 1) * 10000))
  } else {
    for (let i = 1; i < sortBounds.length; i++) {
      const isHit = verticalAlign
        ? rectPos.y <= sortBounds[i].bottom
        : rectPos.x <= sortBounds[i].right
      if (isHit) {
        const lastSnum = sortBounds[i - 1].snum
        // 移动到中间位置，则计算前后位置节点的 snum 的差值
        const step = Math.floor((sortBounds[i].snum - lastSnum - 1) / currNodeCnt)
        if (step > 0) {
          // 只需更新当前节点的 snum
          sortNodeIds.forEach((id, i) => snumMap.set(id, lastSnum + (i + 1) * step))
        } else {
          // 后面的节点依次叠加 10000
          sortNodeIds.forEach((id, i) => snumMap.set(id, lastSnum + (i + 1) * 10000))
          const newSnum = lastSnum + currNodeCnt * 10000
          sortBounds.forEach((i, index) => {
            snumMap.set(i.id, newSnum + (index + 1) * 10000)
          })
        }
        break
      }
    }
  }
  return snumMap
}
