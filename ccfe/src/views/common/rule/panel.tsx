import React, { memo, useCallback, useEffect, useMemo, useState } from "react"
import styled from "@emotion/styled"
import type {
  DateRule,
  FilterRule,
  GanttRule,
  GrouperRule,
  NodeTypeObj,
  OptItem,
  RuleConfig,
  SorterRule,
} from "@/types"
import { AddSmallBtn, IFlexR, IFlexRB } from "@/ui"
import { shallow } from "zustand/shallow"
import {
  GetDBTypes,
  GetTagMap,
  GetViewConfFunc,
  SMEditView,
  SRuleSnap,
  useConfigStore,
  useDBStore,
  useModelStore,
} from "@/store"
import {
  Button,
  Divider,
  Dropdown,
  Form,
  Input,
  InputNumber,
  MenuProps,
  Radio,
  Select,
  Tooltip,
  Typography,
} from "antd"
import { useDebounceCallback } from "@react-hook/debounce"
import { IIcon } from "@/icons"
import { IconBtn } from "@/ui"
import { StoreValue } from "antd/es/form/interface"
import {
  CondEnum,
  DateRuleEnum,
  DateRuleUnitEnum,
  FilterTypeEnum,
  SortEnum,
  SorterTypeEnum,
  SpecialViewEnum,
  ViewInlineType,
  ViewTypeEnum,
  isSelectProp,
} from "@/enums"
import cc from "classcat"
import dayjs from "dayjs"
import { useWatch } from "antd/es/form/Form"
import { DateModal } from "./dateModal"
import { isAbsRule, parseDateRuleDesc, unid } from "@/utils"
import { DndContext, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable } from "@dnd-kit/sortable"
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers"
import { CSS } from "@dnd-kit/utilities"

const dbTypesSelector: GetDBTypes = (state) => [state.db, state.types]
const tagSelector: GetTagMap = (state) => state.tagMap
const mViewelector: SMEditView = (state) => state.setMEditView
const ruleSnapSelector: SRuleSnap = (state) => state.setRuleSnap
const viewConfSelector: GetViewConfFunc = (state) => state.viewConf

type Props = {
  spaceId: string
  viewId: string
  ruleCfg: RuleConfig
  viewType?: number
  setRuleCfg: (func: (oldCfg: RuleConfig) => RuleConfig) => void
  setRuleId: (newRuleId: string) => void
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}
type FilterItem = {
  id: string
  name: string
  type: FilterTypeEnum
  selected: boolean
  opts?: OptItem[]
}
// 没有选择模板的过滤字段
const filterList: FilterItem[] = [
  { id: "name", name: "卡片名称", type: FilterTypeEnum.TEXT, selected: false },
  { id: "tags", name: "卡片标签", type: FilterTypeEnum.TAGS, selected: false },
  { id: "create_time", name: "创建时间", type: FilterTypeEnum.DATE, selected: false },
  { id: "update_time", name: "更新时间", type: FilterTypeEnum.DATE, selected: false },
]
const getFilterIndex = (filterMap: Map<string, FilterItem>, propId: string) => {
  let i = 0
  let index = 0
  filterMap.forEach((value, key) => {
    if (key === propId) {
      index = i
    }
    if (value.selected) {
      i++
    }
  })
  return index
}
// 获取条件列表
const getCondType = (propType: string) => {
  return propType === "number"
    ? FilterTypeEnum.NUMBER
    : propType === "select"
    ? FilterTypeEnum.SELECT
    : propType === "mselect"
    ? FilterTypeEnum.MSELECT
    : propType === "date"
    ? FilterTypeEnum.DATE
    : propType === "tags"
    ? FilterTypeEnum.TAGS
    : // name/text/...
      FilterTypeEnum.TEXT
}
const isSelectFilterType = (type: FilterTypeEnum) =>
  type === FilterTypeEnum.SELECT || type === FilterTypeEnum.MSELECT
const isNotEmptyCond = (cond: CondEnum) => cond !== CondEnum.EMPTY && cond !== CondEnum.NEMPTY
const isContainCond = (cond: CondEnum) => cond === CondEnum.IN || cond === CondEnum.NIN

