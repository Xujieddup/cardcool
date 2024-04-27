import { devWarn } from "../utils"
import { ConnectionMode } from "../types"
import type { CoordinateExtent, ReactFlowStore } from "../types"

export const infiniteExtent: CoordinateExtent = [
  [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
  [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
]

const initialState: ReactFlowStore = {
  rfId: "1",
  width: 0,
  height: 0,
  transform: [0, 0, 1],
  nodeInternals: new Map(),
  edges: [],
  onNodesChange: null,
  onEdgesChange: null,
  hasDefaultNodes: false,
  hasDefaultEdges: false,
  d3Zoom: null,
  d3Selection: null,
  d3ZoomHandler: undefined,
  minZoom: 0.5,
  maxZoom: 2,
  translateExtent: infiniteExtent,
  nodeExtent: infiniteExtent,
  // 点击白板空白处拖拽框选后松开鼠标，如果框选节点数 > 0 为 true，为 true 会展示选框 <NodesSelection/>
  nodesSelectionActive: false,
  // 点击白板空白处开始拖拽框选(有位移)后为 true
  userSelectionActive: false,
  userSelectionRect: null,
  connectionNodeId: null,
  connectionHandleId: null,
  connectionHandleType: "source",
  connectionPosition: { x: 0, y: 0 },
  connectionStatus: null,
  connectionMode: ConnectionMode.Strict,
  domNode: null,
  paneDragging: false,
  noPanClassName: "nopan",
  nodeOrigin: [0, 0],
  nodeDragThreshold: 0,
  // 对齐的网关尺寸
  snapGrid: [15, 15],
  // 对齐到网格
  snapToGrid: false,
  // 节点默认是否可拖拽
  nodesDraggable: true,
  // 节点默认是否可连线
  nodesConnectable: true,
  // 节点默认是否可聚焦(Tab 键聚焦，Enter 选择)
  nodesFocusable: true,
  // 边默认是否可聚焦
  edgesFocusable: true,
  // 边默认是否可更新？
  edgesUpdatable: true,
  // 节点和边默认是否可选中
  elementsSelectable: true,
  // 节点选中之后 zIndex 是否提升
  elevateNodesOnSelect: true,
  fitViewOnInit: false,
  fitViewOnInitDone: false,
  fitViewOnInitOptions: undefined,

  multiSelectionActive: false,

  connectionStartHandle: null,
  connectionEndHandle: null,
  connectionClickStartHandle: null,
  connectOnClick: true,

  ariaLiveMessage: "",
  // 连线拖动到窗口边缘时是否自动平移
  autoPanOnConnect: true,
  // 节点拖动到窗口边缘时是否自动平移
  autoPanOnNodeDrag: true,
  connectionRadius: 20,
  onError: devWarn,
  isValidConnection: undefined,
}

export default initialState
