import React, { memo, useCallback, useEffect, useMemo, useState } from "react"
import styled from "@emotion/styled"
import type {
  FilterRule,
  GanttRule,
  GrouperRule,
  NodeTypeObj,
  OptItem,
  RuleConfig,
  SorterRule,
} from "@/types"
import { IFlexR } from "@/ui"
import { shallow } from "zustand/shallow"
import { GetDBTypes, useDBStore } from "@/store"
import { Button, Divider, Form, Input, Radio, Typography } from "antd"
import { useDebounceCallback } from "@react-hook/debounce"
import { IIcon } from "@/icons"
import { IconBtn } from "@/ui"
import { CondEnum, SortEnum, SorterTypeEnum, isSelectProp } from "@/enums"
import cc from "classcat"
import { useWatch } from "antd/es/form/Form"
import { DndContext, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable } from "@dnd-kit/sortable"
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers"
import { CSS } from "@dnd-kit/utilities"

const dbTypesSelector: GetDBTypes = (state) => [state.db, state.types]

type Props = {
  spaceId: string
  viewId: string
  ruleCfg: RuleConfig
  viewType?: number
  setRuleCfg: React.Dispatch<React.SetStateAction<RuleConfig>>
  setRuleId: React.Dispatch<React.SetStateAction<string>>
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}
const isContainCond = (cond: CondEnum) => cond === CondEnum.IN || cond === CondEnum.NIN

const filterFilterRules = (filters: FilterRule[]) =>
  filters.filter(
    (rule) =>
      rule.cond === CondEnum.EMPTY ||
      rule.cond === CondEnum.NEMPTY ||
      (Array.isArray(rule.value) ? rule.value.length > 0 : rule.value)
  )
// 分组规则
type GrouperItem = {
  id: string
  name: string
  type: SorterTypeEnum
}
const baseGrouperList = [
  { id: "type_id", name: "卡片模板", disabled: false },
  { id: "create_date", name: "创建日期", disabled: false },
  { id: "update_date", name: "更新日期", disabled: false },
]
const getGrouperMap = (isKanban: boolean, typeInfo?: NodeTypeObj) => {
  const map = new Map<string, GrouperItem>()
  if (!isKanban) {
    baseGrouperList.forEach((item) => {
      map.set(item.id, { ...item, type: SorterTypeEnum.COMMON })
    })
  }
  typeInfo?.props.forEach((prop) => {
    if (!isKanban || prop.type === "select") {
      map.set(prop.id, {
        id: prop.id,
        name: prop.name,
        type: isSelectProp(prop.type) ? SorterTypeEnum.SELECT : SorterTypeEnum.COMMON,
      })
    }
  })
  return map
}

const modeOptions = [
  { label: "常规", value: SortEnum.ASC },
  { label: "紧凑", value: SortEnum.DESC },
]
const sortTypeOptions = [
  { label: "顺序", value: SortEnum.ASC },
  { label: "倒序", value: SortEnum.DESC },
]
const sortSelectTypeOptions = [
  { label: "选项顺序", value: SortEnum.ASC },
  { label: "选项倒序", value: SortEnum.DESC },
]
type RuleFormData = {
  ruleId: string
  typeId: string
  gantt?: GanttRule
  filters: FilterRule[]
  groupers: GrouperRule[]
  sorters: SorterRule[]
}

