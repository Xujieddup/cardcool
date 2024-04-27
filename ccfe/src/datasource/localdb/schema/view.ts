import type {
  ViewJsonSchema,
  ViewCollection,
  ViewCollectionMethods,
  ViewOption,
  SorterRule,
  ViewCfg,
  FilterRule,
  GrouperRule,
  ViewNameObj,
  GanttRule,
} from "@/types"
import type { View } from "@/types"
import type { MangoQuerySelector } from "rxdb"
import { parseViewConfig, unidtime } from "@/utils"
import { SortEnum, ViewInlineType } from "@/enums"
import { arrayMove } from "@dnd-kit/sortable"
import { defaultViewCfg, getIconByViewType } from "@/config"

export const viewScheme: ViewJsonSchema = {
  title: "node view",
  version: 0,
  primaryKey: "id",
  type: "object",
  keyCompression: true,
  properties: {
    id: {
      type: "string",
      maxLength: 12, // <- the primary key must have set maxLength
    },
    name: {
      type: "string",
    },
    space_id: {
      type: "string",
    },
    pid: {
      type: "string",
    },
    snum: {
      type: "number",
    },
    type: {
      type: "number",
    },
    inline_type: {
      type: "number",
    },
    is_favor: {
      type: "boolean",
    },
    icon: {
      type: "string",
    },
    desc: {
      type: "string",
    },
    config: {
      type: "string",
    },
    content: {
      type: "string",
    },
    update_time: {
      type: "number",
    },
    is_deleted: {
      type: "boolean",
    },
  },
  required: [
    "id",
    "name",
    "space_id",
    "pid",
    "snum",
    "type",
    "inline_type",
    "is_favor",
    "icon",
    "desc",
    "config",
    "content",
    "update_time",
    "is_deleted",
  ],
}

