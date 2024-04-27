import React, { memo, useCallback, useState } from "react"
import type { View, ViewConf } from "@/types"
import { AddSmallBtn, IFlexR } from "@/ui"
import { GetDB, SetMEditView, useDBStore } from "@/store"
import { Popover, Typography } from "antd"
import { IIcon } from "@/icons"
import { IconBtn } from "@/ui"
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ViewInlineType, ViewTypeEnum } from "@/enums"
import { DndContext, DragEndEvent } from "@dnd-kit/core"
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers"

const dbSelector: GetDB = (state) => state.db

type Props = {
  spaceId: string
  viewId: string
  mainViewId: string
  viewConf: ViewConf
  viewType: ViewTypeEnum
  inlineViews: View[]
  setInlineViews: React.Dispatch<React.SetStateAction<View[]>>
  setMEditView: SetMEditView
  showDeleteConfirm: (id: string) => void
}

export const InlineManager = memo(
  ({
    spaceId,
    viewId,
    mainViewId,
    viewConf,
    viewType,
    inlineViews,
    setInlineViews,
    setMEditView,
    showDeleteConfirm,
  }: Props) => {
    const [open, setOpen] = useState(false)
    const handleOpenChange = useCallback((newOpen: boolean) => {
      setOpen(newOpen)
    }, [])
    console.log("Render: InlineManager")
    return (
      <Popover
        content={
          <InlinePanel
            spaceId={spaceId}
            viewId={viewId}
            mainViewId={mainViewId || viewId}
            viewConf={viewConf}
            viewType={viewType}
            inlineViews={inlineViews}
            setOpen={setOpen}
            setInlineViews={setInlineViews}
            setMEditView={setMEditView}
            showDeleteConfirm={showDeleteConfirm}
          />
        }
        trigger="click"
        placement="bottomRight"
        onOpenChange={handleOpenChange}
        open={open}
      >
        <IconBtn className="mr-1 shrink" type="text" icon={<IIcon icon="vmore" />} />
      </Popover>
    )
  }
)

