import React, { memo, useCallback, useMemo, useState } from "react"
import styled from "@emotion/styled"
import type { OnResizeStart, OnResizeEnd, Node, XYPosition } from "@/reactflow"
import type { CardObj, NodeData, NodeStyleType, StyledToken, VNParam, View } from "@/types"
import { App, Dropdown, MenuProps, Space, Typography, theme } from "antd"
import { Handle, Position } from "@/reactflow"
import { Align, BaseHandle, BgSet, MyNodeResizer } from "../tools"
import { GetColors, GetDB, SMCardId, useConfigStore, useDBStore, useModelStore } from "@/store"
import { useRF } from "../hooks"
import { IFlexRB, IconBtn, ToolbarBox } from "@/ui"
import { IIcon } from "@/icons"
import cc from "classcat"
import {
  convertTextExt,
  getCtrlType,
  isShapeNode,
  parseNodeContent,
  formatNodeObj,
  isIGroupNode,
  opacity,
  getDeleteText,
  calcGroupRect,
  isShapeOrGroupNode,
  resetNodes,
  emptyGroupRect,
  calcLayoutSort,
  isMGroupNode,
} from "@/utils"
import { LayoutEnum, NodeTypeEnum, VNTypeEnum } from "@/enums"
import { ViewNode } from "./view"
import { TextNode } from "./text"
import { CardNode } from "./card"
import { GroupNode } from "./group"
import { GROUP_PADDING, NODE_STYLE_FOLD, NODE_STYLE_FULL } from "@/constant"
import { getLocalSpaceId } from "@/datasource"
import { ExclamationCircleFilled } from "@ant-design/icons"
import { gd } from "@/config"

const dbSelector: GetDB = (state) => state.db
const colorsSelector: GetColors = (state) => state.colors
const cardSelector: SMCardId = (state) => state.setMCardId

const moreItems: MenuProps["items"] = [
  {
    key: "delete",
    label: (
      <IFlexRB>
        <Typography.Text>删除</Typography.Text>
        <Typography.Text type="secondary">Delete</Typography.Text>
      </IFlexRB>
    ),
  },
]

type BaseNodeProp = {
  id: string
  vnType: string
  nodeType: NodeTypeEnum
  pid?: string
  width?: number
  autoWidth?: boolean
  layout?: LayoutEnum
  bgColor?: string
  styleId?: NodeStyleType
  viewInfo?: View
  cardInfo?: CardObj
  ext?: string
  // 字段说明参考 types - NodeData
  etime?: number
  forbidEdit?: boolean
  // 选中且未在拖拽中，用于展示连接锚点和菜单栏
  active: boolean
}

