import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type {
  EdgeData,
  HelperLineData,
  MindNodeItem,
  NodeData,
  StyledToken,
  TempRect,
  VNParam,
} from "@/types"
import { CardFlowNode, TextFlowNode, ViewFlowNode, ShapeFlowNode, GroupFlowNode } from "./node"
import {
  calcNodeChange,
  edgeFactory,
  formatNodeObj,
  formatNodes,
  genMindEdge,
  getClosestNodeId,
  getDefaultNode,
  getFlowViewInfo,
  nodeFactory,
  getDeleteText,
  resetNodePos,
  resetNodes,
  calcGroupRects,
  calcIntersectGroup,
  isIGroupNode,
  viewConvText,
  cardConvText,
  getPositionOffset,
  checkResizedGroup,
  isMGroupNode,
  isMindRootNode,
  isGroupCate,
  mindEdgeId,
  calcGroupRect,
  getNodeRectPositions,
  isBaseCate,
  getRectPositions,
  calcLayoutSort,
  calcLayoutSnum,
  opacity,
} from "@/utils"
import { useConfigStore, useDBStore } from "@/store"
import type { GOp, GetConf, GetDBTypes } from "@/store"
import { shallow } from "zustand/shallow"
import styled from "@emotion/styled"
import { App, Typography, theme } from "antd"
import { FlowCtrl, HelperLine, Selection } from "./tools"
import type {
  DefaultEdgeOptions,
  EdgeMouseHandler,
  NodeDimensionChange,
  NodeDragHandler,
  NodeMouseHandler,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  OnSelectionChangeFunc,
  ReactFlowState,
  SelectionDragHandler,
  XYPosition,
  Node,
  OnConnectStart,
  OnConnectEnd,
  Edge,
} from "@/reactflow"
import {
  ReactFlow,
  SelectionMode,
  ConnectionMode,
  BezierEdge,
  useStore,
  getRectOfNodes,
  Panel,
} from "@/reactflow"
import { getHelperLines, getLayoutHelperLines, isInputDOMNode } from "./utils"
import { useRF } from "./hooks"
import {
  OpEnum,
  NodeTypeEnum,
  SpecialViewEnum,
  VNTypeEnum,
  ShapeTypeEnum,
  MindLayoutEnum,
} from "@/enums"
import { MIND_ROOT_PID, NODE_GAP, NODE_STYLE_FOLD, NODE_WIDTH, THEME_COLOR } from "@/constant"
import { CommonEdge } from "./edge"
import { ExclamationCircleFilled } from "@ant-design/icons"
import { gd } from "@/config"
import cc from "classcat"

const dbTypesSelector: GetDBTypes = (state) => [state.db, state.types]
const opSelector: GOp = (state) => [state.cardOp, state.viewOp]
const confSelector: GetConf = (state) => [state.viewConf]
// 1. 框选时或框选框存在时，强制隐藏操作栏；2. 节点数为 0 时展示提示文案
const rfSelector = (s: ReactFlowState) => [
  s.nodesSelectionActive || s.userSelectionActive,
  s.nodeInternals.size === 0,
]
const panOnDrag = [1, 2]

type FlowGraphProps = {
  spaceId: string
  viewId: string
}
// 临时缓存数据，不能直接重置，只能单项字段重置
type TempData = {
  // 完成第一次全局节点自适应居中
  firstFitedView?: boolean
  // 外部拖拽元素的唯一 id，每次拖拽新建节点都会更新 gd.dragId，所以不需要重置(考虑拖拽外部图片时应该怎么处理？)
  dragId?: number
  // 白板元素区域，
  flowBoxRect?: DOMRect
  // 缓存白板中所有可以与当前拖拽节点相交的分组节点信息(避免重复计算)
  groupRects?: TempRect[]
}
// 拖拽相交的导图信息
type IntersectGroup = {
  // 与拖拽单节点相交的分组 ID，需要重置为 null
  intersectGroupId?: string | null
  // 导图分组中剩余节点(排除当前正在拖拽的节点及所有子节点)
  mindRemainNodes?: MindNodeItem[]
  // 拖拽的导图节点在同一层级中的顺序(从 0 开始)
  originIndex?: number
  // 当前的上级 id
  currPid?: string
  // 非导图分组和白板中剩余节点(排除当前正在拖拽的节点)
  remainNodes?: Node<NodeData>[]
}

const nodeTypes = {
  igroup: GroupFlowNode,
  mgroup: GroupFlowNode,
  card: CardFlowNode,
  view: ViewFlowNode,
  text: TextFlowNode,
  shape: ShapeFlowNode,
}
const edgeTypes = {
  default: CommonEdge,
  mindEdge: BezierEdge,
}

const fitViewOptions = { maxZoom: 1 }
const defaultEdgeOptions: DefaultEdgeOptions = { style: { strokeWidth: 1.5 } }
const calcHelperLine = (oldHL: HelperLineData, newHL: HelperLineData) =>
  oldHL.horizontal !== newHL.horizontal ||
  oldHL.vertical !== newHL.vertical ||
  oldHL.startX !== newHL.startX ||
  oldHL.startY !== newHL.startY ||
  oldHL.endX !== newHL.endX ||
  oldHL.endY !== newHL.endY
    ? newHL
    : oldHL