export const viewCollectionMethods: ViewCollectionMethods = {
  // 查询所有视图
  async getAll(this: ViewCollection, spaceId: string) {
    return this.find()
      .where("space_id")
      .eq(spaceId)
      .where("is_deleted")
      .eq(false)
      .sort({ snum: "asc", id: "asc" })
      .exec()
      .then((vs) => vs.map((view) => view.toJSON() as View))
  },
  // 查询视图列表 - 菜单栏
  async getMenuViews(this: ViewCollection, spaceId: string) {
    return this.find()
      .where("space_id")
      .eq(spaceId)
      .where("is_deleted")
      .eq(false)
      .where("inline_type")
      .eq(ViewInlineType.NOTINLINE)
      .sort({ snum: "asc", id: "asc" })
      .exec()
      .then((vs) => vs.map((view) => view.toJSON() as View))
  },
  async getViewsQuery(this: ViewCollection, spaceId: string) {
    return this.find()
      .where("space_id")
      .eq(spaceId)
      .where("is_deleted")
      .eq(false)
      .sort({ snum: "asc", id: "asc" })
  },
  // 获取Flow视图查询句柄
  async getFlowViewsQuery(this: ViewCollection, spaceId: string) {
    return this.find()
      .where("space_id")
      .eq(spaceId)
      .where("type")
      .eq(1)
      .where("is_deleted")
      .eq(false)
      .sort({ id: "asc" })
  },
  // 查询视图（默认为节点集视图）
  async getView(this: ViewCollection, spaceId: string, viewId: string) {
    const view = viewId
      ? await this.findOne(viewId).where("is_deleted").eq(false).exec()
      : await this.findOne()
          .where("space_id")
          .eq(spaceId)
          .where("type")
          .eq(-1)
          .where("is_deleted")
          .eq(false)
          .exec()
    return view ? (view.toJSON() as View) : null
  },
  // 查询视图并更新时间（默认为节点集视图）
  async getAndUpdateView(this: ViewCollection, spaceId: string, viewId: string) {
    const view = viewId
      ? await this.findOne(viewId).where("is_deleted").eq(false).exec()
      : await this.findOne()
          .where("space_id")
          .eq(spaceId)
          .where("type")
          .eq(-1)
          .where("is_deleted")
          .eq(false)
          .exec()
    // view?.update({
    //   $set: {
    //     update_time: Date.now(),
    //   }
    // })
    return view ? (view.toJSON() as View) : null
  },
  // 查询视图
  async getViewById(this: ViewCollection, viewId: string) {
    return this.findOne(viewId)
      .where("is_deleted")
      .eq(false)
      .exec()
      .then((view) => (view ? (view.toJSON() as View) : null))
  },
  // 查询指定视图及其内联视图
  async getViewAndInlineViews(this: ViewCollection, viewId: string) {
    const view = await this.getViewById(viewId)
    if (!view) return []
    const views = await this.find()
      .where("pid")
      .eq(viewId)
      .where("inline_type")
      .eq(ViewInlineType.INLINE)
      .where("is_deleted")
      .eq(false)
      .sort({ snum: SortEnum.ASC })
      .exec()
      .then((vs) => vs.map((view) => view.toJSON() as View))
    return views.length ? [view, ...views] : [view]
  },
  async getViewQuery(this: ViewCollection, viewId: string) {
    return this.findOne(viewId).where("is_deleted").eq(false)
  },
  // 查询视图集视图
  async getSummaryView(this: ViewCollection, spaceId: string) {
    return this.findOne()
      .where("space_id")
      .eq(spaceId)
      .where("type")
      .eq(-2)
      .where("is_deleted")
      .eq(false)
      .exec()
      .then((view) => (view ? (view.toJSON() as View) : null))
  },
  // 根据 id 列表批量查询视图信息
  async getViewsByIds(this: ViewCollection, viewIds: string[]) {
    return this.findByIds(viewIds).exec()
  },
  // 创建新视图
  async createView(
    this: ViewCollection,
    spaceId: string,
    pid: string,
    type: number,
    inlineType: number,
    snum: number,
    name: string,
    desc: string,
    config: string
  ) {
    const [id, time] = unidtime()
    const view: View = {
      id: id,
      name: name,
      space_id: spaceId,
      pid: pid,
      snum: snum,
      type: type,
      inline_type: inlineType,
      is_favor: false,
      icon: getIconByViewType(type),
      desc: desc,
      config: config,
      content: "",
      update_time: time,
      is_deleted: false,
    }
    // 创建内联视图，需要查询同级视图的最大 snum
    if (inlineType === ViewInlineType.INLINE) {
      const lastInlineView = await this.findOne()
        .where("pid")
        .eq(pid)
        .where("is_deleted")
        .eq(false)
        .where("inline_type")
        .eq(ViewInlineType.INLINE)
        .sort({ snum: SortEnum.DESC })
        .exec()
      view.snum = lastInlineView ? lastInlineView.snum + 10000 : 10000
    }
    return await this.insert(view).then((doc) => doc.toJSON() as View)
  },
  // 编辑视图(新建视图/修改视图名字)
  async editView(
    this: ViewCollection,
    viewId: string,
    pid: string,
    inlineType: number,
    name: string,
    desc: string,
    snum: number,
    queryInlineSnum: boolean
  ) {
    const newView = {
      pid: pid,
      inline_type: inlineType,
      name: name,
      desc: desc,
      snum: snum,
      update_time: Date.now(),
    }
    // 修改内联视图，需要查询同级视图的最大 snum
    if (inlineType === ViewInlineType.INLINE && queryInlineSnum) {
      const lastInlineView = await this.findOne()
        .where("pid")
        .eq(pid)
        .where("is_deleted")
        .eq(false)
        .where("inline_type")
        .eq(ViewInlineType.INLINE)
        .sort({ snum: SortEnum.DESC })
        .exec()
      newView.snum = lastInlineView ? lastInlineView.snum + 10000 : 10000
    }
    return this.findOne(viewId)
      .update({ $set: newView })
      .then((doc) => (doc ? (doc.toJSON() as View) : null))
  },
  // 根据 ids 查询视图
  async getMapByIds(this: ViewCollection, ids: string[]) {
    return this.findByIds(ids)
      .exec()
      .then((map) => {
        const viewMap: Map<string, View> = new Map<string, View>()
        map.forEach((value, key) => {
          viewMap.set(key, value.toJSON() as View)
        })
        return viewMap
      })
  },
  // 修改节点视图名字
  async updateViewName(this: ViewCollection, viewId: string, viewName: string) {
    return this.findOne(viewId)
      .update({
        $set: {
          name: viewName,
          update_time: Date.now(),
        },
      })
      .then(() => true)
  },
  // 修改视图内容
  async updateViewContent(this: ViewCollection, viewId: string, content: string) {
    this.findOne(viewId)
      .update({
        $set: {
          content,
          update_time: Date.now(),
        },
      })
      .then(() => true)
  },
  // 获取指定视图及其所有子视图(包括内联视图)
  async getChildViews(this: ViewCollection, viewId: string) {
    const res: ViewNameObj[] = []
    const view = await this.findOne(viewId)
      .where("is_deleted")
      .eq(false)
      .exec()
      .then((v) => (v ? { id: v.id, name: v.name } : null))
    if (view) {
      res.push(view)
      // 查找视图及其所有子视图
      let viewIds = [viewId]
      // let allViewIds = [viewId]
      while (viewIds.length > 0) {
        viewIds = await this.find()
          .where("pid")
          .in(viewIds)
          .where("is_deleted")
          .eq(false)
          .exec()
          .then((vs) =>
            vs.map((v) => {
              res.push({ id: v.id, name: v.name })
              return v.id
            })
          )
      }
    }
    return res
  },
  // 根据 id 批量删除视图(先查询所有子视图 id)
  async deleteViewByIds(this: ViewCollection, viewIds: string[]) {
    this.find()
      .where("id")
      .in(viewIds)
      .where("is_deleted")
      .eq(false)
      .update({
        $set: { is_deleted: true, update_time: Date.now() },
      })
  },
  // 根据卡片名称查询空间内的所有视图对象
  async getSpaceViewsByName(
    this: ViewCollection,
    spaceId: string,
    keyword: string,
    ignoreUname?: boolean
  ) {
    const selector: MangoQuerySelector<View> = {
      space_id: spaceId,
      is_deleted: false,
    }
    if (keyword) {
      selector["name"] = { $regex: new RegExp(keyword, "i") }
    } else if (ignoreUname) {
      selector["name"] = { $ne: "" }
    }
    const allViews = await this.find({
      selector: selector,
      sort: [{ update_time: "desc" }],
      limit: 100,
    }).exec()
    return allViews.map((viewDoc) => {
      return {
        id: viewDoc.id,
        // type_id: viewDoc.type_id,
        name: viewDoc.name,
        icon: viewDoc.icon,
        update_time: viewDoc.update_time,
      } as ViewOption
    })
  },
  async getCardOptMapByIds(this: ViewCollection, ids: string[]) {
    const m = new Map<string, ViewOption>()
    if (ids.length === 0) {
      return m
    }
    return this.findByIds(ids)
      .exec()
      .then((map) => {
        map.forEach((value, key) => {
          m.set(key, {
            id: value.id,
            name: value.name,
            icon: value.icon,
          } as ViewOption)
        })
        return m
      })
  },
  // 修改视图配置
  async updateViewConfig(
    this: ViewCollection,
    viewId: string,
    rId: string,
    typeId: string,
    filters: FilterRule[],
    groupers: GrouperRule[],
    sorters: SorterRule[],
    gantt?: GanttRule
  ) {
    const changeFunc = (v: View) => {
      const cfg = JSON.parse(v.config) as ViewCfg
      const { ruleId = "", rules = [] } = cfg
      const newRules = rules.length
        ? rules.map((r) => {
            if (r.id === rId) {
              return { ...r, typeId, gantt, filters, groupers, sorters }
            } else {
              return r
            }
          })
        : [{ id: "", name: "", typeId, gantt, filters, groupers, sorters }]
      v.config = JSON.stringify({ ruleId, rules: newRules })
      v.update_time = Date.now()
      return v
    }
    const view = await this.findOne(viewId).exec()
    await view?.modify(changeFunc)
    // console.log("view", viewId, view)
    return true
  },
  // 创建规则快照
  async createViewRuleSnap(
    this: ViewCollection,
    viewId: string,
    rid: string,
    typeId: string,
    filters: FilterRule[],
    groupers: GrouperRule[],
    sorters: SorterRule[],
    gantt?: GanttRule
  ) {
    const changeFunc = (v: View) => {
      const cfg = JSON.parse(v.config) as ViewCfg
      const config = cfg.ruleId !== undefined && cfg.rules.length ? cfg : defaultViewCfg
      const { ruleId = "", rules = [] } = config
      const newRule = { id: rid, name: "", typeId, gantt, filters, groupers, sorters }
      v.config = JSON.stringify({ ruleId, rules: [...rules, newRule] })
      v.update_time = Date.now()
      return v
    }
    const view = await this.findOne(viewId).exec()
    await view?.modify(changeFunc)
    return true
  },
  // 更新规则快照名字
  async updateRuleSnapName(this: ViewCollection, viewId: string, rid: string, ruleName: string) {
    const changeFunc = (v: View) => {
      const { ruleId = "", rules = [] } = parseViewConfig(v.config)
      const newRules = rules.map((r) => {
        if (r.id === rid) {
          return { ...r, name: ruleName }
        } else {
          return r
        }
      })
      v.config = JSON.stringify({ ruleId, rules: newRules })
      v.update_time = Date.now()
      return v
    }
    const view = await this.findOne(viewId).exec()
    await view?.modify(changeFunc)
    return true
  },
  // 删除规则快照
  async deleteRuleSnap(this: ViewCollection, viewId: string, rid: string) {
    const changeFunc = (v: View) => {
      const { ruleId = "", rules = [] } = parseViewConfig(v.config)
      const newRules = rules.filter((r) => r.id !== rid)
      v.config = JSON.stringify({ ruleId, rules: newRules })
      v.update_time = Date.now()
      return v
    }
    const view = await this.findOne(viewId).exec()
    await view?.modify(changeFunc)
    return true
  },
  // 更新规则排序
  async updateRuleSnapSort(
    this: ViewCollection,
    viewId: string,
    beforeRuleId: string,
    afterRuleId: string
  ) {
    const changeFunc = (v: View) => {
      const { ruleId = "", rules = [] } = parseViewConfig(v.config)
      const oldIndex = rules.findIndex((view) => view.id === beforeRuleId)
      const newIndex = rules.findIndex((view) => view.id === afterRuleId)
      if (oldIndex > -1 && newIndex > -1) {
        // 移动后的列表
        const newRules = arrayMove(rules, oldIndex, newIndex)
        v.config = JSON.stringify({ ruleId, rules: newRules })
      }
      v.update_time = Date.now()
      return v
    }
    const view = await this.findOne(viewId).exec()
    await view?.modify(changeFunc)
    return true
  },
  // 修改视图排序规则
  async updateViewSorter(this: ViewCollection, viewId: string, vid: string, sorters: SorterRule[]) {
    const changeFunc = (ov: View) => {
      const config = JSON.parse(ov.config) as ViewCfg
      // const views = config.views.map((v) => {
      //   if (v.id === vid) {
      //     v.sorts = sorts
      //   }
      //   return v
      // })
      const newConfig = JSON.stringify({ ...config, sorters: sorters })
      ov.config = newConfig
      ov.update_time = Date.now()
      console.log("ov", ov)
      return ov
    }
    const view = await this.findOne(viewId).exec()
    await view?.modify(changeFunc)
    console.log("view", viewId, view)
    return true
  },
  async updateViewFavor(this: ViewCollection, viewId: string, isFavor: boolean) {
    return this.findOne(viewId)
      .update({
        $set: {
          is_favor: isFavor,
          update_time: Date.now(),
        },
      })
      .then(() => true)
  },
  // 获取空间的视图数量
  async getSpaceViewCnt(this: ViewCollection, spaceId: string) {
    const cnt = await this.count()
      .where("space_id")
      .eq(spaceId)
      .where("is_deleted")
      .eq(false)
      .exec()
    return cnt || 0
  },
  // 视图排序
  async batchUpdateSortViews(this: ViewCollection, viewMap: Map<string, number>, pid?: string) {
    const ids = Array.from(viewMap.keys())
    const views = await this.findByIds(ids)
      .exec()
      .then((map) => {
        const list: View[] = []
        let time = Date.now()
        map.forEach((viewDoc, vId) => {
          const snum = viewMap.get(vId)
          if (snum !== undefined) {
            const view = viewDoc.toJSON() as View
            list.push(
              pid !== undefined
                ? { ...view, pid, snum, update_time: time }
                : { ...view, snum, update_time: time }
            )
            time += 1
          }
        })
        return list
      })
    await this.bulkUpsert(views)
    return true
  },
}
