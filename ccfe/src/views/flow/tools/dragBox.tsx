import React, { ReactNode, memo, useCallback, useRef } from "react"
import type { MindNodeItem, NodeData, TempRect } from "@/types"
import type { Node, Edge } from "@/reactflow"
import { MindLayoutEnum, NodeTypeEnum, ShapeTypeEnum, VNTypeEnum } from "@/enums"
import {
  calcGroupRects,
  calcIntersectGroup,
  calcNodeChange,
  formatNodeObj,
  formatNodes,
  genMindEdge,
  getClosestNodeId,
  getDefaultNode,
  getRectPositions,
  isBaseCate,
  isMGroupNode,
  nodeFactory,
  resetNodePos,
} from "@/utils"
import { useRF } from "../hooks"
import { GetConf, GetDBTypes, useConfigStore, useDBStore } from "@/store"
import { getHelperLines, getLayoutHelperLines } from "../utils"
import { shallow } from "zustand/shallow"
import { NODE_STYLE_FOLD, THEME_COLOR } from "@/constant"

type Props = {
  viewId: string
  vnType: VNTypeEnum
  nodeType: NodeTypeEnum
  nodeId?: string
  shapeType?: ShapeTypeEnum
  className?: string
  children?: ReactNode
}
type TempData = {
  // 与拖拽单节点相交的分组 ID
  intersectGroupId?: string | null
  // 缓存白板中所有可以与当前拖拽节点相交的分组节点信息(避免重复计算)
  groupRects?: TempRect[]
  // 白板元素区域
  flowBoxRect?: DOMRect
  // 当前拖拽元素属性
  dragRect?: { offsetX: number; offsetY: number; width: number; height: number }
}
// 拖拽相交的导图信息
type IntersectGroup = {
  // 导图分组中剩余节点(排除当前正在拖拽的节点及所有子节点)
  mindNodes?: MindNodeItem[]
  // 拖拽的导图节点在同一层级中的顺序(从 0 开始)
  originIndex?: number
  // 当前的上级 id
  currPid?: string
  // 非导图分组和白板中剩余节点(排除当前正在拖拽的节点)
  remainNodes?: Node<NodeData>[]
}

const dbTypesSelector: GetDBTypes = (state) => [state.db, state.types]
const confSelector: GetConf = (state) => [state.viewConf]