export const CardViewPanel = memo(
  ({ spaceId, viewId, ruleCfg, viewType, setRuleCfg, setRuleId, setOpen }: Props) => {
    const [tabMap, setTabMap] = useState({
      typeId: false,
      filters: false,
      groupers: false,
      sorters: false,
    })
    const [form] = Form.useForm<RuleFormData>()
    const [db, types] = useDBStore(dbTypesSelector, shallow)
    const isKanban = viewType === 2
    // ruleCfg.refreshTime 变更时，才重置表单数据
    useEffect(() => {
      form.setFieldsValue({
        ruleId: ruleCfg.ruleId,
        typeId: ruleCfg.typeId,
        filters: ruleCfg.filters,
        groupers: ruleCfg.groupers,
        sorters: ruleCfg.sorters,
      })
      setTabMap({
        typeId: !!ruleCfg.typeId,
        filters: ruleCfg.filters.length > 0,
        groupers: ruleCfg.groupers.length > 0,
        sorters: ruleCfg.sorters.length > 0,
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form, ruleCfg.refreshTime])
    // 初始化: 查询所有画布
    const [viewOpts, setViewOpts] = useState<OptItem[]>([])
    useEffect(() => {
      let queryHandler: any = null
      db?.view.getFlowViewsQuery(spaceId).then((query) => {
        queryHandler = query.$.subscribe((views) => {
          setViewOpts(views.map((v) => ({ value: v.id, label: v.name })))
        })
      })
      return () => queryHandler?.unsubscribe()
    }, [db, spaceId])
    // 视图配置更新之后，延迟同步，避免刷入关键词导致配置高频刷新
    const updateViewCfg = useDebounceCallback(
      (
        typeId: string,
        filters: FilterRule[],
        groupers: GrouperRule[],
        sorters: SorterRule[],
        gantt?: GanttRule
      ) => {
        console.log("updateViewCfg", filters, groupers, sorters, gantt)
        // 检测有效的筛选规则是否变更
        setRuleCfg((oldCfg) => {
          const newCfg = {
            ...oldCfg,
            typeId,
            gantt,
            filters: filterFilterRules(filters),
            groupers,
            sorters,
          }
          return JSON.stringify(oldCfg) === JSON.stringify(newCfg) ? oldCfg : newCfg
        })
      },
      400
    )
    const typeId = useWatch("typeId", form)
    const typeInfo = useMemo(
      () => (typeId ? types.find((t) => t.id === typeId) : undefined),
      [typeId, types]
    )
    // 计算已经选中的筛选项列表
    const formFilters = useWatch("filters", form)
    // 指定类型中所有单选属性
    const selectPropIds = useMemo(
      () => typeInfo?.props.filter((p) => p.type === "select").map((p) => p.id) || [],
      [typeInfo]
    )
    // 组装所有排序项 map
    const grouperMap = useMemo(() => getGrouperMap(isKanban, typeInfo), [isKanban, typeInfo])
    // 监听表单数据变更
    const handleValuesChange = useCallback(
      (changedValues: any, values: any) => {
        console.log("handleValuesChange", changedValues, values)
        // eslint-disable-next-line prefer-const
        let { typeId, gantt, filters, groupers, sorters } = values as RuleFormData
        let filterChange = false
        // 判断是否存在单选项的条件为包含/不包含的数据
        if (selectPropIds.length) {
          filters = filters.map((p) => {
            if (selectPropIds.includes(p.propId)) {
              if (isContainCond(p.cond) && typeof p.value === "string") {
                filterChange = true
                return { ...p, value: [] } as any
              } else if (!isContainCond(p.cond) && Array.isArray(p.value)) {
                filterChange = true
                return { ...p, value: "" }
              }
            }
            return p
          })
        }
        if (filterChange) {
          form.setFieldValue("filters", filters)
        }
        updateViewCfg(typeId, filters, groupers, sorters, gantt)
      },
      [form, selectPropIds, updateViewCfg]
    )
    // 保存视图的筛选规则
    const handleUpdateLV = useCallback(() => {
      const { ruleId, typeId, filters, groupers, sorters } = form.getFieldsValue()
      const newFilters = filterFilterRules(filters)
      db?.view.updateViewConfig(viewId, ruleId, typeId, newFilters, groupers, sorters).then(() => {
        setOpen(false)
      })
    }, [db?.view, form, setOpen, viewId])
    console.log("Render: FilterContent")
    return (
      <>
        <IForm
          form={form}
          name="cardview"
          onValuesChange={handleValuesChange}
          initialValues={{ filters: [], sorters: [] }}
          style={{ width: 348 }}
          autoComplete="off"
          size="small"
          onClick={(e) => e.stopPropagation()}
        >
          <Form.Item name="ruleId" noStyle>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name="typeId" noStyle>
            <Input type="hidden" />
          </Form.Item>
          <Form.List name="groupers">
            {(fields, { add, remove, move }) => {
              return (
                <>
                  <IFlexR className={cc({ "mb-4": fields.length > 0 })}>
                    <Typography.Text strong>卡片样式</Typography.Text>
                    <div className="flexPlace" />
                    <Button onClick={handleUpdateLV} size="small" type="primary">
                      保存
                    </Button>
                  </IFlexR>
                  <IFlexR>
                    <Typography.Text>展示模式</Typography.Text>
                    <div className="flexPlace" />
                    <Form.Item name="mode" noStyle>
                      <Radio.Group options={modeOptions} optionType="button" />
                    </Form.Item>
                  </IFlexR>
                  <IFlexR>
                    <Typography.Text>展示字段名</Typography.Text>
                    <div className="flexPlace" />
                    <Form.Item name="mode" noStyle>
                      <Radio.Group options={modeOptions} optionType="button" />
                    </Form.Item>
                  </IFlexR>
                  <Divider />
                  <DndContext
                    onDragEnd={({ active, over }: DragEndEvent) => {
                      if (over && active.id !== over.id) {
                        const items: { id: string }[] = fields.map((f) => ({
                          id: "grouper" + f.key,
                        }))
                        const oldIndex = items.findIndex((item) => item.id === active.id)
                        const newIndex = items.findIndex((item) => item.id === over.id)
                        if (oldIndex !== -1 && newIndex !== -1) {
                          move(oldIndex, newIndex)
                        }
                      }
                    }}
                    modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                  >
                    <SortableContext items={fields.map((f) => ({ id: "grouper" + f.key }))}>
                      {fields.map((field) => {
                        const rule = form.getFieldValue(["groupers", field.name]) as GrouperRule
                        const grouper = grouperMap.get(rule.propId)
                        if (!grouper) return null
                        return (
                          <GrouperItem
                            key={"group_" + field.key}
                            field={field}
                            remove={remove}
                            grouper={grouper}
                          />
                        )
                      })}
                    </SortableContext>
                  </DndContext>
                </>
              )
            }}
          </Form.List>
        </IForm>
      </>
    )
  }
)

type GrouperProp = {
  field: any
  grouper: GrouperItem
  remove: (index: number | number[]) => void
}
const GrouperItem = memo(({ field, grouper, remove }: GrouperProp) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } =
    useSortable({ id: "grouper" + field.key })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  const opts = grouper.type === SorterTypeEnum.COMMON ? sortTypeOptions : sortSelectTypeOptions
  return (
    <IFlexR ref={setNodeRef} style={style} {...attributes} className="mb-2">
      <Form.Item name={[field.name, "typeId"]} noStyle>
        <Input type="hidden" />
      </Form.Item>
      <Form.Item name={[field.name, "propId"]} noStyle>
        <Input type="hidden" />
      </Form.Item>
      <IconBtn
        {...listeners}
        ref={setActivatorNodeRef}
        icon={<IIcon icon="holder" />}
        size="small"
        type="text"
        className="holder mr-1"
        style={{ width: 16 }}
      />
      <Form.Item name={[field.name, "value"]} label={grouper?.name || ""}>
        <Radio.Group options={opts} optionType="button" />
      </Form.Item>
      <div className="flexPlace" />
      <IconBtn
        onClick={() => remove(field.name)}
        icon={<IIcon icon="close" fontSize={14} />}
        type="text"
        className="ml-2 closeBtn"
      />
    </IFlexR>
  )
})

const IForm = styled(Form)({
  ".ant-form-item": {
    marginBottom: 0,
  },
  ".ant-divider": {
    margin: "12px 0",
  },
  ".closeBtn": {
    opacity: 0.5,
  },
  ".closeBtn:hover": {
    opacity: 1,
  },
})