// 通用条件列表，适用于文本类型属性
const commonConds = [
  { value: CondEnum.EQ, label: "等于" },
  { value: CondEnum.NEQ, label: "不等于" },
  { value: CondEnum.IN, label: "包含" },
  { value: CondEnum.NIN, label: "不包含" },
  { value: CondEnum.EMPTY, label: "为空" },
  { value: CondEnum.NEMPTY, label: "不为空" },
]
// 数字条件列表，适用于数字类型属性
const numberConds = [
  { value: CondEnum.EQ, label: "等于" },
  { value: CondEnum.NEQ, label: "不等于" },
  { value: CondEnum.GT, label: "大于" },
  { value: CondEnum.GET, label: "大等于" },
  { value: CondEnum.LT, label: "小于" },
  { value: CondEnum.LET, label: "小等于" },
  { value: CondEnum.EMPTY, label: "为空" },
  { value: CondEnum.NEMPTY, label: "不为空" },
]
// 日期条件列表，适用于日期类型属性
const dateConds = [
  { value: CondEnum.DRULE, label: "自定义" },
  { value: CondEnum.EMPTY, label: "为空" },
  { value: CondEnum.NEMPTY, label: "不为空" },
]
// 标签条件列表
const tagConds = [
  { value: CondEnum.IN, label: "包含任一" },
  { value: CondEnum.INALL, label: "包含所有" },
  { value: CondEnum.NIN, label: "不包含" },
  { value: CondEnum.EMPTY, label: "为空" },
  { value: CondEnum.NEMPTY, label: "不为空" },
]
// 通用日期条件列表，适用于创建时间/更新时间
const commonDateConds = [{ value: CondEnum.DRULE, label: "自定义" }]
// 相等条件列表，适用于通用属性的选择，如：白板、卡片模板
const eqConds = [{ value: CondEnum.EQ, label: "等于" }]
const filterFilterRules = (filters: FilterRule[]) =>
  filters.filter(
    (rule) =>
      rule.cond === CondEnum.EMPTY ||
      rule.cond === CondEnum.NEMPTY ||
      (Array.isArray(rule.value) ? rule.value.length > 0 : rule.value)
  )
const getFilterMap = (selectedIds: Set<string>, typeInfo?: NodeTypeObj) => {
  const map = new Map<string, FilterItem>()
  map.set("board", {
    id: "board",
    name: "所属白板",
    type: FilterTypeEnum.CUSTOM,
    selected: selectedIds.has("board"),
  })
  //  指定模板，则展示模板属性样式
  if (typeInfo) {
    typeInfo.props.forEach((prop) => {
      const opts = prop.options?.map((o) => ({ value: o.id, label: o.label }))
      map.set(prop.id, {
        id: prop.id,
        name: prop.name,
        type: getCondType(prop.type),
        selected: selectedIds.has(prop.id),
        opts,
      })
    })
  } else {
    filterList.forEach((item) => {
      map.set(item.id, { ...item, selected: selectedIds.has(item.id) })
    })
  }
  return map
}
const getFilterItems = (selectedIds: Set<string>, typeInfo?: NodeTypeObj): MenuProps["items"] => {
  let items: MenuProps["items"] = []
  //  指定模板，则展示模板属性样式
  if (typeInfo) {
    items = typeInfo.props.map((prop) => ({
      key: prop.id,
      label: prop.name,
      disabled: selectedIds.has(prop.id),
    }))
  } else {
    items = filterList.map((o) => ({
      key: o.id,
      label: o.name,
      disabled: selectedIds.has(o.id),
    }))
  }
  return [
    {
      key: typeInfo?.id || "common_props",
      type: "group",
      label: typeInfo?.name || "通用",
      children: items,
    },
    { type: "divider" },
    { key: "board", label: "所属白板", disabled: selectedIds.has("board") },
  ]
}
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
  if (typeInfo) {
    typeInfo.props.forEach((prop) => {
      if (isKanban ? prop.type === "select" : allowGroupPropType(prop.type)) {
        const t = isSelectProp(prop.type) ? SorterTypeEnum.SELECT : SorterTypeEnum.COMMON
        if (prop.id === "create_time") {
          map.set("create_date", { id: "create_date", name: "创建日期", type: t })
        } else if (prop.id === "update_time") {
          map.set("update_date", { id: "update_date", name: "更新日期", type: t })
        } else {
          map.set(prop.id, { id: prop.id, name: prop.name, type: t })
        }
      }
    })
  } else {
    if (!isKanban) {
      baseGrouperList.forEach((item) => {
        map.set(item.id, { ...item, type: SorterTypeEnum.COMMON })
      })
    }
  }
  return map
}
const getGrouperItems = (selectedIds: Set<string>, isKanban: boolean, typeInfo?: NodeTypeObj) => {
  let list: MenuProps["items"] = []
  if (typeInfo) {
    const props = typeInfo.props.filter((prop) =>
      isKanban ? prop.type === "select" : allowGroupPropType(prop.type)
    )
    const items = props.length
      ? props.map((prop) => {
          if (prop.id === "create_time") {
            return {
              key: "create_date",
              label: "创建日期",
              disabled: selectedIds.has("create_date"),
            }
          } else if (prop.id === "update_time") {
            return {
              key: "update_date",
              label: "更新日期",
              disabled: selectedIds.has("update_date"),
            }
          } else {
            return {
              key: prop.id,
              label: prop.name,
              disabled: selectedIds.has(prop.id),
            }
          }
        })
      : [{ key: "", label: "无单选属性", disabled: true }]
    list = [{ key: typeInfo.id, type: "group", label: typeInfo.name, children: items }]
  } else {
    if (!isKanban) {
      list = baseGrouperList.map((o) => ({
        key: o.id,
        label: o.name,
        disabled: selectedIds.has(o.id),
      }))
    } else {
      list = [{ key: "", label: "无分组属性", disabled: true }]
    }
  }
  return list
}
// 允许用于分组的字段类型
const allowGroupPropType = (t: string) => t === "select" || t === "date"
// 排序规则
type SorterItem = {
  id: string
  name: string
  type: SorterTypeEnum
}
const baseSorterList = [
  { id: "name", name: "卡片名称", disabled: false },
  { id: "create_time", name: "创建时间", disabled: false },
  { id: "update_time", name: "更新时间", disabled: false },
]
const sortTypeOptions = [
  { label: "顺序", value: SortEnum.ASC },
  { label: "倒序", value: SortEnum.DESC },
]
const sortSelectTypeOptions = [
  { label: "选项顺序", value: SortEnum.ASC },
  { label: "选项倒序", value: SortEnum.DESC },
]
// 禁止用于排序的字段类型
const forbidSortPropType = (t: string) => t === "password"
const getSorterMap = (typeInfo?: NodeTypeObj) => {
  const map = new Map<string, SorterItem>()
  //  指定模板，则展示模板属性样式
  if (typeInfo) {
    typeInfo.props.forEach((prop) => {
      !forbidSortPropType(prop.type) &&
        map.set(prop.id, {
          id: prop.id,
          name: prop.name,
          type: isSelectProp(prop.type) ? SorterTypeEnum.SELECT : SorterTypeEnum.COMMON,
        })
    })
  } else {
    baseSorterList.forEach((item) => {
      map.set(item.id, { ...item, type: SorterTypeEnum.COMMON })
    })
  }
  return map
}
const getSorterItems = (selectedIds: Set<string>, typeInfo?: NodeTypeObj) => {
  let list: MenuProps["items"] = []
  //  指定模板，则展示模板属性样式
  if (typeInfo) {
    const items = typeInfo.props
      .filter((prop) => !forbidSortPropType(prop.type))
      .map((prop) => ({
        key: prop.id,
        label: prop.name,
        disabled: selectedIds.has(prop.id),
      }))
    list = [{ key: typeInfo.id, type: "group", label: typeInfo.name, children: items }]
  } else {
    list = baseSorterList.map((o) => ({
      key: o.id,
      label: o.name,
      disabled: selectedIds.has(o.id),
    }))
  }
  return list
}
type RuleFormData = {
  ruleId: string
  typeId: string
  gantt?: GanttRule
  filters: FilterRule[]
  groupers: GrouperRule[]
  sorters: SorterRule[]
}

