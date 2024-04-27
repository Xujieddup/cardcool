import React, { memo, useCallback, useMemo, useState } from "react"
import { Dropdown, MenuProps, Typography } from "antd"
import { IFlexR, IconBtn } from "@/ui"
import { IIcon } from "@/icons"
import { useRF } from "../hooks"
import type { NodeData, VNParam } from "@/types"
import { GetDB, useDBStore } from "@/store"
import { LayoutEnum } from "@/enums"
import { resetAlign, resetNodes } from "@/utils"
import { gd } from "@/config"

const dbSelector: GetDB = (state) => state.db

type Props = {
  nodeId?: string
  layout?: LayoutEnum
}

export const Align = memo(({ nodeId, layout }: Props) => {
  const rfIns = useRF<NodeData>()
  const db = useDBStore(dbSelector)
  const [open, setOpen] = useState(false)
  // 进行布局处理
  const handleLayout = useCallback(
    (newLayout: LayoutEnum, isFix: boolean) => {
      const nodeMap: Map<string, VNParam> = new Map()
      // 获取所有需要对齐的节点
      let ns = rfIns.getOriginNodes()
      const selectNodes = nodeId
        ? ns.filter((n) => n.parentNode === nodeId)
        : ns.filter((n) => n.selected)
      // 选中节点为空，且当前为分组时，更新分组的布局类型
      if (selectNodes.length === 0) {
        const node = nodeId ? rfIns.getNode(nodeId) : undefined
        if (nodeId && node) {
          if (isFix && node.data.layout !== newLayout) {
            nodeMap.set(nodeId, { layout: newLayout })
          } else if (!isFix && node.data.layout) {
            nodeMap.set(nodeId, { layout: null })
          }
          if (nodeMap.size) {
            db?.viewnode.batchUpdateNodeParam(nodeMap)
            ns = ns.map((n) =>
              n.id === nodeId
                ? { ...n, data: { ...n.data, layout: nodeMap.get(nodeId)?.layout || undefined } }
                : n
            )
            rfIns.setOriginNodes(ns)
          }
        }
        return
      }
      const group = selectNodes[0].parentNode ? rfIns.getNode(selectNodes[0].parentNode) : undefined
      const groupPosAbs = group?.positionAbsolute || { x: 0, y: 0 }
      if (group && group.data.layout) {
        // 节点选区对应分组已经固定布局，则当前选区不能修改布局
        if (!nodeId) return
        if (isFix) {
          // 点击当前固定布局，不进行处理
          if (group.data.layout === newLayout) return
          // 之前有固定布局，现在更新固定布局，更新分组 layout 和节点 snum
          ns = ns.map((n) => {
            if (n.id === group.id) {
              nodeMap.set(n.id, { layout: newLayout })
              return { ...n, data: { ...n.data, layout: newLayout } }
            } else {
              return n
            }
          })
        } else {
          // 之前有固定布局，现在没有固定布局，更新分组 layout 和节点 snum
          const posMap = resetAlign(selectNodes, newLayout)
          ns = ns.map((n) => {
            if (n.id === group.id) {
              nodeMap.set(n.id, { layout: null })
              return { ...n, data: { ...n.data, layout: undefined } }
            } else {
              const pos = posMap.get(n.id)
              if (pos) {
                const newPos = { x: pos.x - groupPosAbs.x, y: pos.y - groupPosAbs.y }
                nodeMap.set(n.id, { position: newPos, snum: null })
                return {
                  ...n,
                  position: newPos,
                  positionAbsolute: pos,
                  data: { ...n.data, snum: undefined },
                }
              } else {
                return n
              }
            }
          })
        }
      } else {
        const posMap = resetAlign(selectNodes, newLayout)
        // 之前没有固定布局，现在固定布局，更新分组 layout 和节点 snum
        if (isFix && group) {
          ns = ns.map((n) => {
            if (n.id === group.id) {
              nodeMap.set(n.id, { layout: newLayout })
              return { ...n, data: { ...n.data, layout: newLayout } }
            } else if (posMap.has(n.id)) {
              const snum = posMap.get(n.id)?.snum || 10000
              nodeMap.set(n.id, { position: null, snum })
              return { ...n, data: { ...n.data, snum } }
            } else {
              return n
            }
          })
        } else {
          // 之前没有固定布局，现在也没有固定布局，直接更新节点坐标
          ns = ns.map((node) => {
            const pos = posMap.get(node.id)
            if (pos) {
              const newPos = { x: pos.x - groupPosAbs.x, y: pos.y - groupPosAbs.y }
              if (node.position.x !== newPos.x || node.position.y !== newPos.y) {
                nodeMap.set(node.id, { position: newPos })
              }
              return { ...node, position: newPos, positionAbsolute: pos }
            } else {
              return node
            }
          })
        }
      }
      if (group) {
        const res = resetNodes(ns, new Set([group.id]), nodeMap)
        if (res) {
          ns = res[0]
          if (res[1].size) gd.setResizedGroupIds(res[1])
        }
      }
      rfIns.setOriginNodes(ns)
      if (nodeMap.size) {
        db?.viewnode.batchUpdateNodeParam(nodeMap)
      }
    },
    [db, nodeId, rfIns]
  )
  const handleOpenChange = (flag: boolean) => {
    setOpen(flag)
  }
  const handleFixLayout = useCallback(
    (layout: LayoutEnum, event: React.MouseEvent) => {
      event.stopPropagation()
      handleLayout(layout, true)
      setOpen(false)
    },
    [handleLayout]
  )
  const alignItems: MenuProps["items"] = useMemo(
    () => [
      {
        key: LayoutEnum.ALIGNL,
        label: (
          <IFlexR>
            <IIcon icon="alignl" />
            <Typography.Text>左对齐</Typography.Text>
            {nodeId && (
              <IconBtn
                icon={<IIcon icon="fixalign" />}
                className="fixedBtn"
                type="text"
                size="small"
                onClick={(e) => handleFixLayout(LayoutEnum.ALIGNL, e)}
              />
            )}
          </IFlexR>
        ),
      },
      {
        key: LayoutEnum.ALIGNCV,
        label: (
          <IFlexR>
            <IIcon icon="aligncv" />
            <Typography.Text>垂直居中</Typography.Text>
            {nodeId && (
              <IconBtn
                icon={<IIcon icon="fixalign" />}
                className="fixedBtn"
                type="text"
                size="small"
                onClick={(e) => handleFixLayout(LayoutEnum.ALIGNCV, e)}
              />
            )}
          </IFlexR>
        ),
      },
      {
        key: LayoutEnum.ALIGNR,
        label: (
          <IFlexR>
            <IIcon icon="alignr" />
            <Typography.Text>右对齐</Typography.Text>
            {nodeId && (
              <IconBtn
                icon={<IIcon icon="fixalign" />}
                className="fixedBtn"
                type="text"
                size="small"
                onClick={(e) => handleFixLayout(LayoutEnum.ALIGNR, e)}
              />
            )}
          </IFlexR>
        ),
      },
      {
        type: "divider",
      },
      {
        key: LayoutEnum.ALIGNT,
        label: (
          <IFlexR>
            <IIcon icon="alignt" />
            <Typography.Text>上对齐</Typography.Text>
            {nodeId && (
              <IconBtn
                icon={<IIcon icon="fixalign" />}
                className="fixedBtn"
                type="text"
                size="small"
                onClick={(e) => handleFixLayout(LayoutEnum.ALIGNT, e)}
              />
            )}
          </IFlexR>
        ),
      },
      {
        key: LayoutEnum.ALIGNCH,
        label: (
          <IFlexR>
            <IIcon icon="alignch" />
            <Typography.Text>水平居中</Typography.Text>
            {nodeId && (
              <IconBtn
                icon={<IIcon icon="fixalign" />}
                className="fixedBtn"
                type="text"
                size="small"
                onClick={(e) => handleFixLayout(LayoutEnum.ALIGNCH, e)}
              />
            )}
          </IFlexR>
        ),
      },
      {
        key: LayoutEnum.ALIGNB,
        label: (
          <IFlexR>
            <IIcon icon="alignb" />
            <Typography.Text>下对齐</Typography.Text>
            {nodeId && (
              <IconBtn
                icon={<IIcon icon="fixalign" />}
                className="fixedBtn"
                type="text"
                size="small"
                onClick={(e) => handleFixLayout(LayoutEnum.ALIGNB, e)}
              />
            )}
          </IFlexR>
        ),
      },
    ],
    [handleFixLayout, nodeId]
  )
  const handleAlign = useCallback(
    ({ key }: { key: string }) => {
      handleLayout(key as LayoutEnum, false)
      setOpen(false)
    },
    [handleLayout]
  )
  return (
    <Dropdown
      menu={{
        items: alignItems,
        onClick: handleAlign,
        selectedKeys: layout ? [layout] : undefined,
      }}
      placement="bottomRight"
      trigger={["click"]}
      overlayClassName="idropdown aligndropdown"
      overlayStyle={{ width: 160 }}
      align={{ targetOffset: [-6, -6] }}
      onOpenChange={handleOpenChange}
      open={open}
    >
      {layout ? (
        <IconBtn icon={<IIcon icon={layout} />} className="selectedBtn" type="text" size="small" />
      ) : (
        <IconBtn icon={<IIcon icon="alignl" />} type="text" size="small" />
      )}
    </Dropdown>
  )
})