export const DragBox = memo(
  ({ children, viewId, vnType, shapeType, nodeType, nodeId = "", className }: Props) => {
    const rfIns = useRF<NodeData>()
    const [db, types] = useDBStore(dbTypesSelector, shallow)
    const [viewConf] = useConfigStore(confSelector, shallow)
    const tempRef = useRef<TempData>({ intersectGroupId: null })
    const intersectGroupRef = useRef<IntersectGroup>({})
    const dragPosRef = useRef({ clientX: 0, clientY: 0 })
    const onDragStart = useCallback(
      (event: React.DragEvent) => {
        console.log("onDragStart", event, event.nativeEvent)
        const flowBoxEl = document.getElementById("flowBox")
        if (!flowBoxEl) return
        // event.nativeEvent.offsetX 是拖拽点相对于卡片左上角的坐标
        const { offsetX, offsetY } = event.nativeEvent
        const { clientWidth: width, clientHeight: height } = event.target as HTMLDivElement
        tempRef.current.dragRect = { offsetX, offsetY, width, height }
        // 获取元素左，上，右和下分别相对浏览器视窗的距离(0, 46, width, height + 46)
        tempRef.current.flowBoxRect = flowBoxEl.getBoundingClientRect()
        tempRef.current.groupRects = calcGroupRects(rfIns.getOriginNodes())
      },
      [rfIns]
    )
    const handleDrag = useCallback(() => {
      if (!tempRef.current.groupRects || !tempRef.current.flowBoxRect || !tempRef.current.dragRect)
        return
      // event.dataTransfer.dropEffect = "move"
      const { offsetX, offsetY, width, height } = tempRef.current.dragRect
      const { clientX, clientY } = dragPosRef.current
      const position = rfIns.project({
        x: clientX - tempRef.current.flowBoxRect.left - offsetX,
        y: clientY - tempRef.current.flowBoxRect.top - offsetY,
      })
      let ns = rfIns.getOriginNodes()
      // 拖拽时与分组相交，则分组节点背景色加深
      const intersectGroup = calcIntersectGroup(position, tempRef.current.groupRects)
      const intersectGroupId = intersectGroup?.id
      const changeIntersectId = tempRef.current.intersectGroupId !== intersectGroupId
      // 与导图分组相交
      const intersectMindGroup = intersectGroup && isMGroupNode(intersectGroup.type)
      if (changeIntersectId) {
        tempRef.current.intersectGroupId = intersectGroupId
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
          const mindNodes = ns.filter((n) => n.parentNode === intersectGroupId)
          const [remindNodes, originIndex] = formatNodes(mindNodes)
          intersectGroupRef.current = { mindNodes: remindNodes, originIndex, currPid: "" }
          // 清除辅助线
          // setHelperLine()
        }
        // 与非导图分组或白板相交，缓存剩余用于计算辅助线的节点
        else {
          intersectGroupRef.current.remainNodes = ns.filter(
            (n) => n.parentNode === intersectGroupId
          )
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
          intersectGroupRef.current.mindNodes || [],
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
        const { remainNodes = [] } = intersectGroupRef.current
        // 计算辅助线
        const helperLine = intersectGroup?.layout
          ? getLayoutHelperLines(rect, remainNodes, intersectGroup, intersectGroup.layout)
          : getHelperLines(rect, remainNodes)
        // setHelperLine(
        //   helperLine.horizontal || helperLine.vertical || helperLine.start || helperLine.end
        //     ? {
        //         horizontal: helperLine.horizontal,
        //         vertical: helperLine.vertical,
        //         start: helperLine.start,
        //         end: helperLine.end,
        //       }
        //     : undefined
        // )
      }
    }, [rfIns])
    const onDrag = useCallback(
      (event: React.DragEvent) => {
        event.preventDefault()
        // console.log("onDrag", event, event.nativeEvent)
        // 对比鼠标当前坐标，判断是否触发 handleDrag 事件
        const { clientX, clientY } = event
        if (dragPosRef.current.clientX !== clientX || dragPosRef.current.clientY !== clientY) {
          dragPosRef.current = { clientX, clientY }
          handleDrag()
        }
      },
      [handleDrag]
    )
    const onDragEnd = useCallback(
      async (event: React.DragEvent) => {
        event.preventDefault()
        console.log("onDragEnd", event)
        // tempRef.current.groupRects = undefined
        const { groupRects, flowBoxRect, dragRect, intersectGroupId } = tempRef.current
        if (!db || !groupRects || !flowBoxRect || !dragRect) return
        const { offsetX, offsetY, width, height } = dragRect
        const { clientX, clientY } = dragPosRef.current
        const position = rfIns.project({
          x: clientX - flowBoxRect.left - offsetX,
          y: clientY - flowBoxRect.top - offsetY,
        })
        // const vnType = event.dataTransfer.getData("type") as VNTypeEnum
        // const nodeType =
        //   (parseInt(event.dataTransfer.getData("node_type")) as NodeTypeEnum) || NodeTypeEnum.TEXT
        // const nodeId = event.dataTransfer.getData("node_id") || ""
        const defaultNode = getDefaultNode(vnType, position)
        const groupId = intersectGroupId || ""
        tempRef.current.intersectGroupId = null
        const group = groupId ? rfIns.getNode(groupId) : undefined
        // 取消相交分组的强调背景，以及取消选中当前选中的节点
        let ns = rfIns
          .getOriginNodes()
          .map((n) =>
            n.id === groupId
              ? { ...n, className: undefined, selected: false }
              : n.selected
              ? { ...n, selected: false }
              : n
          )
        // 拖拽到思维导图中，可能触发同级节点的 snum 更新
        let nodeSnumMap = new Map<string, number>()
        let pid = ""
        let newMindEdge: Edge | undefined = undefined

        // 拖拽位置和分组相交，则定义为拖拽到指定分组内
        if (group && group.positionAbsolute) {
          // 拖拽到导图分组中
          if (isMGroupNode(group.type)) {
            const {
              mindNodes: mindNs = [],
              originIndex = -1,
              currPid = "",
            } = intersectGroupRef.current
            intersectGroupRef.current = {}
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
              mindNs,
              MindLayoutEnum.LR,
              false
            )
            defaultNode.snum = nodeSnumMap.get("") || 0
            if (autoFold) {
              defaultNode.styleId = NODE_STYLE_FOLD
              defaultNode.autoWidth = true
            }
            pid = currPid
            nodeSnumMap.delete("")
            if (nodeSnumMap.size) {
              ns = ns.map((n) => {
                const snum = nodeSnumMap.get(n.id)
                return snum !== undefined
                  ? {
                      ...n,
                      data: { ...n.data, pid: currPid, snum: snum },
                    }
                  : n
              })
            }
            // 清除临时的导图连接线
            rfIns.updateConnectionLine()
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
          const vns = await db.viewnode.addMindRoot(viewId, groupId, pid, groupContent, rootContent)
          newNodes = vns.map((vn) => {
            // 同时创建导图分组和根节点，所以不是导图分组就是根节点
            const aMindNode = !isMGroupNode(vn.vn_type_id)
            const node = nodeFactory(vn, undefined, undefined, aMindNode)
            // 拖拽新建的导图节点，直接进入编辑状态
            if (aMindNode) {
              node.selected = true
              node.data.etime = Date.now()
            } else if (pid) {
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
            pid,
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
          if (pid) {
            newMindEdge = genMindEdge(newNode)
          }
        } else if (shapeType) {
          // 图形节点
          defaultNode.shapeType = shapeType
          if (shapeType === ShapeTypeEnum.TRIANGLE) {
            defaultNode.width = 116
          }
          const content = JSON.stringify(defaultNode)
          const vn = await db.viewnode.addNode(
            viewId,
            groupId,
            pid,
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
          if (pid) {
            newMindEdge = genMindEdge(newNode)
          }
        }
        rfIns.setOriginNodes([...ns, ...newNodes])
        if (newMindEdge) {
          rfIns.setEdges((edges) => [...edges, newMindEdge as Edge])
        }
        if (pid && nodeSnumMap.size) {
          db.viewnode.batchUpdateSortNodes(pid, nodeSnumMap)
        }
      },
      [db, nodeId, nodeType, rfIns, shapeType, types, viewConf.mindAutoFold, viewId, vnType]
    )

    return (
      <div
        className={className}
        draggable
        // onDragStart={onDragStart}
        // onDrag={onDrag}
        // onDragEnd={onDragEnd}
      >
        {children}
      </div>
    )
  }
)
