import type { Node } from "@/reactflow/core"
import { stratify } from "d3-hierarchy"
import Hierarchy from "@antv/hierarchy"
import { GROUP_PADDING } from "@/constant"

type RectPos = { x: number; y: number; x2: number; y2: number }

export const resetMindGroup = (nodes: Node[]): [Node[], number, number] => {
  // 将数据转换为树形结构
  const tree = stratify()
    .id((d: any) => d.id)
    .parentId((d: any) => (d.data.pid === "root" ? "" : d.data.pid))(nodes)
  // 计算布局
  const layoutNodes = Hierarchy.compactBox(tree, {
    direction: "LR", // 从左到右布局
    getHeight(d: any) {
      return d.data.height || 38
    },
    // 可以细粒度处理节点宽度
    getWidth(d: any) {
      return d.data.width || 122
    },
    getHGap() {
      return 32
    },
    getVGap() {
      return 8
    },
  })
  // 计算整个导图的左上角坐标和右下角坐标
  const rectPos = {
    x: layoutNodes.x,
    y: layoutNodes.y,
    x2: layoutNodes.x + layoutNodes.width,
    y2: layoutNodes.y + layoutNodes.height,
  }
  calcRectPos(layoutNodes, rectPos)
  // LR 结构时，以第一个节点的中心为(0,0)，节点左侧空白为 32*2，上侧空白为 8*2
  // console.log("mindLayout", layoutNodes, rectPos)
  // 遍历树结构，得到节点数组
  const ns: Node[] = []
  // 向右偏移 32px，向下偏移 8px，则正好居中，再向下偏移 24px，整个高度增加 24*2px，则四周空隙都是 32px
  // parseTreeToArray(layoutNodes, ns, rectPos.x - 32, rectPos.y - 8 - 24)
  // return [ns, rectPos.x2 - rectPos.x, rectPos.y2 - rectPos.y]
  parseTreeToArray(layoutNodes, ns, rectPos.x - GROUP_PADDING, rectPos.y - GROUP_PADDING)
  // console.log("rectPos", rectPos, ns)
  return [
    ns,
    rectPos.x2 - rectPos.x - (32 - GROUP_PADDING) * 2,
    rectPos.y2 - rectPos.y + (GROUP_PADDING - 8) * 2,
  ]
}

// 计算整个导图的左上角坐标和右下角坐标
const calcRectPos = (tree: any, rectPos: RectPos) => {
  rectPos.x = Math.min(rectPos.x, tree.x)
  rectPos.y = Math.min(rectPos.y, tree.y)
  rectPos.x2 = Math.max(rectPos.x2, tree.x + tree.width)
  rectPos.y2 = Math.max(rectPos.y2, tree.y + tree.height)
  if (tree.children && tree.children.length > 0) {
    tree.children.forEach((t: any) => calcRectPos(t, rectPos))
  }
}

const parseTreeToArray = (tree: any, nodes: Node[], offsetX: number, offsetY: number) => {
  nodes.push({ ...tree.data.data, position: { x: tree.x - offsetX, y: tree.y - offsetY } })
  if (tree.children && tree.children.length > 0) {
    tree.children.forEach((t: any) => {
      parseTreeToArray(t, nodes, offsetX, offsetY)
    })
  }
}
