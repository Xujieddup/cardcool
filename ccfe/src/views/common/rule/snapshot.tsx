import React, { memo, useCallback, useMemo, useState } from "react"
import type { RuleItem } from "@/types"
import { App, Popover, Segmented, Typography } from "antd"
import { IIcon } from "@/icons"
import { GetDB, SRuleSnap, useDBStore, useModelStore } from "@/store"
import { IFlexR, IconBtn } from "@/ui"
import styled from "@emotion/styled"
import { DndContext, DragEndEvent } from "@dnd-kit/core"
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers"
import { SortableContext, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { SegmentedValue } from "antd/es/segmented"
import { SpecialViewEnum } from "@/enums"

const dbSelector: GetDB = (state) => state.db
const ruleSnapSelector: SRuleSnap = (state) => state.setRuleSnap

type Props = {
  viewId: string
  ruleId: string
  rules: RuleItem[]
  setRuleId: (newRuleId: string) => void
}

export const RuleSnapshot = memo(({ viewId, ruleId, rules, setRuleId }: Props) => {
  const options = useMemo(
    () =>
      rules.map((r) => ({
        label: r.name || (r.id === "" ? "默认" : "未命名"),
        value: r.id,
      })),
    [rules]
  )
  const [open, setOpen] = useState(false)
  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen)
  }, [])
  const hide = !ruleId && rules.length <= 1
  const onChange = useCallback(
    (value: SegmentedValue) => {
      setRuleId(value as string)
    },
    [setRuleId]
  )
  console.log("Render: RuleSnapshot", ruleId)
  return hide ? null : (
    <IFlexR>
      <RuleList onChange={onChange} size="small" options={options} value={ruleId} />
      {viewId !== SpecialViewEnum.CARDS && (
        <Popover
          content={
            <Panel
              viewId={viewId}
              ruleId={ruleId}
              setRuleId={setRuleId}
              rules={rules}
              setOpen={setOpen}
            />
          }
          trigger="click"
          placement="bottomLeft"
          open={open}
          onOpenChange={handleOpenChange}
          overlayInnerStyle={{ maxHeight: "80vh", overflowY: "auto" }}
        >
          <IconBtn type="text" size="small" icon={<IIcon icon="vmore" />} />
        </Popover>
      )}
    </IFlexR>
  )
})

type PanelProps = Props & {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}
const Panel = memo(({ viewId, ruleId, setRuleId, rules, setOpen }: PanelProps) => {
  const db = useDBStore(dbSelector)
  const setRuleSnap = useModelStore(ruleSnapSelector)
  const { message } = App.useApp()
  // 修改
  const handleChange = useCallback(
    (ruleId: string, ruleName: string) => {
      setOpen(false)
      setRuleSnap({ viewId, ruleId: ruleId, ruleName: ruleName })
    },
    [setOpen, setRuleSnap, viewId]
  )
  // 删除
  const handleDelete = useCallback(
    (rid: string) => {
      db?.view.deleteRuleSnap(viewId, rid).then(() => {
        message.success("删除规则快照成功！")
        setOpen(false)
        ruleId === rid && setRuleId("")
      })
    },
    [db?.view, message, ruleId, setOpen, setRuleId, viewId]
  )
  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      // console.log("handleDragEnd", active, over)
      if (over && rules.length > 1 && active.id !== over.id) {
        // const currId = active.id as string
        // const oldIndex = rules.findIndex((view) => view.id === currId)
        // const newIndex = rules.findIndex((view) => view.id === over.id)
        // // 移动后的列表
        // const newViews = arrayMove(rules, oldIndex, newIndex)
        // setActiveId(undefined)
        // setInlineViews(
        //   newViews.map((v) => (nodeMap.has(v.id) ? { ...v, snum: nodeMap.get(v.id) || v.snum } : v))
        // )
        db?.view.updateRuleSnapSort(viewId, active.id as string, over.id as string)
      }
    },
    [db?.view, rules.length, viewId]
  )
  console.log("Render: Panel")
  return (
    <div style={{ width: 240 }}>
      <div className="mb-2">
        <Typography.Text strong>规则快照</Typography.Text>
      </div>
      <DndContext
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        <SortableContext items={rules}>
          {rules.map((r) => (
            <Item
              key={"rule_snap_" + r.id}
              rule={r}
              handleChange={handleChange}
              handleDelete={handleDelete}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
})

type ItemProp = {
  rule: RuleItem
  handleChange: (ruleId: string, ruleName: string) => void
  handleDelete: (ruleId: string) => void
}
const Item = memo(({ rule, handleChange, handleDelete }: ItemProp) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } =
    useSortable({ id: rule.id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  const ruleName = rule.name || (rule.id === "" ? "默认" : "未命名")
  return (
    <IFlexR ref={setNodeRef} style={style} {...attributes} className="mt-1">
      <IconBtn
        {...listeners}
        ref={setActivatorNodeRef}
        icon={<IIcon icon="holder" />}
        size="small"
        type="text"
        className="holder mr-1"
        style={{ width: 16 }}
      />
      <Typography.Text className="ml-1 flexPlace" ellipsis>
        {ruleName}
      </Typography.Text>
      <IconBtn
        onClick={() => handleChange(rule.id, rule.name)}
        icon={<IIcon icon="edit" fontSize={14} />}
        type="text"
        size="small"
        className="ml-1"
      />
      <IconBtn
        onClick={() => handleDelete(rule.id)}
        icon={<IIcon icon="delete" fontSize={14} />}
        type="text"
        size="small"
        className="ml-1"
      />
    </IFlexR>
  )
})

const RuleList = styled(Segmented)({
  fontSize: 13,
})