export const RulePanel = memo(
  ({ spaceId, viewId, ruleCfg, viewType, setRuleCfg, setRuleId, setOpen }: Props) => {
    const isKanban = viewType === ViewTypeEnum.KANBAN
    const isGantt = viewType === ViewTypeEnum.GANTT
    // 是否强制选择模板
    const isForceType = isKanban || isGantt
    const [tabMap, setTabMap] = useState({
      typeId: false,
      filters: false,
      groupers: false,
      sorters: false,
    })
    const [form] = Form.useForm<RuleFormData>()
    const [db, types] = useDBStore(dbTypesSelector, shallow)
    const tagMap = useDBStore(tagSelector)
    const setMEditView = useModelStore(mViewelector)
    const viewConf = useConfigStore(viewConfSelector)
    // ruleCfg.refreshTime 变更时，才重置表单数据
    useEffect(() => {
      form.setFieldsValue({
        ruleId: ruleCfg.ruleId,
        typeId: ruleCfg.typeId,
        gantt: ruleCfg.gantt,
        filters: ruleCfg.filters,
        groupers: ruleCfg.groupers,
        sorters: ruleCfg.sorters,
      })
      setTabMap({
        typeId: !!ruleCfg.typeId || isForceType,
        filters: ruleCfg.filters.length > 0,
        groupers: ruleCfg.groupers.length > 0 || isKanban,
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
    // 初始化: 查询所有标签
    const tags = useMemo(
      () => Array.from(tagMap.values()).map((t) => ({ value: t.id, label: t.name })),
      [tagMap]
    )
    // 视图配置更新之后，延迟同步，避免刷入关键词导致配置高频刷新
    const updateViewCfg = useDebounceCallback(
      (
        typeId: string,
        filters: FilterRule[],
        groupers: GrouperRule[],
        sorters: SorterRule[],
        gantt?: GanttRule
      ) => {
        console.log("updateViewCfg", filters, groupers, sorters, gantt, gantt)
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
    // 限定卡片模板
    const typeItems = useMemo(() => types.map((v) => ({ key: v.id, label: v.name })), [types])
    const selectTypeId = useCallback(
      (typeId: string) => {
        // eslint-disable-next-line prefer-const
        let { typeId: oldTypeId, filters, groupers, sorters } = form.getFieldsValue()
        if (typeId === oldTypeId) return
        let gantt: GanttRule | undefined = undefined
        if (isGantt) {
          // 找到第一个日期字段
          const datePropIds = typeId
            ? types
                .find((t) => t.id === typeId)
                ?.props.filter((p) => p.type === "date")
                .map((p) => p.id)
            : undefined
          if (datePropIds) {
            const startPropId = datePropIds.length > 0 ? datePropIds[0] : "create_time"
            const endPropId = datePropIds.length > 1 ? datePropIds[1] : startPropId
            gantt = { start: startPropId, end: endPropId, text: "name" }
          } else {
            gantt = { start: "", end: "", text: "name" }
          }
          form.setFieldValue("gantt", gantt)
        }
        if (filters.some((r) => r.typeId !== "" && r.typeId !== typeId)) {
          filters = filters.filter((r) => r.typeId === "" || r.typeId === typeId)
          form.setFieldValue("filters", filters)
        }
        if (groupers.some((r) => r.typeId !== "" && r.typeId !== typeId)) {
          groupers = groupers.filter((r) => r.typeId === "" || r.typeId === typeId)
          form.setFieldValue("groupers", groupers)
        }
        if (sorters.some((r) => r.typeId !== "" && r.typeId !== typeId)) {
          sorters = sorters.filter((r) => r.typeId === "" || r.typeId === typeId)
          form.setFieldValue("sorters", sorters)
        }
        form.setFieldValue("typeId", typeId)
        updateViewCfg(typeId, filters, groupers, sorters, gantt)
      },
      [form, isGantt, types, updateViewCfg]
    )
    const typeId = useWatch("typeId", form)
    const typeInfo = useMemo(() => {
      const info = typeId ? types.find((t) => t.id === typeId) : undefined
      if (!info) return undefined
      // 处理一下属性列表，之前的没有 name 和 tag，需要补充，另外需要删除 content(当前暂不支持)
      let hasName = false
      let hasTags = false
      const items = info.props.filter((prop) => {
        if (prop.id === "name") hasName = true
        if (prop.id === "tags") hasTags = true
        return prop.id !== "content"
      })
      if (!hasTags) items.unshift({ id: "tags", name: "卡片标签", type: "tags" })
      if (!hasName) items.unshift({ id: "name", name: "卡片名称", type: "name" })
      items.push({ id: "create_time", name: "创建时间", type: "date" })
      items.push({ id: "update_time", name: "更新时间", type: "date" })
      return { ...info, props: items } as NodeTypeObj
    }, [typeId, types])
    // 日期属性列表
    const dateProps = useMemo(
      () =>
        typeInfo?.props
          .filter((p) => p.type === "date")
          .map((p) => ({ value: p.id, label: p.name })) || [],
      [typeInfo]
    )
    // 甘特图展示只支持展示卡片名字
    const allProps = useMemo(
      // () => typeInfo?.props.map((p) => ({ value: p.id, label: p.name })) || [],
      () =>
        typeInfo?.props
          .filter((p) => p.id === "name")
          .map((p) => ({ value: p.id, label: p.name })) || [],
      [typeInfo]
    )
    // 计算已经选中的筛选项列表
    const formFilters = useWatch("filters", form)
    // 指定模板中所有单选属性
    const selectPropIds = useMemo(
      () => typeInfo?.props.filter((p) => p.type === "select").map((p) => p.id) || [],
      [typeInfo]
    )
    // 已经选中的筛选项
    const selectedfilterIds = useMemo(
      () => new Set(formFilters?.map((r) => r.propId)),
      [formFilters]
    )
    // 组装所有筛选项 map
    const filterMap = useMemo(
      () => getFilterMap(selectedfilterIds, typeInfo),
      [typeInfo, selectedfilterIds]
    )
    const filterItems = useMemo(
      () => getFilterItems(selectedfilterIds, typeInfo),
      [typeInfo, selectedfilterIds]
    )
    const addItem = useCallback(
      (add: (defaultValue?: StoreValue, insertIndex?: number) => void, key: string) => {
        const idx = getFilterIndex(filterMap, key)
        const filter = filterMap.get(key)
        if (!filter) return
        switch (key) {
          case "name":
          case "board":
            add({ typeId: "", propId: key, cond: CondEnum.EQ, value: "" }, idx)
            break
          case "tags":
            add({ typeId: "", propId: key, cond: CondEnum.IN, value: [] }, idx)
            break
          case "create_time":
          case "update_time":
            add({ typeId: "", propId: key, cond: CondEnum.DRULE, value: "" }, idx)
            break
          default:
            add(
              {
                typeId: typeInfo?.id,
                propId: key,
                cond: filter.type === FilterTypeEnum.DATE ? CondEnum.DRULE : CondEnum.EQ,
                value: filter.type === FilterTypeEnum.MSELECT ? [] : "",
              },
              idx
            )
            break
        }
      },
      [filterMap, typeInfo]
    )
    // 设置需要编辑的日期筛选规则 originDateRule
    const [odr, setODR] = useState<DateRule>()
    const openDateRule = useCallback((propId: string, value: any) => {
      setODR(
        value === ""
          ? {
              propId,
              type: DateRuleEnum.DAD,
              unit: DateRuleUnitEnum.DAY,
              start: null,
              end: null,
            }
          : ({
              ...value,
              propId,
              start:
                value.start && isAbsRule(value.type)
                  ? dayjs(value.start, "YYYY-MM-DD")
                  : value.start,
              end: value.end && isAbsRule(value.type) ? dayjs(value.end, "YYYY-MM-DD") : value.end,
            } as DateRule)
      )
    }, [])
    const updateDateRule = useCallback(
      (dateRule?: DateRule) => {
        if (!dateRule) {
          setODR(undefined)
          return
        }
        const { propId, ...rule } = dateRule
        const {
          typeId = "",
          gantt,
          filters = [],
          groupers = [],
          sorters = [],
        } = form.getFieldsValue() as RuleFormData
        if (filters.find((f) => f.propId === propId)) {
          const newFilters = filters.map((p) =>
            p.propId === propId ? ({ ...p, value: rule } as any) : p
          )
          form.setFieldValue("filters", newFilters)
          updateViewCfg(typeId, newFilters, groupers, sorters, gantt)
          setODR(undefined)
        }
      },
      [form, updateViewCfg]
    )
    // 分组规则
    const formGroupers = useWatch("groupers", form)
    // 已经选中的排序项
    const selectedGrouperIds = useMemo(
      () => new Set(formGroupers?.map((r) => r.propId)),
      [formGroupers]
    )
    // 组装所有排序项 map
    const grouperMap = useMemo(() => getGrouperMap(isKanban, typeInfo), [isKanban, typeInfo])
    const grouperItems = useMemo(
      () => getGrouperItems(selectedGrouperIds, isKanban, typeInfo),
      [selectedGrouperIds, isKanban, typeInfo]
    )
    const addGrouperItem = useCallback(
      (add: (defaultValue?: StoreValue, insertIndex?: number) => void, key: string) => {
        const grouper = grouperMap.get(key)
        if (!grouper) return
        // 看板视图，已经存在分组项，则直接替换
        if (isKanban && selectedGrouperIds.size) {
          const { typeId, gantt, filters, sorters } = form.getFieldsValue()
          const newGroupers = [{ typeId, propId: key, value: SortEnum.ASC }]
          form.setFieldValue("groupers", newGroupers)
          updateViewCfg(typeId, filters, newGroupers, sorters, gantt)
          return
        }
        switch (key) {
          case "type_id":
          case "create_date":
          case "update_date":
            add({ typeId: "", propId: key, value: SortEnum.ASC })
            break
          default:
            add({ typeId: typeInfo?.id, propId: key, value: SortEnum.ASC })
            break
        }
      },
      [grouperMap, isKanban, selectedGrouperIds.size, form, updateViewCfg, typeInfo?.id]
    )
    // 排序规则
    const formSorters = useWatch("sorters", form)
    // 已经选中的排序项
    const selectedSorterIds = useMemo(
      () => new Set(formSorters?.map((r) => r.propId)),
      [formSorters]
    )
    // 组装所有排序项 map
    const sorterMap = useMemo(() => getSorterMap(typeInfo), [typeInfo])
    const sorterItems = useMemo(
      () => getSorterItems(selectedSorterIds, typeInfo),
      [typeInfo, selectedSorterIds]
    )
    const addSorterItem = useCallback(
      (add: (defaultValue?: StoreValue, insertIndex?: number) => void, key: string) => {
        const sorter = sorterMap.get(key)
        if (!sorter) return
        switch (key) {
          case "name":
          case "create_time":
          case "update_time":
            add({ typeId: "", propId: key, value: SortEnum.DESC })
            break
          default:
            add({ typeId: typeInfo?.id, propId: key, value: SortEnum.DESC })
            break
        }
      },
      [typeInfo?.id, sorterMap]
    )
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
      const { ruleId, typeId, gantt, filters, groupers, sorters } = form.getFieldsValue()
      const newFilters = filterFilterRules(filters)
      db?.view
        .updateViewConfig(viewId, ruleId, typeId, newFilters, groupers, sorters, gantt)
        .then(() => {
          setOpen(false)
        })
    }, [db?.view, form, setOpen, viewId])
    // 创建新视图
    const handleCreateLV = useCallback(() => {
      const { typeId, gantt, filters, groupers, sorters } = form.getFieldsValue()
      const newFilters = filterFilterRules(filters)
      // 看板视图中的分组条件
      const kanbanGrouper =
        groupers.length && selectPropIds.length
          ? groupers.find((g) => selectPropIds.includes(g.propId))
          : undefined
      const config = {
        ruleId: "",
        gantt,
        rules: [{ id: "", name: "", typeId, filters: newFilters, groupers, sorters }],
        kanbanRules: [
          {
            id: "",
            name: "",
            typeId,
            filters: newFilters,
            groupers: kanbanGrouper ? [kanbanGrouper] : [],
            sorters,
          },
        ],
      }
      setOpen(false)
      if (viewId === SpecialViewEnum.CARDS) {
        setMEditView({ viewId: "", spaceId, currType: ViewTypeEnum.LIST, config, allowTypes: 0 })
      } else {
        db?.view.getViewById(viewId).then((view) => {
          if (view) {
            const mainViewId = view.inline_type === ViewInlineType.INLINE ? view.pid : viewId
            setMEditView({
              viewId: "",
              spaceId,
              pid: mainViewId,
              currType: view.type,
              config,
              inlineType: view.inline_type,
              allowTypes: 0,
            })
          }
        })
      }
    }, [form, selectPropIds, setOpen, viewId, setMEditView, spaceId, db?.view])
    // 创建新快照
    const setRuleSnap = useModelStore(ruleSnapSelector)
    const handleCreateSnapshot = useCallback(() => {
      const { typeId, gantt, filters, groupers, sorters } = form.getFieldsValue()
      const newFilters = filterFilterRules(filters)
      const ruleId = unid()
      db?.view
        .createViewRuleSnap(viewId, ruleId, typeId, newFilters, groupers, sorters, gantt)
        .then(() => {
          setOpen(false)
          setRuleId(ruleId)
          setRuleSnap({ viewId, ruleId, ruleName: "" })
        })
    }, [form, db?.view, viewId, setOpen, setRuleId, setRuleSnap])
    const setTab = useCallback(
      (type: string, open: boolean) => {
        setTabMap((m) => {
          if (!(type in m)) return m
          // 清空规则时，判断是否需要变更表单数据
          if (!open) {
            const { typeId, gantt, filters, groupers, sorters } = form.getFieldsValue()
            if (type === "typeId" && typeId) {
              selectTypeId("")
            } else if (type === "filters" && filters.length) {
              form.setFieldValue("filters", [])
              updateViewCfg(typeId, [], groupers, sorters, gantt)
            } else if (type === "groupers" && groupers.length) {
              form.setFieldValue("groupers", [])
              updateViewCfg(typeId, filters, [], sorters, gantt)
            } else if (type === "sorters" && sorters.length) {
              form.setFieldValue("sorters", [])
              updateViewCfg(typeId, filters, groupers, [], gantt)
            }
          }
          return { ...m, [type]: open }
        })
      },
      [form, selectTypeId, updateViewCfg]
    )
    const showAll = tabMap.typeId && tabMap.filters && tabMap.groupers && tabMap.sorters
    const hideAll = !tabMap.typeId && !tabMap.filters && !tabMap.groupers && !tabMap.sorters
    // 没有有效规则
    const noRule = !typeId && !formFilters?.length && !formGroupers?.length && !formSorters?.length
    console.log("Render: FilterContent")
    return (
      <>
        <IForm
          form={form}
          name="viewRules"
          onValuesChange={handleValuesChange}
          initialValues={{ filters: [], sorters: [] }}
          style={{ width: 348 }}
          autoComplete="off"
          size="small"
          onClick={(e) => e.stopPropagation()}
        >
          {!showAll && (
            <IFlexR>
              {!tabMap.typeId && (
                <AddSmallBtn
                  onClick={() => setTab("typeId", true)}
                  type="primary"
                  icon={<IIcon icon="plus" fontSize={14} />}
                  size="small"
                  className="mr-2"
                  danger={isKanban}
                >
                  模板限定
                </AddSmallBtn>
              )}
              {!tabMap.filters && (
                <AddSmallBtn
                  onClick={() => setTab("filters", true)}
                  type="primary"
                  icon={<IIcon icon="plus" fontSize={14} />}
                  size="small"
                  className="mr-2"
                >
                  筛选规则
                </AddSmallBtn>
              )}
              {!tabMap.groupers && (
                <AddSmallBtn
                  onClick={() => setTab("groupers", true)}
                  type="primary"
                  icon={<IIcon icon="plus" fontSize={14} />}
                  size="small"
                  className="mr-2"
                  danger={isKanban}
                >
                  分组规则
                </AddSmallBtn>
              )}
              {!tabMap.sorters && (
                <AddSmallBtn
                  onClick={() => setTab("sorters", true)}
                  type="primary"
                  icon={<IIcon icon="plus" fontSize={14} />}
                  size="small"
                >
                  排序规则
                </AddSmallBtn>
              )}
            </IFlexR>
          )}
          {!hideAll && !showAll && <Divider />}
          <Form.Item name="ruleId" noStyle>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name="typeId" noStyle>
            <Input type="hidden" />
          </Form.Item>
          {tabMap.typeId && (
            <>
              <IFlexR className={cc({ "mb-4": isGantt })}>
                <Typography.Text strong>模板限定</Typography.Text>
                <div className="flexPlace" />
                {!isForceType && (
                  <Tooltip title="取消模板限定" placement="left">
                    <IconBtn
                      onClick={() => setTab("typeId", false)}
                      icon={<IIcon icon="delete" fontSize={14} />}
                      type="text"
                      className="mr-2"
                    />
                  </Tooltip>
                )}
                <Dropdown
                  menu={{ items: typeItems, onClick: ({ key }) => selectTypeId(key) }}
                  trigger={["click"]}
                >
                  <Button type="primary" size="small" danger={isForceType && !typeId}>
                    <IFlexR>
                      {typeInfo?.name || "选择模板"}&nbsp;
                      <IIcon icon="arrowbottom" />
                    </IFlexR>
                  </Button>
                </Dropdown>
              </IFlexR>
              {(tabMap.filters || tabMap.groupers || tabMap.sorters || (isGantt && typeId)) && (
                <Divider />
              )}
            </>
          )}
          {isGantt && typeId && (
            <>
              <IFlexR className={cc({ "mb-4": isGantt })}>
                <Typography.Text strong>甘特图规则</Typography.Text>
                <div className="flexPlace" />
              </IFlexR>
              <IFlexRB className="mb-2">
                <Form.Item name={["gantt", "start"]} label="开始日期" className="mr-2">
                  <Select style={{ width: 160 }} options={dateProps} />
                </Form.Item>
              </IFlexRB>
              <IFlexRB className="mb-2">
                <Form.Item name={["gantt", "end"]} label="结束日期" className="mr-2">
                  <Select style={{ width: 160 }} options={dateProps} />
                </Form.Item>
              </IFlexRB>
              <IFlexRB className="mb-2">
                <Form.Item name={["gantt", "text"]} label="标题展示" className="mr-2">
                  <Select style={{ width: 160 }} options={allProps} />
                </Form.Item>
              </IFlexRB>
              {(tabMap.filters || tabMap.groupers || tabMap.sorters) && <Divider />}
            </>
          )}
          <Form.List name="filters">
            {(fields, { add, remove }) => {
              return (
                <>
                  {tabMap.filters && (
                    <IFlexR className={cc({ "mb-4": fields.length > 0 })}>
                      <Typography.Text strong>筛选规则</Typography.Text>
                      <div className="flexPlace" />
                      <Tooltip title="清空筛选项" placement="left">
                        <IconBtn
                          onClick={() => setTab("filters", false)}
                          icon={<IIcon icon="delete" fontSize={14} />}
                          type="text"
                          className="mr-2"
                        />
                      </Tooltip>
                      <Dropdown
                        menu={{
                          items: filterItems,
                          onClick: ({ key }) => addItem(add, key),
                        }}
                        trigger={["click"]}
                      >
                        <AddSmallBtn
                          type="primary"
                          icon={<IIcon icon="plus" fontSize={14} />}
                          size="small"
                        >
                          筛选项
                        </AddSmallBtn>
                      </Dropdown>
                    </IFlexR>
                  )}
                  {fields.map((field) => {
                    const rule = form.getFieldValue(["filters", field.name]) as FilterRule
                    const filter = filterMap.get(rule.propId)
                    if (!filter) return null
                    const condOpts =
                      filter.type === FilterTypeEnum.TEXT || isSelectFilterType(filter.type)
                        ? commonConds
                        : filter.type === FilterTypeEnum.NUMBER
                        ? numberConds
                        : filter.type === FilterTypeEnum.TAGS
                        ? tagConds
                        : filter.type === FilterTypeEnum.DATE
                        ? rule.typeId
                          ? dateConds
                          : commonDateConds
                        : eqConds
                    const selectOpts = filter.opts || []
                    const dateRuleText =
                      filter.type === FilterTypeEnum.DATE && isNotEmptyCond(rule.cond)
                        ? parseDateRuleDesc(rule.value)
                        : ""
                    // console.log("field", field, rule, condOpts)
                    return (
                      <IFlexRB key={"rule_" + field.key} className="mb-2">
                        <Form.Item name={[field.name, "typeId"]} noStyle>
                          <Input type="hidden" />
                        </Form.Item>
                        <Form.Item name={[field.name, "propId"]} noStyle>
                          <Input type="hidden" />
                        </Form.Item>
                        <Form.Item
                          name={[field.name, "cond"]}
                          label={filter?.name || ""}
                          className="mr-2"
                        >
                          <Select style={{ width: 94 }} options={condOpts} />
                        </Form.Item>
                        <div style={{ flex: 1 }}>
                          {filter.type === FilterTypeEnum.TEXT && isNotEmptyCond(rule.cond) && (
                            <Form.Item name={[field.name, "value"]}>
                              <Input style={{ width: "100%" }} placeholder="关键词..." />
                            </Form.Item>
                          )}
                          {filter.type === FilterTypeEnum.NUMBER && isNotEmptyCond(rule.cond) && (
                            <Form.Item name={[field.name, "value"]}>
                              <InputNumber style={{ width: "100%" }} placeholder="数值..." />
                            </Form.Item>
                          )}
                          {filter.type === FilterTypeEnum.DATE && isNotEmptyCond(rule.cond) && (
                            <Tooltip title={dateRuleText} placement="bottom">
                              <DateInput
                                value={dateRuleText}
                                onClick={() => openDateRule(rule.propId, rule.value)}
                                readOnly
                                onFocus={(e) => e.target.blur()}
                              />
                            </Tooltip>
                          )}
                          {isSelectFilterType(filter.type) && isNotEmptyCond(rule.cond) && (
                            <Form.Item name={[field.name, "value"]}>
                              <Select
                                style={{ width: "100%" }}
                                options={selectOpts}
                                mode={
                                  filter.type === FilterTypeEnum.MSELECT || isContainCond(rule.cond)
                                    ? "multiple"
                                    : undefined
                                }
                                removeIcon={null}
                              />
                            </Form.Item>
                          )}
                          {rule.propId === "board" && (
                            <Form.Item name={[field.name, "value"]}>
                              <Select
                                style={{ width: "100%" }}
                                options={viewOpts}
                                placeholder="指定白板"
                              />
                            </Form.Item>
                          )}
                          {rule.propId === "tags" && isNotEmptyCond(rule.cond) && (
                            <Form.Item name={[field.name, "value"]}>
                              <Select
                                style={{ width: "100%" }}
                                options={tags}
                                mode="multiple"
                                placeholder="选定标签"
                                removeIcon={null}
                              />
                            </Form.Item>
                          )}
                        </div>
                        <IconBtn
                          onClick={() => remove(field.name)}
                          icon={<IIcon icon="close" fontSize={14} />}
                          type="text"
                          className="ml-2 closeBtn"
                        />
                      </IFlexRB>
                    )
                  })}
                </>
              )
            }}
          </Form.List>
          {tabMap.filters && (tabMap.groupers || tabMap.sorters) && <Divider />}
          <Form.List name="groupers">
            {(fields, { add, remove, move }) => {
              return (
                <>
                  {tabMap.groupers && (
                    <IFlexR className={cc({ "mb-4": fields.length > 0 })}>
                      <Typography.Text strong>分组规则</Typography.Text>
                      <div className="flexPlace" />
                      {!isKanban && (
                        <Tooltip title="清空分组项" placement="left">
                          <IconBtn
                            onClick={() => setTab("groupers", false)}
                            icon={<IIcon icon="delete" fontSize={14} />}
                            type="text"
                            className="mr-2"
                          />
                        </Tooltip>
                      )}
                      <Dropdown
                        menu={{
                          items: grouperItems,
                          onClick: ({ key }) => addGrouperItem(add, key),
                        }}
                        trigger={["click"]}
                      >
                        <AddSmallBtn
                          type="primary"
                          icon={<IIcon icon="plus" fontSize={14} />}
                          size="small"
                          danger={isKanban && formGroupers.length === 0}
                        >
                          分组项
                        </AddSmallBtn>
                      </Dropdown>
                    </IFlexR>
                  )}
                  <DndContext
                    onDragEnd={({ active, over }: DragEndEvent) => {
                      // console.log("handleDragEnd", active, over)
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
          {tabMap.groupers && tabMap.sorters && <Divider />}
          <Form.List name="sorters">
            {(fields, { add, remove, move }) => {
              return (
                <>
                  {tabMap.sorters && (
                    <IFlexR className={cc({ "mb-4": fields.length > 0 })}>
                      <Typography.Text strong>排序规则</Typography.Text>
                      {fields.length === 0 && (
                        <Typography.Text type="secondary" className="ml-1" style={{ fontSize: 13 }}>
                          (默认为更新时间倒序)
                        </Typography.Text>
                      )}
                      <div className="flexPlace" />
                      <Tooltip title="清空排序项" placement="left">
                        <IconBtn
                          onClick={() => setTab("sorters", false)}
                          icon={<IIcon icon="delete" fontSize={14} />}
                          type="text"
                          className="mr-2"
                        />
                      </Tooltip>
                      <Dropdown
                        menu={{
                          items: sorterItems,
                          onClick: ({ key }) => addSorterItem(add, key),
                        }}
                        trigger={["click"]}
                      >
                        <AddSmallBtn
                          type="primary"
                          icon={<IIcon icon="plus" fontSize={14} />}
                          size="small"
                        >
                          排序项
                        </AddSmallBtn>
                      </Dropdown>
                    </IFlexR>
                  )}
                  <DndContext
                    onDragEnd={({ active, over }: DragEndEvent) => {
                      // console.log("handleDragEnd", active, over)
                      if (over && active.id !== over.id) {
                        const items: { id: string }[] = fields.map((f) => ({
                          id: "sorter" + f.key,
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
                    <SortableContext items={fields.map((f) => ({ id: "sorter" + f.key }))}>
                      {fields.map((field) => {
                        const rule = form.getFieldValue(["sorters", field.name]) as SorterRule
                        const sorter = sorterMap.get(rule.propId)
                        if (!sorter) return null
                        return (
                          <SorterItem
                            key={"sort_" + field.key}
                            field={field}
                            remove={remove}
                            sorter={sorter}
                          />
                        )
                      })}
                    </SortableContext>
                  </DndContext>
                </>
              )
            }}
          </Form.List>
          {noRule ? null : viewId === SpecialViewEnum.CARDS ? (
            <>
              <Divider />
              <IFlexR>
                <div className="flexPlace" />
                {
                  <Button onClick={handleCreateLV} size="small" type="primary">
                    另存为新视图
                  </Button>
                }
              </IFlexR>
            </>
          ) : (
            <>
              <Divider />
              <IFlexR>
                <Button onClick={handleCreateLV} size="small" className="mr-1">
                  另存为新视图
                </Button>
                {viewConf.viewSnap && (
                  <Button onClick={handleCreateSnapshot} size="small">
                    另存为快照
                  </Button>
                )}
                <div className="flexPlace" />
                {viewId !== SpecialViewEnum.CARDS && (
                  <Button onClick={handleUpdateLV} size="small" type="primary">
                    保存规则
                  </Button>
                )}
              </IFlexR>
            </>
          )}
        </IForm>
        <DateModal odr={odr} setODR={setODR} updateDateRule={updateDateRule} />
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

type SorterProp = {
  field: any
  sorter: SorterItem
  remove: (index: number | number[]) => void
}
const SorterItem = memo(({ field, sorter, remove }: SorterProp) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } =
    useSortable({ id: "sorter" + field.key })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  const opts = sorter.type === SorterTypeEnum.COMMON ? sortTypeOptions : sortSelectTypeOptions
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
      <Form.Item name={[field.name, "value"]} label={sorter?.name || ""}>
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
const DateInput = styled(Input)({
  "&:hover": {
    cursor: "pointer",
  },
})