export const RFView: React.FC<FlowGraphProps> = ({ spaceId, viewId }) => {
  const [db, types] = useDBStore(dbTypesSelector, shallow)
  const typeMap = useMemo(() => new Map(types.map((t) => [t.id, t])), [types])
  const rfIns = useRF<NodeData, EdgeData>()
  const flowWrapper = useRef<HTMLDivElement | null>(null)
  const [hideHandler, showBoardTip] = useStore(rfSelector, shallow)
  // 拖拽时相交的节点
  const tempRef = useRef<TempData>({})
  const intersectGroupRef = useRef<IntersectGroup>({ intersectGroupId: null })
  const dragOverPosRef = useRef({ x: 0, y: 0 })
  const [helperLine, setHelperLine] = useState<HelperLineData>({})
  const { token } = theme.useToken()
  const { modal } = App.useApp()
  // 初始化视图节点和关系
  useEffect(() => {
    if (db) {
      getFlowViewInfo(db, spaceId, viewId, typeMap).then(([nodes, edges]) => {
        // console.log("ReactFlow: getFlowViewInfo", nodes, edges)
        rfIns.setOriginNodes(nodes)
        rfIns.setOriginEdges(edges)
        tempRef.current.firstFitedView = nodes.length === 0
      })
    }
  }, [db, rfIns, spaceId, typeMap, viewId])
  // 监听卡片操作状态
  const [cardOp, viewOp] = useDBStore(opSelector, shallow)
  const [viewConf] = useConfigStore(confSelector, shallow)
  useEffect(() => {
    console.log("FlowView - ListenOp", cardOp, viewOp)
    if (cardOp !== undefined) {
      db?.card.getCard(cardOp.id).then((card) => {
        if (card) {
          let hasChange = false
          const newNodes = rfIns.getNodes().map((n) => {
            if (n.data.nodeId === card.id) {
              hasChange = true
              // 更新卡片节点
              if (cardOp.op === OpEnum.UPDATE) {
                const cardInfo = formatNodeObj(card, typeMap.get(card.type_id))
                return { ...n, data: { ...n.data, cardInfo } }
                // 删除卡片: 将卡片节点转换为文本节点
              } else if (cardOp.op === OpEnum.DELETE) {
                return cardConvText(n, card.name)
              }
            }
            return n
          })
          hasChange && rfIns.setNodes(newNodes)
        }
      })
    }
    if (viewOp !== undefined) {
      db?.view.getMapByIds(viewOp.ids).then((viewMap) => {
        let hasChange = false
        const newNodes = rfIns.getNodes().map((n) => {
          const viewInfo = n.data.nodeId ? viewMap.get(n.data.nodeId) : undefined
          if (viewInfo) {
            hasChange = true
            // 更新视图节点
            if (viewOp.op === OpEnum.UPDATE) {
              return { ...n, data: { ...n.data, viewInfo } }
              // 删除视图: 将视图节点转换为文本节点
            } else if (viewOp.op === OpEnum.DELETE) {
              return viewConvText(n, viewInfo.name)
            }
          }
          return n
        })
        hasChange && rfIns.setOriginNodes(newNodes)
      })
    }
  }, [db, rfIns, typeMap, cardOp, viewOp])
  // KeyboardDown 事件监听
  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      const modifierKeyDown = event.ctrlKey || event.metaKey || event.shiftKey
      // 文本输入时，且没有按下 Ctro/Meta/Shift 等键时，直接返回 !modifierKeyDown
      if (modifierKeyDown || isInputDOMNode(event) || viewId === "views") {
        // console.log("ReactFlow: KeyboardEvent cancel", event, isInputDOMNode(event))
        return
      }
      console.log("ReactFlow: KeyboardEvent", event, isInputDOMNode(event))
      // 思维导图节点 - Tab - 创建子节点 & 创建关联
      if (event.code === "Tab" || event.code === "Enter") {
        event.preventDefault()
        // 只有一个节点才会生效
        const nodeArr = rfIns.getOriginNodes()
        const selectNodes = nodeArr.filter((n) => n.selected)
        if (selectNodes.length !== 1) return
        const node = selectNodes[0]
        // 是否是思维导图节点
        const aMindNode = !!node.parentNode && !!node.data.pid
        // 节点所属分组 ID
        const groupId = node.parentNode || ""
        // 非思维导图节点，需要设置 position
        const posotion = aMindNode
          ? undefined
          : event.code === "Enter"
          ? { x: node.position.x, y: node.position.y + (node.height || 38) + NODE_GAP }
          : { x: node.position.x + (node.width || NODE_WIDTH) + NODE_GAP, y: node.position.y }
        const defaultNode = getDefaultNode(aMindNode ? VNTypeEnum.MIND : VNTypeEnum.TEXT, posotion)
        let pid = ""
        if (aMindNode) {
          // 思维导图根节点不能触发 Enter 事件
          if (event.code === "Enter" && isMindRootNode(node.data.pid)) return
          pid = event.key === "Tab" ? node.id : node.data.pid || ""
          if (event.key === "Tab") {
            const snum =
              nodeArr.findLast((n) => n.parentNode === groupId && n.data.pid === node.id)?.data
                .snum || 0
            defaultNode.snum = snum + 10000
          } else {
            const currNodeSnum = node.data.snum || 0
            const nextNodeSnum =
              nodeArr.find(
                (n) =>
                  n.parentNode === groupId &&
                  n.data.pid === node.data.pid &&
                  n.data.snum &&
                  n.data.snum > currNodeSnum
              )?.data.snum || 0
            defaultNode.snum =
              nextNodeSnum > 0
                ? Math.floor((currNodeSnum + nextNodeSnum) / 2)
                : currNodeSnum + 10000
          }
        }
        const content = JSON.stringify(defaultNode)
        db?.viewnode
          .addNode(viewId, groupId, pid, "", NodeTypeEnum.TEXT, VNTypeEnum.TEXT, content)
          .then((vn) => {
            const nodeInfo = nodeFactory(vn, undefined, undefined, aMindNode)
            // 原来选中的节点取消选择
            const nodeArr2 = nodeArr.map((n) =>
              n.id === node.id ? { ...node, selected: false } : n
            )
            // 默认选中新建的节点且进入编辑状态
            nodeArr2.push({
              ...nodeInfo,
              selected: true,
              data: { ...nodeInfo.data, etime: Date.now() },
            })
            rfIns.setOriginNodes(nodeArr2)
            // 生成思维导图的节点关联 edge
            if (aMindNode) {
              const edgeInfo = genMindEdge(nodeInfo)
              rfIns.setEdges((edges) => [...edges, edgeInfo])
            }
          })
      } else if (event.code === "Space") {
        // 按空格键聚焦当前选中节点
        event.preventDefault()
        rfIns.fitSelectNodes()
      } else if (event.code === "Backspace") {
        // reactflow 默认的删除逻辑会自动删除关联边，因此需要自定义删除逻辑
        event.preventDefault()
        const nodes = rfIns.getOriginNodes()
        const selectNodes = nodes.filter((n) => n.selected && n.deletable !== false)
        const tipText = getDeleteText(nodes, selectNodes)
        if (tipText) {
          modal.confirm({
            title: "确认删除",
            icon: <ExclamationCircleFilled />,
            content: tipText,
            okText: "确认",
            okType: "danger",
            cancelText: "取消",
            onOk: () => rfIns.deleteNodes(db),
          })
        } else {
          rfIns.deleteNodes(db)
        }
      }
    }
    document.addEventListener("keydown", keyDownHandler)
    return () => {
      document.removeEventListener("keydown", keyDownHandler)
    }
  }, [db, modal, rfIns, viewId])
  // 节点拖拽到白板中，缓存白板中的所有分组节点信息，避免重复计算
  const onDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      // console.log("ReactFlow: onDragLeave", event)
      event.preventDefault()

      if (!tempRef.current.flowBoxRect || !intersectGroupRef.current.intersectGroupId) return
      const { left, right, top, bottom } = tempRef.current.flowBoxRect
      const { clientX, clientY, relatedTarget } = event
      // 越过边界，或拖拽到某些特殊区域
      const checkEdge = clientX <= left || clientX >= right || clientY <= top || clientY >= bottom
      // console.log("onDragLeave", (relatedTarget as HTMLElement).getAttribute("class"))
      if (
        checkEdge ||
        (relatedTarget as HTMLElement).getAttribute("class")?.includes("dodragleave")
      ) {
        rfIns.setNodes((ns) =>
          ns.map((n) => {
            if (n.id === intersectGroupRef.current.intersectGroupId) {
              if (isMGroupNode(n.type)) {
                rfIns.updateConnectionLine()
              } else if (n.data.layout) {
                setHelperLine({})
              }
              return { ...n, className: undefined }
            } else {
              return n
            }
          })
        )
        intersectGroupRef.current.intersectGroupId = null
      }
    },
    [rfIns]
  )
  // 节点拖拽到白板中
  const handleDragOver = useCallback(
    (clientX: number, clientY: number) => {
      console.log("ReactFlow: handleDragOver", clientX, clientY, tempRef.current.flowBoxRect)
      const drapParam = gd.getDropParam()
      // 只有拖拽新建图形、导图、卡片，才会触发 onDragOver，从浏览器外拖拽进来的图片文件不触发 onDragOver
      if (!drapParam.id) return
      // 初始化缓存数据
      if (drapParam.id !== tempRef.current.dragId) {
        if (!flowWrapper.current) return
        // 获取元素左，上，右和下分别相对浏览器视窗的距离(0, 46, width, height + 46)
        tempRef.current.dragId = drapParam.id
        tempRef.current.flowBoxRect = flowWrapper.current.getBoundingClientRect()
        tempRef.current.groupRects = calcGroupRects(rfIns.getOriginNodes())
      }
      if (!tempRef.current.flowBoxRect) return

      const { offsetX, offsetY, width, height } = drapParam
      const position = rfIns.project({
        x: clientX - tempRef.current.flowBoxRect.left - offsetX,
        y: clientY - tempRef.current.flowBoxRect.top - offsetY,
      })
      let ns = rfIns.getOriginNodes()
      // 拖拽时与分组相交，则分组节点背景色加深
      const intersectGroup = calcIntersectGroup(position, tempRef.current.groupRects)
      // 与导图分组相交
      const intersectMindGroup = intersectGroup && isMGroupNode(intersectGroup.type)
      const intersectGroupId = intersectGroup?.id
      const changeIntersectId = intersectGroupRef.current.intersectGroupId !== intersectGroupId
      if (changeIntersectId) {
        ns = ns.map((n) =>
          n.id === intersectGroupId
            ? { ...n, className: "intersect" }
            : n.className
            ? { ...n, className: undefined }
            : n
        )
        const remainNodes = ns.filter((n) => n.parentNode === intersectGroupId)
        // 与导图分组相交，则计算并缓存导图中所有子节点的参数
        if (intersectMindGroup) {
          const [mindRemainNodes, originIndex] = formatNodes(remainNodes)
          intersectGroupRef.current = { intersectGroupId, mindRemainNodes, originIndex }
          // 清除辅助线
          setHelperLine((oldLine) => calcHelperLine(oldLine, {}))
        }
        // 与非导图分组或白板相交，缓存剩余用于计算辅助线的节点
        else {
          intersectGroupRef.current = { intersectGroupId, remainNodes }
          if (!intersectGroup?.layout) {
            // 清除辅助线
            setHelperLine((oldLine) => calcHelperLine(oldLine, {}))
          }
          // 清除导图关联线
          rfIns.updateConnectionLine()
        }
        rfIns.setOriginNodes(ns)
      }
      const rect = { ...position, width, height }
      // 与导图分组相交
      if (intersectMindGroup) {
        // 计算拖动节点的最近节点
        const [closestNodeId, sourceHandleId, nodePointer] = getClosestNodeId(
          intersectGroup,
          intersectGroupRef.current.mindRemainNodes || [],
          rect,
          MindLayoutEnum.LR
        )
        intersectGroupRef.current.currPid = closestNodeId
        // 动态更新关联边
        rfIns.updateConnectionLine(closestNodeId, sourceHandleId, nodePointer)
      }
      // 与布局分组相交，展示辅助线，与其他分组或白板相交，暂不展示辅助线
      else if (intersectGroup?.layout) {
        // 计算辅助线
        const helperLine = getLayoutHelperLines(
          rect,
          intersectGroupRef.current.remainNodes || [],
          intersectGroup,
          intersectGroup.layout
        )
        setHelperLine((oldLine) =>
          calcHelperLine(oldLine, {
            horizontal: helperLine.horizontal,
            vertical: helperLine.vertical,
            startX: helperLine.start?.x,
            startY: helperLine.start?.y,
            endX: helperLine.end?.x,
            endY: helperLine.end?.y,
          })
        )
      }
    },
    [rfIns]
  )
  // 节点拖拽到白板中
  const onDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      // console.log("ReactFlow: onDragOver", event.clientX, event.clientY)
      event.preventDefault()
      // 对比鼠标当前坐标，判断是否触发 handleDrag 事件
      const { clientX, clientY } = event
      if (dragOverPosRef.current.x !== clientX || dragOverPosRef.current.y !== clientY) {
        dragOverPosRef.current = { x: clientX, y: clientY }
        handleDragOver(clientX, clientY)
      }
    },
    [handleDragOver]
  )
  // 节点拖拽完成，扩展：直接拖拽图片、文字和网址到白板中，自动创建对应节点 TODO
  const onDropEnd = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      console.log("ReactFlow: onDropEnd", event)
      event.preventDefault()

      const drapParam = gd.getDropParam()
      // 拖拽新建图形、导图、卡片
      if (drapParam.id) {
        // TODO
      }
      // 从浏览器外拖拽进来的图片文件
      else {
        // TODO
      }
      const {
        intersectGroupId,
        mindRemainNodes = [],
        originIndex = -1,
        currPid = "",
        remainNodes = [],
      } = intersectGroupRef.current
      intersectGroupRef.current = { intersectGroupId: null }
      if (!db || !tempRef.current.flowBoxRect) return
      const { offsetX, offsetY, width, height } = drapParam
      const position = rfIns.project({
        x: event.clientX - tempRef.current.flowBoxRect.left - offsetX,
        y: event.clientY - tempRef.current.flowBoxRect.top - offsetY,
      })
      const vnType = event.dataTransfer.getData("vn_type") as VNTypeEnum
      const nodeType = parseInt(event.dataTransfer.getData("node_type")) as NodeTypeEnum
      const nodeId = event.dataTransfer.getData("node_id") || ""
      const shapeType = event.dataTransfer.getData("shape_type") || ""

      const defaultNode = getDefaultNode(vnType, position)
      const groupId = intersectGroupId || ""
      const group = groupId ? rfIns.getNode(groupId) : undefined
      // 取消相交分组的强调背景，以及取消选中当前选中的节点
      let ns = rfIns
        .getNodes()
        .map((n) =>
          n.id === intersectGroupId
            ? { ...n, className: undefined, selected: false }
            : n.selected
            ? { ...n, selected: false }
            : n
        )
      // 拖拽到思维导图中，可能触发同级节点的 snum 更新
      let nodeSnumMap = new Map<string, number>()
      let newMindEdge: Edge | undefined = undefined

      // 拖拽位置和分组相交，则定义为拖拽到指定分组内
      if (group && group.positionAbsolute) {
        // 拖拽到导图分组中
        if (isMGroupNode(group.type)) {
          // 单个一般节点(文本、卡片、视图)拖拽到导图中，自动折叠
          const autoFold = viewConf.mindAutoFold && isBaseCate(vnType)
          // 拖拽节点的四周坐标
          const rectPos = getRectPositions({ ...position, width, height })
          nodeSnumMap = calcNodeChange(
            rectPos,
            "",
            "",
            originIndex,
            currPid,
            mindRemainNodes,
            MindLayoutEnum.LR,
            false
          )
          defaultNode.snum = nodeSnumMap.get("") || 10000
          if (autoFold) {
            defaultNode.styleId = NODE_STYLE_FOLD
            defaultNode.autoWidth = true
          }
          nodeSnumMap.delete("")
          if (nodeSnumMap.size) {
            ns = ns.map((n) => {
              const snum = nodeSnumMap.get(n.id)
              return snum !== undefined
                ? { ...n, data: { ...n.data, pid: currPid, snum: snum } }
                : n
            })
          }
          // 清除临时的导图连接线
          rfIns.updateConnectionLine()
        }
        // 拖拽到布局分组中
        else if (group.data.layout) {
          // 计算节点所处位置
          nodeSnumMap = calcLayoutSnum(remainNodes, position, [""], group.data.layout)
          defaultNode.snum = nodeSnumMap.get("") || 10000
          nodeSnumMap.delete("")
          if (nodeSnumMap.size) {
            ns = ns.map((n) => {
              const snum = nodeSnumMap.get(n.id)
              return snum !== undefined ? { ...n, data: { ...n.data, snum: snum } } : n
            })
          }
          setHelperLine((oldLine) => calcHelperLine(oldLine, {}))
        }
        // 拖拽到一般分组中
        else {
          const groupPosAbs = group.positionAbsolute
          // 修正节点的 position
          const [posRelate] = resetNodePos(groupPosAbs, position)
          defaultNode.position = posRelate
        }
      }
      let newNodes: Node[] = []
      if (vnType === VNTypeEnum.MGROUP) {
        // 创建导图节点，本质上是 text 节点
        const rootNode = getDefaultNode(VNTypeEnum.MIND)
        rootNode.bgColor = THEME_COLOR
        const groupContent = JSON.stringify(defaultNode)
        const rootContent = JSON.stringify(rootNode)
        const vns = await db.viewnode.addMindRoot(
          viewId,
          groupId,
          currPid,
          groupContent,
          rootContent
        )
        newNodes = vns.map((vn) => {
          // 同时创建导图分组和根节点，所以不是导图分组就是根节点
          const aMindNode = !isMGroupNode(vn.vn_type_id)
          const node = nodeFactory(vn, undefined, undefined, aMindNode)
          // 拖拽新建的导图节点，直接进入编辑状态
          if (aMindNode) {
            node.selected = true
            node.data.etime = Date.now()
          } else if (currPid) {
            newMindEdge = genMindEdge(node)
          }
          return node
        })
      } else if (vnType === VNTypeEnum.CARD) {
        const card = await db.card.getCard(nodeId)
        if (!card) return
        const content = JSON.stringify(defaultNode)
        const vn = await db.viewnode.addNode(
          viewId,
          groupId,
          currPid,
          nodeId,
          nodeType,
          vnType,
          content
        )
        const cardInfo = formatNodeObj(
          card,
          types.find((t) => t.id === card.type_id)
        )
        const newNode = nodeFactory(vn, cardInfo)
        newNodes = [newNode]
        if (currPid) {
          newMindEdge = genMindEdge(newNode)
        }
      } else if (shapeType) {
        defaultNode.shapeType = shapeType as ShapeTypeEnum
        if (shapeType === ShapeTypeEnum.TRIANGLE) {
          defaultNode.width = 116
        }
        const content = JSON.stringify(defaultNode)
        const vn = await db.viewnode.addNode(
          viewId,
          groupId,
          currPid,
          nodeId,
          nodeType,
          vnType,
          content
        )
        const newNode = nodeFactory(vn)
        // 拖拽新建的节点，直接进入编辑状态
        newNode.selected = true
        newNode.data.etime = Date.now()
        newNodes = [newNode]
        if (currPid) {
          newMindEdge = genMindEdge(newNode)
        }
      }
      rfIns.setOriginNodes([...ns, ...newNodes])
      if (newMindEdge) {
        rfIns.setEdges((edges) => [...edges, newMindEdge as Edge])
      }
      if (currPid && nodeSnumMap.size) {
        db.viewnode.batchUpdateSortNodes(currPid, nodeSnumMap)
      }
    },
    [db, rfIns, types, viewConf.mindAutoFold, viewId]
  )
  // 处理拖拽开始事件
  const handleDragStart = useCallback(
    (nodes: Node<NodeData>[]) => {
      // 当前正在拖拽中的分组节点
      const groupIds = nodes.filter((n) => isGroupCate(n.type)).map((n) => n.id)
      const groupSet = groupIds.length ? new Set(groupIds) : undefined
      // 计算排除当前正在拖拽中的分组外的所有其他分组节点，并缓存
      tempRef.current.groupRects = calcGroupRects(rfIns.getOriginNodes(), groupSet)

      // 拖拽导图非根节点时，需要删除该节点与上级节点的关联边
      if (nodes[0].data.pid && !isMindRootNode(nodes[0].data.pid)) {
        const edgeId = mindEdgeId(nodes[0].id)
        rfIns.setEdges((es) => es.filter((e) => e.id !== edgeId))
      }
    },
    [rfIns]
  )
  // 处理拖拽事件
  const handleDrag = useCallback(
    (nodes: Node<NodeData>[]) => {
      let ns = rfIns.getOriginNodes()
      // 拖拽多个导图子节点
      const mutliMindNode = nodes.length > 1 && nodes[0].data.pid
      // 计算节点总区域: 拖拽多个导图节点时，以第一个节点为准
      const rect = getRectOfNodes(mutliMindNode ? [nodes[0]] : nodes)
      // 拖拽非导图节点(一般节点和分组节点)，如果当前节点和某个分组节点产生交集，则对应分组节点背景色加深
      const rectPos = { x: rect.x, y: rect.y }
      const intersectGroup = calcIntersectGroup(rectPos, tempRef.current.groupRects)
      // 与导图分组相交
      const intersectMindGroup = intersectGroup && isMGroupNode(intersectGroup.type)
      const intersectGroupId = intersectGroup?.id
      const changeIntersectId = intersectGroupRef.current.intersectGroupId !== intersectGroupId
      if (changeIntersectId) {
        ns = ns.map((n) =>
          n.id === intersectGroupId
            ? { ...n, className: "intersect" }
            : n.className
            ? { ...n, className: undefined }
            : n
        )
        // 与导图分组相交，则计算并缓存导图中所有子节点的参数
        if (intersectMindGroup) {
          // 从所有节点中筛选出当前相交的导图分组中所有子节点
          const mindAllNodes = ns.filter((n) => n.parentNode === intersectGroupId)
          // 如果拖拽中的节点是相交导图分组的子节点，则排除拖拽中的这部分节点(一个主节点及其所有子节点)
          const inCurrGroup = nodes[0].parentNode === intersectGroupId
          const dragNodeIds = inCurrGroup ? nodes.map((n) => n.id) : undefined
          const [mindRemainNodes, originIndex] = formatNodes(mindAllNodes, dragNodeIds)
          intersectGroupRef.current = { intersectGroupId, mindRemainNodes, originIndex }
          // 清除辅助线
          setHelperLine((oldLine) => calcHelperLine(oldLine, {}))
        }
        // 与非导图分组或白板相交，缓存剩余用于计算辅助线的节点
        else {
          // 当前拖拽节点的原分组和当前相交分组一致，则需排除
          const excludeEodeIds = new Set(
            nodes[0].parentNode === intersectGroupId ? nodes.map((n) => n.id) : []
          )
          const remainNodes = ns.filter(
            (n) => n.parentNode === intersectGroupId && !excludeEodeIds.has(n.id)
          )
          intersectGroupRef.current = { intersectGroupId, remainNodes }
          // 清除导图关联线
          rfIns.updateConnectionLine()
        }
      }
      // 与导图分组相交
      if (intersectMindGroup) {
        // 计算拖动节点的最近节点
        const [closestNodeId, sourceHandleId, nodePointer] = getClosestNodeId(
          intersectGroup,
          intersectGroupRef.current.mindRemainNodes || [],
          rect,
          MindLayoutEnum.LR
        )
        intersectGroupRef.current.currPid = closestNodeId
        // 动态更新关联边
        rfIns.updateConnectionLine(closestNodeId, sourceHandleId, nodePointer)
        // 更新节点
        if (changeIntersectId) {
          rfIns.setOriginNodes(ns)
        }
      }
      // 与非导图分组或白板相交，则计算辅助线
      else {
        const remainNodes = intersectGroupRef.current.remainNodes || []
        // 计算辅助线: 以所有节点为准
        const allRect = mutliMindNode ? getRectOfNodes(nodes) : rect
        const helperLine = intersectGroup?.layout
          ? getLayoutHelperLines(allRect, remainNodes, intersectGroup, intersectGroup.layout)
          : getHelperLines(allRect, remainNodes)
        // 更新节点位置到辅助线的位置
        const nodeMap = new Map<string, XYPosition>()
        // 计算节点磁吸偏移量
        const [offsetX, offsetY] = [
          helperLine.snapPosition.x ? helperLine.snapPosition.x - allRect.x : 0,
          helperLine.snapPosition.y ? helperLine.snapPosition.y - allRect.y : 0,
        ]
        if (offsetX !== 0 || offsetY !== 0) {
          nodes.forEach((n) =>
            nodeMap.set(n.id, { x: n.position.x + offsetX, y: n.position.y + offsetY })
          )
          ns = ns.map((n) =>
            nodeMap.has(n.id) ? { ...n, position: nodeMap.get(n.id) as XYPosition } : n
          )
        }
        setHelperLine((oldLine) =>
          calcHelperLine(oldLine, {
            horizontal: helperLine.horizontal,
            vertical: helperLine.vertical,
            startX: helperLine.start?.x,
            startY: helperLine.start?.y,
            endX: helperLine.end?.x,
            endY: helperLine.end?.y,
          })
        )
        // 更新节点
        if (changeIntersectId || nodeMap.size > 0) {
          rfIns.setOriginNodes(ns)
        }
      }
    },
    [rfIns]
  )
  /**
   * 处理拖拽结束事件: 先新建分组，再处理新分组，再处理原分组
   * - 先新建分组
   *  - 新建导图分组: 从导图分组中拖拽多个子节点到非导图分组
   *  - 新建一般分组: 拖拽多个一般节点到导图分组
   * - 拖拽到分组中
   *  - 拖拽到导图分组中
   *    - 拖拽单个节点
   *    - 拖拽多个节点
   *    - 从分组拖拽到导图分组中
   *      - 从导图分组拖拽到导图分组中
   *        - 从当前导图分组拖拽到导图分组中
   *        - 从其他导图分组拖拽到导图分组中
   *      - 从其他一般分组拖拽到导图分组中
   *    - 从白板拖拽到导图分组中
   *    - 重置节点布局 & 更新数据库
   *  - 拖拽到一般分组中
   * - 拖拽到白板中
   *
   * 拖拽多个导图子节点时，如果拖拽到导图分组中，则以根节点为准，如果拖拽到一般分组或白板中，则以所有节点的 rect 为准
   */
  const handleDragStop = useCallback(
    async (nodes: Node<NodeData>[]) => {
      const {
        intersectGroupId: newGroupId,
        mindRemainNodes = [],
        originIndex = -1,
        currPid = "",
        remainNodes = [],
      } = intersectGroupRef.current
      intersectGroupRef.current = { intersectGroupId: null }
      // 拖拽目标节点(多个节点也会先转换成一个分组节点再进行处理)
      let node = nodes[0]
      const oldGroupId = node.parentNode
      const group = newGroupId ? rfIns.getNode(newGroupId) : undefined
      // 节点在同一个分组/白板上
      const inSameGroup = oldGroupId === newGroupId
      // 拖拽多个一般节点和拖拽多个导图节点
      const mutliNode = nodes.length > 1 && !node.data.pid
      const mutliMindNode = nodes.length > 1 && node.data.pid
      let ns = rfIns.getNodes()
      let edges = rfIns.getEdges()
      // 需要重置布局的分组 id
      const gids = new Set<string>()
      // 统一更新节点信息
      const nodeMap: Map<string, VNParam> = new Map()

      // **************************** 新建分组 ****************************
      // 新建导图分组: 从导图分组中拖拽多个子节点到非导图分组或白板
      if ((!group || !isMGroupNode(group.type)) && mutliMindNode) {
        const { width, height, ...mgPos } = calcGroupRect(nodes)
        // 分组内子节点的相对坐标
        const nodePMap: Map<string, XYPosition> = new Map()
        nodes.forEach((n) => {
          if (n.positionAbsolute) {
            nodePMap.set(n.id, {
              x: n.positionAbsolute.x - mgPos.x,
              y: n.positionAbsolute.y - mgPos.y,
            })
          }
        })
        // 创建导图分组
        const vnType = VNTypeEnum.MGROUP
        const defaultNode = getDefaultNode(vnType, mgPos)
        defaultNode.width = width
        defaultNode.height = height
        const content = JSON.stringify(defaultNode)
        const gnode = await db?.viewnode.addNode(
          viewId,
          "",
          "",
          "",
          NodeTypeEnum.GROUP,
          vnType,
          content
        )
        if (!gnode) {
          console.error("创建分组节点失败")
          return
        }
        // 新的根节点
        const rootNodeId = node.id
        // 组装 DB 变更参数
        nodes.forEach((n) => {
          nodeMap.set(n.id, {
            groupId: gnode.id,
            pid: n.id === rootNodeId ? MIND_ROOT_PID : n.data.pid,
            snum: n.id === rootNodeId ? 0 : n.data.snum,
          })
        })
        // 更新 node 变量对象
        node = nodeFactory(gnode)
        node.positionAbsolute = { ...mgPos }
        // 更新节点列表
        ns = [
          ...ns.map((n) => {
            const pos = nodePMap.get(n.id)
            if (pos) {
              const nn = { ...n, parentNode: gnode.id, position: pos }
              if (n.id === rootNodeId) {
                nn.data = { ...n.data, pid: MIND_ROOT_PID, snum: 0 }
              }
              return nn
            } else {
              return n
            }
          }),
          node,
        ]
        // 更新边列表
        edges = edges.map((e) =>
          e.data?.groupId === oldGroupId && nodePMap.has(e.target)
            ? { ...e, data: { ...e.data, groupId: gnode.id } }
            : e
        )
      }
      // 新建一般分组: 拖拽多个一般节点到导图分组
      else if (group && isMGroupNode(group.type) && mutliNode) {
        // 分组内子节点的相对坐标
        const nodePMap: Map<string, XYPosition> = new Map()
        const { width, height, ...mgPos } = calcGroupRect(nodes)
        nodes.forEach((n) => {
          if (n.positionAbsolute) {
            nodePMap.set(n.id, {
              x: n.positionAbsolute.x - mgPos.x,
              y: n.positionAbsolute.y - mgPos.y,
            })
          }
        })
        // 创建分组节点
        const vnType = VNTypeEnum.IGROUP
        const defaultNode = getDefaultNode(vnType, mgPos)
        defaultNode.width = width
        defaultNode.height = height
        const content = JSON.stringify(defaultNode)
        const gnode = await db?.viewnode.addNode(
          viewId,
          "",
          "",
          "",
          NodeTypeEnum.GROUP,
          vnType,
          content
        )
        if (!gnode) {
          console.error("创建分组节点失败")
          return
        }
        // 组装 DB 变更参数
        nodePMap.forEach((pos, id) => {
          nodeMap.set(id, {
            groupId: gnode.id,
            position: pos,
            snum: null,
          })
        })
        // 更新 node 变量对象
        node = nodeFactory(gnode)
        node.positionAbsolute = { ...mgPos }
        node.width = width
        node.height = height
        ns = [
          ...ns.map((n) => {
            const pos = nodePMap.get(n.id)
            if (pos) {
              return { ...n, parentNode: gnode.id, selected: false, position: pos }
            } else {
              return n
            }
          }),
          node,
        ]
      }
      // **************************** 处理新分组 **************************
      // 拖拽到分组中(拖拽结束时存在相交节点)
      if (newGroupId && group && group.positionAbsolute) {
        // 拖拽到导图分组中
        if (isMGroupNode(group.type)) {
          // 从其他导图分组拖拽到新导图分组需要更新 group_id 的节点 id
          const changeGroupNodeIdSet = new Set<string>()
          let nodeSnumMap = new Map<string, number>()
          // 单个一般节点(文本、卡片、视图)拖拽到导图中，自动折叠
          const autoFold = viewConf.mindAutoFold && nodes.length === 1 && isBaseCate(node.type)
          // 拖拽多个导图节点，则嵌入到当前导图分组中
          if (nodes.length > 1 && node.data.pid) {
            // 拖拽节点的四周坐标
            const rectPos = getNodeRectPositions(node)
            nodeSnumMap = calcNodeChange(
              rectPos,
              node.id,
              node.data.pid,
              originIndex,
              currPid,
              mindRemainNodes,
              MindLayoutEnum.LR,
              inSameGroup
            )
            // 从其他导图分组拖拽多个节点到当前导图分组，需要更新拖拽的节点所属 groupId
            if (!inSameGroup) {
              nodes.slice(1).forEach((n) => {
                // 组装 DB 变更参数
                nodeMap.set(n.id, { groupId: newGroupId })
                changeGroupNodeIdSet.add(n.id)
              })
            }
          }
          // 拖拽多个节点的场景，已经转换成一个新的分组节点，与拖拽一个节点逻辑一样
          else {
            // 拖拽节点的四周坐标
            const rectPos = getNodeRectPositions(node)
            nodeSnumMap = calcNodeChange(
              rectPos,
              node.id,
              node.data.pid || "",
              originIndex,
              currPid,
              mindRemainNodes,
              MindLayoutEnum.LR,
              inSameGroup
            )
          }
          // 更新DB: group_id/pid/snum
          if (nodeSnumMap.size) {
            // 组装 DB 变更参数
            nodeSnumMap.forEach((snum, id) => {
              const param: VNParam = {
                groupId: newGroupId,
                pid: currPid,
                snum: snum,
              }
              if (autoFold && id === node.id) {
                param.styleId = NODE_STYLE_FOLD
                param.autoWidth = true
              }
              nodeMap.set(id, param)
            })
          }
          ns = ns.map((n) => {
            const snum = nodeSnumMap.get(n.id)
            if (snum !== undefined) {
              const nn = {
                ...n,
                parentNode: newGroupId,
                data: { ...n.data, pid: currPid, snum: snum },
              }
              if (n.id === node.id && autoFold) {
                nn.style = { maxWidth: nn.width || 280 }
                nn.data.styleId = NODE_STYLE_FOLD
                nn.data.autoWidth = true
              }
              return nn
            } else if (n.id === newGroupId) {
              return { ...n, className: undefined }
            } else if (changeGroupNodeIdSet.has(n.id)) {
              return { ...n, parentNode: newGroupId }
            } else {
              return n
            }
          })
          // 新建导图节点关联边，更新边
          if (changeGroupNodeIdSet.size) {
            edges = edges.map((e) =>
              e.data?.groupId === oldGroupId && changeGroupNodeIdSet.has(e.target)
                ? { ...e, data: { ...e.data, groupId: newGroupId } }
                : e
            )
          }
          const newNode = ns.find((n) => n.id === node.id)
          if (newNode) {
            edges.push(genMindEdge(newNode))
          }
          // 无论是在原导图分组内拖拽节点但最终未移动位置，还是其他场景，都强制 resetMind 布局
          gids.add(newGroupId)
          // 清除临时的导图连接线
          rfIns.updateConnectionLine()
        }
        // 拖拽到布局分组中
        else if (group.data.layout) {
          // 此刻实际更新的节点数组
          const tmpNs = mutliMindNode ? [node] : nodes
          // 计算节点所处位置
          const snumMap = calcLayoutSort(remainNodes, tmpNs, group.data.layout)
          // 组装 DB 变更参数
          snumMap.forEach((snum, id) => {
            nodeMap.set(id, { groupId: newGroupId, snum: snum })
          })
          // 更新节点集
          ns = ns.map((n) => {
            const snum = snumMap.get(n.id)
            return snum
              ? {
                  ...n,
                  parentNode: newGroupId,
                  data: { ...n.data, pid: "", snum },
                }
              : n.id === newGroupId
              ? { ...n, className: undefined }
              : n
          })
          gids.add(newGroupId)
          setHelperLine((oldLine) => calcHelperLine(oldLine, {}))
        }
        // 拖拽到一般分组中
        else {
          const groupPosAbs = group.positionAbsolute
          // 此刻实际更新的节点数组
          const tmpNs = mutliMindNode ? [node] : nodes
          // 计算节点总区域
          const rect = getRectOfNodes(tmpNs)
          // 修正节点的 position 和 positionAbsolute
          const offset = getPositionOffset(groupPosAbs, { x: rect.x, y: rect.y })
          rect.x += offset.x
          rect.y += offset.y
          const posMap = new Map<string, { pos: XYPosition; posAbs: XYPosition }>()
          tmpNs.forEach((n) => {
            if (n.positionAbsolute) {
              const posAbs = {
                x: n.positionAbsolute.x + offset.x,
                y: n.positionAbsolute.y + offset.y,
              }
              const pos = { x: posAbs.x - groupPosAbs.x, y: posAbs.y - groupPosAbs.y }
              posMap.set(n.id, { pos, posAbs })
              // 组装 DB 变更参数
              nodeMap.set(n.id, {
                groupId: newGroupId,
                pid: "",
                position: pos,
                snum: null,
              })
            }
          })
          // 更新节点集
          ns = ns.map((n) => {
            const pos = posMap.get(n.id)
            return pos
              ? {
                  ...n,
                  parentNode: newGroupId,
                  position: pos.pos,
                  positionAbsolute: pos.posAbs,
                  data: { ...n.data, pid: "", snum: 0 },
                }
              : n.id === newGroupId
              ? { ...n, className: undefined }
              : n
          })
          gids.add(newGroupId)
          setHelperLine((oldLine) => calcHelperLine(oldLine, {}))
        }
      }
      // 拖拽到白板上
      else {
        // 此刻实际更新的节点数组
        const tmpNs = mutliMindNode ? [node] : nodes
        const posMap = new Map<string, XYPosition>()
        tmpNs.forEach((n) => {
          if (n.positionAbsolute) {
            posMap.set(n.id, n.positionAbsolute)
            // 组装 DB 变更参数
            nodeMap.set(n.id, {
              groupId: "",
              pid: "",
              position: n.positionAbsolute,
              snum: null,
            })
          }
        })
        // 更新节点集
        ns = ns.map((n) => {
          const pos = posMap.get(n.id)
          return pos
            ? { ...n, parentNode: undefined, position: pos, data: { ...n.data, pid: "", snum: 0 } }
            : n
        })
        setHelperLine((oldLine) => calcHelperLine(oldLine, {}))
      }
      // **************************** 处理原分组 **************************
      // 从其他分组中拖拽到导图分组
      if (oldGroupId) {
        // 从其他导图分组拖拽到当前导图分组
        if (node.data.pid) {
          // 在当前导图分组内拖拽
          if (inSameGroup) {
            // 不需要进行处理
          }
          // 从其他导图分组拖拽到当前导图分组
          else {
            // 需要重置原导图坐标
            gids.add(oldGroupId)
          }
        }
        // 从其他一般分组拖拽到当前导图分组
        else {
          gids.add(oldGroupId)
        }
      }
      // 从白板中拖拽到导图分组
      else {
        // 不需要进行处理
      }
      // **************************** 重置节点 ****************************
      const res = resetNodes(ns, gids, nodeMap)
      if (res) {
        ns = res[0]
        if (res[1].size) gd.setResizedGroupIds(res[1])
      }
      if (nodeMap.size) {
        db?.viewnode.batchUpdateNodeParam(nodeMap)
      }
      rfIns.setOriginNodes(ns)
      rfIns.setOriginEdges(edges)
    },
    [db?.viewnode, rfIns, viewConf.mindAutoFold, viewId]
  )
  // 拖拽导图非根节点时，将拖拽事件代理到临时导图节点
  const onNodeDragStart: NodeDragHandler = useCallback(
    (event, node, nodes) => {
      console.log("ReactFlow: onNodeDragStart", event, node, nodes)
      handleDragStart(nodes)
    },
    [handleDragStart]
  )
  // 节点拖拽事件，触发时 ReactFlow 实际已经更新了节点的位置，思维导图中，只允许拖拽单个节点
  const onNodeDrag: NodeDragHandler = useCallback(
    (event, node: Node<NodeData>, nodes: Node<NodeData>[]) => {
      // console.log("ReactFlow: onNodeDrag", event, node, nodes)
      handleDrag(nodes)
    },
    [handleDrag]
  )
  const onNodeDragStop: NodeDragHandler = useCallback(
    (event, node, nodes) => {
      console.log("ReactFlow: onNodeDragStop", event, node, nodes)
      handleDragStop(nodes)
    },
    [handleDragStop]
  )
  const onSelectionDragStart: SelectionDragHandler = useCallback(
    (event, nodes) => {
      console.log("ReactFlow: onSelectionDragStart", event, nodes)
      handleDragStart(nodes)
    },
    [handleDragStart]
  )
  const onSelectionDrag: SelectionDragHandler = useCallback(
    (event, nodes) => {
      console.log("ReactFlow: onSelectionDrag", event, nodes)
      handleDrag(nodes)
    },
    [handleDrag]
  )
  const onSelectionDragStop: SelectionDragHandler = useCallback(
    (event, nodes) => {
      console.log("ReactFlow: onSelectionDragStop", event, nodes)
      handleDragStop(nodes)
    },
    [handleDragStop]
  )
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      // console.log("onNodesChange", changes)
      // 判断是否是节点 ResizeObserver 触发的 dimensions 事件: 重置节点尺寸
      if (changes.every((c) => c.type === "dimensions" && !c.resizing)) {
        // resize 单个节点过程中，跳过因 ResizeObserver 不断触发的 dimensions 事件
        if (changes.length === 1 && gd.getResizingId() === (changes[0] as NodeDimensionChange).id) {
          return
        }
        // console.log("dimensionsChange")
        const nodeIds = changes.map((c) => (c as NodeDimensionChange).id)
        // 检测是否已经重置
        const resizedGroupIds = gd.getResizedGroupIds()
        if (resizedGroupIds && resizedGroupIds.size) {
          const checkResizedRes = checkResizedGroup(nodeIds, resizedGroupIds)
          gd.setResizedGroupIds()
          // console.log("dimensionsChange: 检测是否已经重置", checkResizedRes)
          if (checkResizedRes) return
        }
        const nodes = rfIns.getNodes()
        const gids = new Set<string>()
        // 页面初始化时第一次 resize 所有节点，则会相等，否则是某个或某几个节点尺寸更新触发 resize
        const resizeAll = nodes.length === changes.length
        if (!resizeAll) {
          // 判断节点是否需要自动布局: igroup/mgroup/layerGroup
          nodeIds.forEach((nId) => {
            const groupId = rfIns.getNode(nId)?.parentNode
            if (groupId) gids.add(groupId)
          })
          if (!gids.size) return
        }
        // 统一更新节点信息
        const nodeMap: Map<string, VNParam> = new Map()
        const res = resetNodes(nodes, gids, nodeMap)
        // console.log("dimensionsChange res", res, resizeAll)
        if (res) {
          const [newNodes, resizedGroupIds] = res
          if (resizedGroupIds.size) gd.setResizedGroupIds(resizedGroupIds)
          // 视图集的思维导图需要确定节点大小和重置位置之后再进行居中
          if (!tempRef.current.firstFitedView) {
            tempRef.current.firstFitedView = true
            rfIns.initNodes(newNodes)
          } else {
            rfIns.setOriginNodes(newNodes)
          }
          if (nodeMap.size) {
            db?.viewnode.batchUpdateNodeParam(nodeMap)
          }
        } else if (resizeAll && !tempRef.current.firstFitedView) {
          tempRef.current.firstFitedView = true
          rfIns.forceInitFitView()
        }
      }
    },
    [db?.viewnode, rfIns]
  )
  // 创建文本节点
  const createTextNode = useCallback(
    (viewId: string, position: XYPosition, groupId: string) => {
      const vnType = VNTypeEnum.TEXT
      const defaultNode = getDefaultNode(vnType, position)
      const content = JSON.stringify(defaultNode)
      db?.viewnode
        .addNode(viewId, groupId, "", "", NodeTypeEnum.TEXT, vnType, content)
        .then((vn) => {
          const newNode = nodeFactory(vn)
          rfIns.setNodes((nds) => [
            ...(groupId ? nds.map((n) => (n.id === groupId ? { ...n, selected: false } : n)) : nds),
            { ...newNode, selected: true, data: { ...newNode.data, etime: Date.now() } },
          ])
        })
    },
    [db?.viewnode, rfIns]
  )
  // 双击创建文本节点，便于自由输入
  const onDoubleClick: React.MouseEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      const target = event.target as HTMLDivElement
      console.log("onDoubleClick", event, target)
      if (
        flowWrapper.current &&
        viewId !== "views" &&
        target.getAttribute("class")?.includes("react-flow__pane")
      ) {
        // 获取元素左，上，右和下分别相对浏览器视窗的距离(0, 46, width, height + 46)
        const flowBounds = flowWrapper.current.getBoundingClientRect()
        // 插入节点的位置
        const position = rfIns.project({
          x: event.clientX - flowBounds.left,
          y: event.clientY - flowBounds.top,
        })
        createTextNode(viewId, position, "")
      }
    },
    [createTextNode, rfIns, viewId]
  )
  // 双击分组节点的空白处，在分组中新建文本节点
  const onNodeDoubleClick: NodeMouseHandler = useCallback(
    (event, node) => {
      event.preventDefault()
      event.stopPropagation()
      console.log("onNodeDoubleClick", event, node)
      if (flowWrapper.current && isIGroupNode(node.type)) {
        // 获取元素左，上，右和下分别相对浏览器视窗的距离(0, 46, width, height + 46)
        const flowBounds = flowWrapper.current.getBoundingClientRect()
        // 插入节点的位置
        let position = rfIns.project({
          x: event.clientX - flowBounds.left,
          y: event.clientY - flowBounds.top,
        })
        if (node.positionAbsolute) {
          // 修正节点的 position 和 positionAbsolute
          const newPos = resetNodePos(node.positionAbsolute, position)
          position = newPos[0]
        }
        createTextNode(viewId, position, node.id)
      }
    },
    [createTextNode, rfIns, viewId]
  )
  // 创建连接
  const onConnect: OnConnect = useCallback(
    (params) => {
      console.log("ReactFlow: onConnect", params)
      if (params.source && params.target && params.sourceHandle && params.targetHandle)
        db?.viewedge
          .addEdge(viewId, params.source, params.target, params.sourceHandle, params.targetHandle)
          .then((ve) => {
            rfIns.setEdges((eds) => [...eds, edgeFactory(ve)])
          })
    },
    [db?.viewedge, rfIns, viewId]
  )
  // 双击 edge，进入编辑状态
  const onEdgeDoubleClick: EdgeMouseHandler = useCallback(
    (event, edge) => {
      console.log("onEdgeDoubleClick", event, edge)
      event.stopPropagation()
      rfIns.setEdges((es) =>
        es.map((e) => (e.id === edge.id ? { ...e, data: { ...e.data, et: Date.now() } } : e))
      )
    },
    [rfIns]
  )
  // 触发连接
  const onConnectStart: OnConnectStart = useCallback((event, param) => {
    console.log("ReactFlow: onConnectStart", event, param)
  }, [])
  const onConnectEnd: OnConnectEnd = useCallback((event) => {
    console.log("ReactFlow: onConnectEnd", event)
  }, [])
  const onEdgesChange: OnEdgesChange = useCallback((edgeChanges) => {
    console.log("ReactFlow: onEdgesChange", edgeChanges)
  }, [])
  const onSelectionChange: OnSelectionChangeFunc = useCallback((params) => {
    console.log("ReactFlow: onSelectionChange", params)
  }, [])
  // 页面初始化时，会刷新三次，第一次 nodes 为[]，第二次为查询到基础数据，第三次为 onInit() 设置 reactflowIns
  // console.log("Render: ReactFlow")
  return (
    <FlowBox id="flowBox" ref={flowWrapper} token={token} className={cc({ hideHandler })}>
      <ReactFlow
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultNodes={[]}
        defaultEdges={[]}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        // onConnectStart={onConnectStart}
        // onConnectEnd={onConnectEnd}
        // onEdgesChange={onEdgesChange}
        // 直接在 reactflow 源码中删除了 onSelectionChange 事件，需要自行处理
        // onSelectionChange={onSelectionChange}
        onSelectionDragStart={onSelectionDragStart}
        onSelectionDrag={onSelectionDrag}
        onSelectionDragStop={onSelectionDragStop}
        onDoubleClick={onDoubleClick}
        onNodeDoubleClick={onNodeDoubleClick}
        // onInit={setFlowInstance}
        onDragOver={onDragOver}
        onDrop={onDropEnd}
        onDragLeave={onDragLeave}
        zoomOnDoubleClick={false}
        fitViewOptions={fitViewOptions}
        disableKeyboardA11y
        // 只渲染可见元素: 会随着页面缩放不断触发节点变更事件，因此暂时关闭
        // onlyRenderVisibleElements
        panOnScroll
        selectionOnDrag
        panOnDrag={panOnDrag}
        // 框选节点时，Full 表示全部包含节点才能被选中，Partial 表示只要接触就能被选中
        selectionMode={SelectionMode.Partial}
        deleteKeyCode={null}
        connectionLineStyle={{ strokeWidth: 1.5, stroke: token.colorPrimary }}
        connectionMode={ConnectionMode.Loose}
        connectOnClick={false}
        defaultEdgeOptions={defaultEdgeOptions}
        onEdgeDoubleClick={onEdgeDoubleClick}
        elevateNodesOnSelect={false}
        nodeDragThreshold={2}
        selectNodesOnDrag={false}
        snapGrid={[1, 1]}
        snapToGrid
      >
        <FlowCtrl />
        {viewConf.helperLine && (
          <HelperLine
            horizontal={helperLine?.horizontal}
            vertical={helperLine?.vertical}
            startX={helperLine?.startX}
            startY={helperLine?.startY}
            endX={helperLine?.endX}
            endY={helperLine?.endY}
          />
        )}
        {viewId !== SpecialViewEnum.VIEWS && <Selection viewId={viewId} />}
        {showBoardTip && (
          <TipPanel
            position="center_center"
            style={{ backgroundColor: opacity(token.colorPrimary, 0.1) }}
          >
            <Typography.Text type="secondary">
              白板上<Typography.Text type="warning"> 双击 </Typography.Text>可创建文本节点
              <br />
              空白文本节点输入<Typography.Text type="warning"> @+关键词 </Typography.Text>
              快速引用卡片
              <br />
              右上角卡片库可拖拽卡片到白板
              <br />
              选中节点按<Typography.Text type="warning"> Enter / Tab </Typography.Text>快捷创建节点
            </Typography.Text>
          </TipPanel>
        )}
        {/* <Background /> */}
      </ReactFlow>
    </FlowBox>
  )
}

const FlowBox = styled("div")(({ token }: StyledToken) => ({
  height: "100%",
  ".groupNodeBox": {
    backgroundColor: token.colorBgContainer,
  },
  ".react-flow__edge.selected .react-flow__edge-path, .react-flow__edge:focus .react-flow__edge-path, .react-flow__edge:focus-visible .react-flow__edge-path":
    {
      stroke: token.colorPrimary,
    },
  ".tempmindedge .react-flow__edge-path": {
    stroke: token.colorPrimary,
  },
}))
const TipPanel = styled(Panel)({
  margin: 0,
  padding: "16px 24px",
  borderRadius: 8,
})