export const BaseNode = memo(
  ({
    id,
    vnType,
    nodeType,
    pid,
    width,
    autoWidth,
    layout,
    bgColor,
    styleId,
    viewInfo,
    cardInfo,
    ext,
    etime,
    forbidEdit,
    active,
  }: BaseNodeProp) => {
    const rfIns = useRF<NodeData>()
    const db = useDBStore(dbSelector)
    const colors = useConfigStore(colorsSelector)
    const setMCardId = useModelStore(cardSelector)
    const { token } = theme.useToken()
    const { modal } = App.useApp()
    const aMindNode = !!pid
    const aShapeNode = isShapeNode(vnType)
    const aGroupNode = isIGroupNode(vnType)
    const showAutoWidth = !aShapeNode && !isMGroupNode(vnType)
    // 背景颜色，bgColor 为 undefined 时应用默认背景色
    const { bg, color } = (bgColor ? colors.get(bgColor) : undefined) || {
      bg: token.colorBgContainer,
      color: undefined,
    }
    // 文本编辑器样式，图形节点 或 autoWidth 为 false 时定义 width: 100%
    const textNodeStyle = useMemo(
      () => (autoWidth ? { maxWidth: width } : { width: "100%" }),
      [autoWidth, width]
    )
    const ctrlType = getCtrlType(vnType)
    // 进入编辑状态
    const [editTime, setEditTime] = useState(0)
    const et = etime ? Math.max(etime, editTime) : editTime
    // 进入编辑状态
    const handleEdit = useCallback(() => {
      console.log("BaseNode - handleEdit")
      // 节点根类型为 Text，则直接进入编辑状态
      if (nodeType === NodeTypeEnum.TEXT || nodeType === NodeTypeEnum.GROUP) {
        setEditTime(Date.now())
      } else {
        // 节点根类型为 Card/View，则需更新根类型为 Text
        rfIns.setNodes((ns) =>
          ns.map((n) => {
            if (n.id === id) {
              const newNodeType = NodeTypeEnum.TEXT
              const newType =
                n.type === VNTypeEnum.CARD || n.type === VNTypeEnum.VIEW ? VNTypeEnum.TEXT : n.type
              const name =
                n.data.nodeType === NodeTypeEnum.CARD
                  ? n.data.cardInfo?.name || ""
                  : n.data.nodeType === NodeTypeEnum.VIEW
                  ? n.data.viewInfo?.name || ""
                  : ""
              const newExt = convertTextExt("@" + name)
              const content = parseNodeContent(n)
              content.ext = newExt
              if (nodeType === NodeTypeEnum.VIEW) {
                content.bgColor = undefined
              }
              db?.viewnode.updateNode(id, "", "", newNodeType, JSON.stringify(content), newType)
              return {
                ...n,
                type: newType,
                data: {
                  ...n.data,
                  nodeId: "",
                  nodeType: newNodeType,
                  bgColor: content.bgColor,
                  ext: newExt,
                  etime: Date.now(),
                },
              }
            } else {
              return n
            }
          })
        )
      }
    }, [nodeType, rfIns, id, db?.viewnode])
    // 将文本节点转换为卡片节点
    const handleTransCard = useCallback(() => {
      const node = rfIns.getNode(id)
      if (!node) return
      // 创建一个新的卡片
      db?.card.createCard(getLocalSpaceId(), "default", "", node.data.ext).then((card) => {
        setMCardId(card.id)
        // 更新节点信息
        const content = parseNodeContent(node)
        content.ext = undefined
        content.styleId = node.type === VNTypeEnum.SHAPE ? NODE_STYLE_FOLD : NODE_STYLE_FULL
        const newVnType = node.type === VNTypeEnum.TEXT ? VNTypeEnum.CARD : node.type
        db?.viewnode.updateNode(
          id,
          "",
          card.id,
          NodeTypeEnum.CARD,
          JSON.stringify(content),
          newVnType
        )
        const newNode: Node<NodeData> = {
          ...node,
          type: newVnType,
          data: {
            ...node.data,
            nodeId: card.id,
            nodeType: NodeTypeEnum.CARD,
            styleId: content.styleId,
            ext: undefined,
            cardInfo: formatNodeObj(card),
          },
        }
        rfIns.setNodes((ns) => ns.map((n) => (n.id === id ? newNode : n)))
      })
    }, [db, id, rfIns, setMCardId])
    // 解除分组
    const handleUngroup = useCallback(() => {
      const node = rfIns.getNode(id)
      if (!node || !isIGroupNode(node.type) || node.data.pid) return
      const newGroupId = node.parentNode
      const group = newGroupId ? rfIns.getNode(newGroupId) : undefined
      let ns = rfIns.getOriginNodes().filter((n) => n.id !== id)
      const selectNodes = ns.filter((n) => n.parentNode === id)
      const edges = rfIns.getOriginEdges()
      // 更新分组内节点
      const nodeMap: Map<string, VNParam> = new Map()
      // 父分组为布局分组，则相当于将当前分组内所有节点拖拽到父分组中
      if (group?.data.layout) {
        const groupNodes = ns.filter((n) => n.parentNode === group.id)
        // 计算节点所处位置
        const snumMap = calcLayoutSort(groupNodes, selectNodes, group.data.layout)
        // 组装 DB 变更参数
        snumMap.forEach((snum, id) => {
          nodeMap.set(id, { groupId: group.id, position: null, snum: snum })
        })
        // 更新节点集
        ns = ns.map((n) => {
          const snum = snumMap.get(n.id)
          return snum ? { ...n, parentNode: group.id, data: { ...n.data, snum } } : n
        })
      } else {
        selectNodes.forEach((n) => {
          const pos = {
            x: n.position.x + node.position.x,
            y: n.position.y + node.position.y,
          }
          nodeMap.set(n.id, { groupId: newGroupId || "", position: pos, snum: null })
        })
        ns = ns.map((n) => {
          if (n.parentNode === id) {
            const param = nodeMap.get(n.id)
            return {
              ...n,
              parentNode: newGroupId,
              position: param?.position || n.position,
              data: { ...n.data, snum: undefined },
            }
          } else {
            return n
          }
        })
      }
      // 新分组节点宽高自适应，则应 reset 布局
      if (group) {
        const res = resetNodes(ns, new Set([group.id]), nodeMap)
        console.log("dimensionsChange res", res)
        if (res) {
          ns = res[0]
          // 这儿不能缓存已经重构的分组节点 ID，所以先注释
          if (res[1].size) gd.setResizedGroupIds(res[1])
          // if (nMap.size) {
          //   db?.viewnode.batchUpdateNodeParam(nMap)
          // }
        }
      }
      // 数据库删除节点和关联信息
      db?.viewnode.deleteNodesByIds([id])
      db?.viewnode.batchUpdateNodeParam(nodeMap)
      rfIns.setOriginNodes(ns)
      const removeEdgeIds = edges.filter((e) => e.source === id || e.target === id).map((e) => e.id)
      if (removeEdgeIds.length) {
        db?.viewedge.deleteEdgesByIds(removeEdgeIds)
        rfIns.setOriginEdges(edges.filter((e) => e.source !== id && e.target !== id))
      }
    }, [db, id, rfIns])
    // 拖拽开始事件，点击拖拽块也会触发一次 onResizeStart 和 onResizeEnd
    const onResizeStart: OnResizeStart = useCallback(
      (e, params) => {
        console.log("ReactFlow: onResizeStart", id, e, params)
        gd.setResizingId(id)
        // 不能直接使用 autoWidth，因为 onResizeStart 事件方法后，虽然 autoWidth 更新，但触发的还是原来的事件
        if (rfIns.getNode(id)?.data.autoWidth) {
          rfIns.setNodes((ns) =>
            ns.map((n) => {
              if (n.id === id) {
                const style = isShapeOrGroupNode(n.type)
                  ? { width: n.width || undefined, height: n.height || undefined }
                  : { width: n.width || undefined }
                return { ...n, style, data: { ...n.data, autoWidth: false } }
              } else {
                return n
              }
            })
          )
        }
      },
      [id, rfIns]
    )
    const onResizeEnd: OnResizeEnd = useCallback(
      (e, params) => {
        console.log("ReactFlow: onResizeEnd", id, e, params)
        gd.setResizingId("")
        rfIns.setNodes((ns) =>
          ns.map((n) => {
            if (n.id === id) {
              const content = parseNodeContent(n)
              content.width = params.width
              if (isShapeOrGroupNode(n.type)) {
                content.height = params.height
              }
              db?.viewnode.updateVNContent(id, content)
              // 导图节点尺寸更新，还需更新整个思维导图 TODO::思维导图节点暂不支持调整节点宽度
              return {
                ...n,
                data: { ...n.data, width: content.width, height: content.height },
              }
            } else {
              return n
            }
          })
        )
      },
      [db?.viewnode, id, rfIns]
    )
    // 切换自动宽度和固定宽度
    const setAutoWidth = useCallback(
      (newAutoWidth: boolean) => {
        // console.log("setAutoWidth", id, newAutoWidth)
        const nodes = rfIns.getNodes()
        const node = rfIns.getNode(id)
        if (!node || !node.positionAbsolute) return
        const content = parseNodeContent(node)
        content.autoWidth = newAutoWidth
        let newNodes: Node<NodeData>[] = []
        const nodeMap = new Map<string, XYPosition>()
        if (isIGroupNode(node.type)) {
          if (newAutoWidth) {
            const childNodes = nodes.filter((n) => n.parentNode === id)
            const { width, height, x, y } = childNodes.length
              ? calcGroupRect(childNodes)
              : emptyGroupRect(node)
            const newPos = node.position
            // 分组的坐标发生变化，需要重置分组内所有节点的相对坐标
            if (node.positionAbsolute.x !== x || node.positionAbsolute.y !== y) {
              const offsetX = x - node.positionAbsolute.x
              const offsetY = y - node.positionAbsolute.y
              newPos.x += offsetX
              newPos.y += offsetY
              // 修正节点的 position
              const group = node.parentNode ? rfIns.getNode(node.parentNode) : undefined
              if (group) {
                if (newPos.x < GROUP_PADDING) newPos.x = GROUP_PADDING
                if (newPos.y < GROUP_PADDING) newPos.y = GROUP_PADDING
              }
              content.position = newPos
              console.error("坐标变更", node.positionAbsolute, { x, y }, newPos)
              childNodes.map((n) => {
                nodeMap.set(n.id, { x: n.position.x - offsetX, y: n.position.y - offsetY })
              })
            }
            // 当前节点的宽高变更，可能导致父级分组的宽高重置，所以不应该缓存跳过
            newNodes = nodes.map((n) => {
              if (n.id === id) {
                const newData = { ...n.data, width, height, autoWidth: newAutoWidth }
                return {
                  ...n,
                  style: { width, height },
                  position: newPos,
                  width,
                  height,
                  data: newData,
                }
              } else {
                const pos = nodeMap.get(n.id)
                return pos ? { ...n, position: pos } : n
              }
            })
          } else {
            newNodes = nodes.map((n) =>
              n.id === id ? { ...n, data: { ...n.data, autoWidth: newAutoWidth } } : n
            )
          }
        } else {
          newNodes = nodes.map((n) => {
            if (n.id === id) {
              const style = newAutoWidth ? { maxWidth: content.width } : { width: content.width }
              return { ...n, style, data: { ...n.data, autoWidth: newAutoWidth } }
            } else {
              return n
            }
          })
        }
        db?.viewnode.updateVNContent(id, content)
        if (nodeMap.size) {
          db?.viewnode.batchUpdateNodePos(nodeMap)
        }
        rfIns.setOriginNodes(newNodes)
      },
      [rfIns, id, db?.viewnode]
    )
    const setBgColor = useCallback(
      (colorType?: string) => {
        rfIns.setNodes((ns) =>
          ns.map((n) => {
            if (n.id === id) {
              const content = parseNodeContent(n)
              content.bgColor = colorType
              db?.viewnode.updateVNContent(id, content)
              return { ...n, data: { ...n.data, bgColor: colorType } }
            } else {
              return n
            }
          })
        )
      },
      [rfIns, db?.viewnode, id]
    )
    // 更新节点样式
    const setNodeStyleId = useCallback(() => {
      rfIns.setNodes((ns) => {
        return ns.map((n) => {
          if (n.id === id) {
            const content = parseNodeContent(n)
            content.styleId =
              content.styleId === NODE_STYLE_FOLD ? NODE_STYLE_FULL : NODE_STYLE_FOLD
            db?.viewnode.updateVNContent(id, content)
            return { ...n, data: { ...n.data, styleId: content.styleId } }
          } else {
            return n
          }
        })
      })
    }, [db?.viewnode, id, rfIns])
    const handleMore = useCallback(
      ({ key }: { key: string }) => {
        if (key === "delete") {
          const nodes = rfIns.getOriginNodes()
          const n = rfIns.getNode(id)
          if (n) {
            const tipText = getDeleteText(nodes, [n])
            if (tipText) {
              modal.confirm({
                title: "确认删除",
                icon: <ExclamationCircleFilled />,
                content: tipText,
                okText: "确认",
                okType: "danger",
                cancelText: "取消",
                onOk: () => rfIns.deleteNodes(db, id),
              })
            } else {
              rfIns.deleteNodes(db, id)
            }
          }
        }
      },
      [db, id, modal, rfIns]
    )
    // console.log("ReactFlow: BaseNode", id)
    return (
      <>
        <BaseNodeBox
          className={cc(["baseNode", "node_" + id, "node_type_" + nodeType])}
          style={{ color }}
          token={token}
          bgColor={bg}
        >
          {nodeType === NodeTypeEnum.TEXT ? (
            <TextNode
              id={id}
              ext={ext}
              et={et}
              type={vnType}
              textNodeStyle={textNodeStyle}
              aMindNode={aMindNode}
            />
          ) : nodeType === NodeTypeEnum.CARD ? (
            <CardNode styleId={styleId} cardInfo={cardInfo} />
          ) : nodeType === NodeTypeEnum.VIEW ? (
            <ViewNode styleId={styleId} viewInfo={viewInfo} />
          ) : nodeType === NodeTypeEnum.GROUP ? (
            <GroupNode id={id} ext={ext} et={et} />
          ) : (
            <></>
          )}
          {(nodeType === NodeTypeEnum.CARD || nodeType === NodeTypeEnum.VIEW) &&
            vnType !== VNTypeEnum.SHAPE && (
              <IconBtn
                onClick={setNodeStyleId}
                type="text"
                size="small"
                className={cc([
                  "collapseBtn",
                  "hoverBgBtn",
                  {
                    collapsedRight: styleId === NODE_STYLE_FOLD,
                    viewColl: nodeType === NodeTypeEnum.VIEW,
                  },
                ])}
                icon={<IIcon icon="arrowbottom" fontSize={18} color={color} />}
              />
            )}
          {aMindNode || forbidEdit ? (
            <>
              <Handle type="source" id="sl" position={Position.Left} />
              <Handle type="source" id="sr" position={Position.Right} />
            </>
          ) : (
            <>
              <BaseHandle pos={Position.Top} id="st" />
              <BaseHandle pos={Position.Right} id="sr" />
              <BaseHandle pos={Position.Bottom} id="sb" />
              <BaseHandle pos={Position.Left} id="sl" />
            </>
          )}
        </BaseNodeBox>
        <ToolbarBox
          token={token}
          nodeId={id}
          className="nodeToolbar"
          offset={aMindNode ? 16 : 30}
          isVisible={active && !forbidEdit}
          onClick={(e) => e.stopPropagation()}
        >
          <Space size={4}>
            <BgSet
              colorType={bgColor}
              colorPrimary={token.colorPrimary}
              setColorType={setBgColor}
            />
            <IconBtn onClick={handleEdit} icon={<IIcon icon="edit" />} type="text" size="small" />
            {nodeType === NodeTypeEnum.TEXT && (
              <IconBtn
                onClick={handleTransCard}
                icon={<IIcon icon="transcard" />}
                type="text"
                size="small"
              />
            )}
            {showAutoWidth && (
              <IconBtn
                onClick={() => setAutoWidth(!autoWidth)}
                icon={<IIcon icon="fixwidth" />}
                className={cc({ selectedBtn: !autoWidth })}
                type="text"
                size="small"
              />
            )}
            {aGroupNode && !aMindNode && (
              <IconBtn
                onClick={handleUngroup}
                icon={<IIcon icon="ungroup" />}
                type="text"
                size="small"
              />
            )}
            {aGroupNode && <Align nodeId={id} layout={layout} />}
            <Dropdown
              menu={{ items: moreItems, onClick: handleMore }}
              placement="bottomRight"
              trigger={["click"]}
              overlayClassName="idropdown"
              overlayStyle={{ width: 160 }}
              align={{ targetOffset: [-6, -6] }}
            >
              <IconBtn icon={<IIcon icon="more" />} type="text" size="small" />
            </Dropdown>
          </Space>
        </ToolbarBox>
        {ctrlType > 0 && active && (
          <MyNodeResizer
            minWidth={48}
            minHeight={38}
            ctrlType={ctrlType}
            onResizeStart={onResizeStart}
            onResizeEnd={onResizeEnd}
          />
        )}
      </>
    )
  }
)