type PanelProps = Props & {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}
const InlinePanel = memo(
  ({
    spaceId,
    viewId,
    mainViewId,
    viewConf,
    viewType,
    inlineViews,
    setInlineViews,
    setMEditView,
    showDeleteConfirm,
    setOpen,
  }: PanelProps) => {
    const db = useDBStore(dbSelector)
    // 创建内联视图
    const handleAddView = useCallback(() => {
      setOpen(false)
      setMEditView({
        viewId: "",
        spaceId: spaceId,
        pid: mainViewId || viewId,
        currType: viewType,
        inlineType: ViewInlineType.INLINE,
      })
    }, [mainViewId, setMEditView, setOpen, spaceId, viewId, viewType])
    // 修改视图
    const handleChangeView = useCallback(
      (vId: string) => {
        setOpen(false)
        setMEditView({ viewId: vId, spaceId: spaceId })
      },
      [setMEditView, setOpen, spaceId]
    )
    // 删除视图
    const handleDeleteView = useCallback(
      (vId: string) => {
        setOpen(false)
        showDeleteConfirm(vId)
      },
      [setOpen, showDeleteConfirm]
    )
    const handleDragEnd = useCallback(
      ({ active, over }: DragEndEvent) => {
        // console.log("handleDragEnd", active, over)
        if (over && inlineViews.length > 1 && active.id !== over.id) {
          const currId = active.id as string
          const oldIndex = inlineViews.findIndex((view) => view.id === currId)
          if (oldIndex === -1) {
            return
          }
          const newIndex = inlineViews.findIndex((view) => view.id === over.id)
          // 移动后的列表
          const newViews = arrayMove(inlineViews, oldIndex, newIndex)
          // 需要变更的数据
          const nodeMap: Map<string, number> = new Map()
          const idx = newViews.findIndex((i) => i.id === currId)
          // 判断新位置的前一个节点
          const prevItem = idx <= 0 ? undefined : newViews[idx - 1]
          const nextItem = idx >= newViews.length ? undefined : newViews[idx + 1]
          if (newViews.length === 1) {
            // 只有一个节点，则 snum 置为 10000
            nodeMap.set(currId, 10000)
          } else {
            if (!prevItem) {
              // 移动到第一个位置，则判断第二个位置的节点的 snum 是否大于 0
              if (nextItem && nextItem.snum > 1) {
                // 只需更新当前节点的 snum
                nodeMap.set(currId, Math.floor(nextItem.snum / 2))
              } else {
                // 当前节点的 snum 置为 10000，后面的节点依次叠加 10000
                let snum = 10000
                nodeMap.set(currId, snum)
                newViews.forEach((i, index) => {
                  if (index > idx) {
                    snum += 10000
                    nodeMap.set(i.id, snum)
                  }
                })
              }
            } else if (!nextItem) {
              // 移动到最后一个位置，则在前一个位置的节点的 snum + 10000
              nodeMap.set(currId, prevItem.snum + 10000)
            } else {
              // 移动到中间位置，则计算前后位置节点的 snum 的平均值
              const middleSnum = Math.floor((prevItem.snum + nextItem.snum) / 2)
              // 中间值如果和前一个值相等，则在前一个值的基础上，依次叠加 10000
              if (middleSnum === prevItem.snum) {
                let snum = middleSnum + 10000
                nodeMap.set(currId, snum)
                newViews.forEach((i, index) => {
                  if (index > idx) {
                    snum += 10000
                    nodeMap.set(i.id, snum)
                  }
                })
              } else {
                // 否则直接应用中间值
                nodeMap.set(currId, middleSnum)
              }
            }
          }
          // setActiveId(undefined)
          setInlineViews(
            newViews.map((v) =>
              nodeMap.has(v.id) ? { ...v, snum: nodeMap.get(v.id) || v.snum } : v
            )
          )
          db?.view.batchUpdateSortViews(nodeMap)
        }
      },
      [db?.view, inlineViews, setInlineViews]
    )
    console.log("Render: InlinePanel")
    return (
      <div style={{ width: 300 }}>
        <IFlexR>
          <Typography.Text strong>内联视图</Typography.Text>
          <div className="flexPlace" />
          {viewConf.inlineView && (
            <AddSmallBtn
              onClick={handleAddView}
              type="primary"
              icon={<IIcon icon="plus" fontSize={14} />}
              size="small"
            >
              新视图
            </AddSmallBtn>
          )}
        </IFlexR>
        <DndContext
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
        >
          <SortableContext items={inlineViews}>
            {inlineViews.map((v) => (
              <Item
                key={"inline_view_" + v.id}
                view={v}
                handleChangeView={handleChangeView}
                handleDeleteView={handleDeleteView}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    )
  }
)

type ItemProp = {
  view: View
  handleChangeView: (id: string) => void
  handleDeleteView: (id: string) => void
}
const Item = memo(({ view, handleChangeView, handleDeleteView }: ItemProp) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } =
    useSortable({ id: view.id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <IFlexR ref={setNodeRef} style={style} {...attributes} className="mt-2">
      <IconBtn
        {...listeners}
        ref={setActivatorNodeRef}
        icon={<IIcon icon="holder" />}
        size="small"
        type="text"
        className="holder mr-1"
        style={{ width: 16 }}
      />
      <IIcon icon={view.icon} />
      <Typography.Text className="ml-1 flexPlace" ellipsis>
        {view.name}
      </Typography.Text>
      <IconBtn
        onClick={() => handleChangeView(view.id)}
        icon={<IIcon icon="edit" fontSize={14} />}
        type="text"
        size="small"
        className="ml-1"
      />
      <IconBtn
        onClick={() => handleDeleteView(view.id)}
        icon={<IIcon icon="delete" fontSize={14} />}
        type="text"
        size="small"
        className="ml-1"
      />
    </IFlexR>
  )
})
