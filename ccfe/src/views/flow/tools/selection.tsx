import React, { memo, useCallback, useState } from "react"
import type { NodeData, VNParam } from "@/types"
import { IIcon } from "@/icons"
import { IconBtn, ToolbarBox } from "@/ui"
import { App, Space, theme } from "antd"
import { ReactFlowState, XYPosition, useStore } from "@/reactflow"
import { useRF } from "../hooks"
import { GetDB, useDBStore } from "@/store"
import { NodeTypeEnum, VNTypeEnum } from "@/enums"
import {
  calcGroupRect,
  getDefaultNode,
  getDeleteText,
  getPositionOffset,
  nodeFactory,
  parseNodeContent,
} from "@/utils"
import { shallow } from "zustand/shallow"
import { ExclamationCircleFilled } from "@ant-design/icons"
import { BgSet } from "./bgSet"
import { Align } from "./align"

const selector = (s: ReactFlowState) => {
  let selectedNodeIds = ""
  let parentId: string | undefined = ""
  if (s.nodesSelectionActive) {
    selectedNodeIds = s
      .getNodes()
      .filter((n) => n.selected)
      .map((n) => {
        parentId = n.parentNode
        return n.id
      })
      .join(",")
  }
  return {
    selectedNodeIds: selectedNodeIds,
    parentId,
  }
}
const dbSelector: GetDB = (state) => state.db

type Props = {
  viewId: string
}

export const Selection = memo(({ viewId }: Props) => {
  const { token } = theme.useToken()
  const { selectedNodeIds, parentId } = useStore(selector, shallow)
  const db = useDBStore(dbSelector)
  const rfIns = useRF<NodeData>()
  const { modal } = App.useApp()
  const [bgColor, setBgColor] = useState<string>()
  // 创建分组: 白板上或非导图分组中，框选多个节点，创建新分组
  const createGroup = useCallback(() => {
    const selectedNodes = rfIns.getNodes().filter((n) => n.selected)
    if (!selectedNodes.length) return
    const groupId = selectedNodes[0].parentNode || ""
    const group = groupId ? rfIns.getNode(groupId) : undefined
    // 父分组是否为布局分组
    const currLayoutGroup = group && !!group.data.layout
    const { width, height, ...newGroupPos } = calcGroupRect(selectedNodes)
    const nodeMap: Map<string, VNParam> = new Map()
    // 分组内节点位置映射
    const posMap: Map<string, XYPosition> = new Map()
    // 布局分组时，选中节点中的最小 snum
    let minSnum: number | undefined = undefined
    selectedNodes.forEach((n) => {
      if (currLayoutGroup && n.data.snum && (!minSnum || minSnum > n.data.snum)) {
        minSnum = n.data.snum
      }
      if (n.positionAbsolute) {
        posMap.set(n.id, {
          x: n.positionAbsolute.x - newGroupPos.x,
          y: n.positionAbsolute.y - newGroupPos.y,
        })
      }
    })
    const vnType = VNTypeEnum.IGROUP
    const defaultNode = getDefaultNode(vnType)
    defaultNode.width = width
    defaultNode.height = height
    // 如果新分组是创建某个父分组中，则需修正其位置
    if (group) {
      if (currLayoutGroup) {
        defaultNode.snum = minSnum
      } else {
        const groupPosAbs = group.positionAbsolute || { x: 0, y: 0 }
        const offset = getPositionOffset(groupPosAbs, newGroupPos)
        newGroupPos.x = newGroupPos.x + offset.x - groupPosAbs.x
        newGroupPos.y = newGroupPos.y + offset.y - groupPosAbs.y
        defaultNode.position = newGroupPos
      }
    } else {
      defaultNode.position = newGroupPos
    }
    const content = JSON.stringify(defaultNode)
    db?.viewnode
      .addNode(viewId, groupId, "", "", NodeTypeEnum.GROUP, vnType, content)
      .then((vn) => {
        const newNode = nodeFactory(vn)
        newNode.selected = true
        newNode.data.etime = Date.now()
        posMap.forEach((pos, id) => nodeMap.set(id, { groupId: vn.id, position: pos, snum: null }))
        db?.viewnode.batchUpdateNodeParam(nodeMap)
        rfIns.setNodes((ns) => {
          return [
            newNode,
            ...ns.map((n) => {
              const pos = posMap.get(n.id)
              if (pos) {
                return currLayoutGroup
                  ? {
                      ...n,
                      parentNode: vn.id,
                      selected: false,
                      position: pos,
                      data: { ...n.data, snum: undefined },
                    }
                  : { ...n, parentNode: vn.id, selected: false, position: pos }
              } else {
                return n
              }
            }),
          ]
        })
        rfIns.setSelectionActive(false)
      })
  }, [db?.viewnode, rfIns, viewId])
  // 删除分组内所有节点
  const deleteNodes = useCallback(() => {
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
  }, [db, modal, rfIns])
  // 设置分组内所有节点的背景颜色
  const setColorType = useCallback(
    (colorType?: string) => {
      setBgColor(colorType)
      rfIns.setNodes((ns) =>
        ns.map((n) => {
          if (n.selected) {
            const content = parseNodeContent(n)
            content.bgColor = colorType
            db?.viewnode.updateVNContent(n.id, content)
            return { ...n, data: { ...n.data, bgColor: colorType } }
          } else {
            return n
          }
        })
      )
    },
    [db?.viewnode, rfIns]
  )
  console.log("Render: SelectionToolbar", selectedNodeIds)
  if (selectedNodeIds === "") {
    bgColor && setBgColor(undefined)
    return null
  }
  const nodeIds = selectedNodeIds.split(",")
  const showAlign = !parentId || !rfIns.getNode(parentId)?.data.layout
  return (
    <ToolbarBox token={token} nodeId={nodeIds} isVisible={selectedNodeIds !== ""} offset={16}>
      <Space size={4}>
        <BgSet colorType={bgColor} colorPrimary={token.colorPrimary} setColorType={setColorType} />
        {showAlign && <Align />}
        <IconBtn onClick={createGroup} icon={<IIcon icon="group" />} type="text" size="small" />
        <IconBtn onClick={deleteNodes} icon={<IIcon icon="delete" />} type="text" size="small" />
      </Space>
    </ToolbarBox>
  )
})
