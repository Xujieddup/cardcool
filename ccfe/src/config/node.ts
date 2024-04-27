import {
  NODE_BG,
  NODE_STYLE_FOLD,
  NODE_STYLE_FULL,
  NODE_WIDTH,
  TEMP_MIND_DRAG_EDGE,
  TEMP_MIND_DRAG_NODE,
  THEME_COLOR,
} from "@/constant"
import type { EdgeData, NodeData, VNContent } from "@/types"
import type { Node, Edge } from "@/reactflow"
import { NodeTypeEnum, VNTypeEnum } from "@/enums"

export const initNode: { [key: string]: VNContent } = {
  igroup: {
    position: undefined,
    width: undefined,
    autoWidth: true,
    height: undefined,
    styleId: undefined,
    bgColor: NODE_BG,
    snum: undefined,
    ext: undefined,
  },
  mgroup: {
    position: undefined,
    width: undefined,
    autoWidth: true,
    height: undefined,
    styleId: undefined,
    bgColor: NODE_BG,
    snum: undefined,
    ext: undefined,
  },
  // 导图根节点，本质上是 text 节点，只在拖拽创建导图时有用
  mind: {
    position: undefined,
    width: NODE_WIDTH,
    autoWidth: true,
    height: undefined,
    styleId: NODE_STYLE_FOLD,
    bgColor: undefined,
    snum: 0,
    ext: undefined,
  },
  shape: {
    position: undefined,
    width: 100,
    autoWidth: false,
    height: 100,
    styleId: NODE_STYLE_FOLD,
    bgColor: undefined,
    snum: 0,
    ext: undefined,
  },
  card: {
    position: undefined,
    width: NODE_WIDTH,
    autoWidth: false,
    height: undefined,
    styleId: NODE_STYLE_FULL,
    bgColor: NODE_BG,
    snum: undefined,
    ext: undefined,
  },
  text: {
    position: undefined,
    width: NODE_WIDTH,
    autoWidth: false,
    height: undefined,
    styleId: NODE_STYLE_FULL,
    bgColor: NODE_BG,
    snum: undefined,
    ext: undefined,
  },
}

// 临时导图拖拽节点
export const tmpMindDragNode: Node<NodeData> = {
  id: TEMP_MIND_DRAG_NODE,
  type: VNTypeEnum.TEXT,
  position: { x: 0, y: 0 },
  parentNode: undefined,
  deletable: false,
  selectable: false,
  zIndex: 1001,
  hidden: true,
  data: {
    nodeId: "",
    nodeType: NodeTypeEnum.TEXT,
    pid: "",
    width: NODE_WIDTH,
    autoWidth: true,
    height: undefined,
    styleId: NODE_STYLE_FOLD,
    bgColor: THEME_COLOR,
    snum: 0,
    ext: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"拖拽到新位置"}]}]}',
    cardInfo: undefined,
    viewInfo: undefined,
    forbidEdit: true,
  },
}
// 临时导图拖拽边
export const tmpMindDragEdge: Edge<EdgeData> = {
  id: TEMP_MIND_DRAG_EDGE,
  type: "mindEdge",
  source: "",
  target: TEMP_MIND_DRAG_NODE,
  sourceHandle: "sr",
  targetHandle: "sl",
  deletable: false,
  selected: false,
  zIndex: 1001,
  className: "tempmindedge",
}