const BaseNodeBox = styled("div")(({ token, bgColor }: StyledToken & { bgColor: string }) => ({
  ".nodeItem": {
    borderColor: token.colorBgSpotlight,
    backgroundColor: bgColor,
    ".editContainer": {
      backgroundColor: "inherit",
    },
    ".ant-typography:not(a)": {
      color: "inherit",
    },
    "&:hover": {
      cursor: "pointer",
    },
    "&.editing:hover": {
      cursor: "default",
    },
  },
  "& ~ .svgNode .svgPath": {
    fill: bgColor,
    stroke: token.colorBgSpotlight,
  },
  ".leftBorder": {
    borderLeft: "4px solid " + token.colorPrimary,
  },
  ".react-flow__node.selectable.selected & .nodeItem, .react-flow__node.selectable.selected &.node_type_3":
    {
      boxShadow: "0 0 0 2px " + token.colorPrimary,
    },
  "&.mind .nodeItem": {
    boxShadow: "0 0 0 1px " + token.colorPrimary,
  },
  "&.node_type_3": {
    height: "100%",
    borderRadius: 6,
    boxShadow: "0 0 0 2px " + bgColor,
    backgroundColor: opacity(bgColor, 0.1),
    ".groupName": {
      backgroundColor: bgColor,
    },
  },
  ".intersect &.node_type_3": {
    backgroundColor: opacity(bgColor, 0.6),
  },
  ".collapseBtn": {
    position: "absolute",
    top: 7,
    left: 4,
    backgroundColor: bgColor,
    visibility: "hidden",
    "&.viewColl": {
      left: 9,
    },
  },
  ":hover .collapseBtn": {
    visibility: "visible",
  },
  // 连线锚点样式
  ".handleAnchor .anchorPointer": {
    backgroundColor: token.colorPrimary,
  },
  ".handleAnchor .anticon": {
    color: token.colorPrimary,
  },
}))
