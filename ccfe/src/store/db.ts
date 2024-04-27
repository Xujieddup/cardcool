import { createWithEqualityFn } from "zustand/traditional"
import { MyDatabase, NodeTypeObj, CardTag, ViewInfo } from "@/types"
import { OpEnum } from "@/enums"

export type SetDB = (db?: MyDatabase) => void
export type GetDB = (state: DBState) => MyDatabase | undefined
export type GetSetDB = (state: DBState) => SetDB
export type UseDB = (state: DBState) => [MyDatabase | undefined, SetDB]

// 当前视图数据
export type SetViewInfo = (view: ViewInfo) => void
export type GetViewInfo = (state: DBState) => ViewInfo | undefined
export type UseViewInfo = (state: DBState) => [ViewInfo | undefined, SetViewInfo]

// 卡片模板列表
export type SetTypes = (ts: NodeTypeObj[]) => void
export type GetTypes = (state: DBState) => NodeTypeObj[]
export type GetSetTypes = (state: DBState) => SetTypes
export type UseTypes = (state: DBState) => [NodeTypeObj[], SetTypes]
export type GetDBTypes = (state: DBState) => [MyDatabase | undefined, NodeTypeObj[]]

// 卡片标签
export type SetTagMap = (ts: Map<string, CardTag>) => void
export type GetTagMap = (state: DBState) => Map<string, CardTag>
export type GetSetTagMap = (state: DBState) => SetTagMap
export type UseTagMap = (state: DBState) => [Map<string, CardTag>, SetTagMap]

// 卡片操作消息订阅
export type CardOp = { op: OpEnum; id: string }
export type SetCardOp = (co: CardOp) => void
export type GCardOp = (state: DBState) => CardOp | undefined
export type SCardOp = (state: DBState) => SetCardOp
export type UseCardOp = (state: DBState) => [CardOp | undefined, SetCardOp]
// 视图操作消息订阅
export type ViewOp = { op: OpEnum; ids: string[] }
export type SetViewOp = (vo: ViewOp) => void
export type GViewOp = (state: DBState) => ViewOp | undefined
export type SViewOp = (state: DBState) => SetViewOp
export type UseViewOp = (state: DBState) => [ViewOp | undefined, SetViewOp]
// 卡片和视图操作
export type GOp = (state: DBState) => [CardOp | undefined, ViewOp | undefined]
// 大纲、文档视图编辑状态，undefined-不展示，0-编辑中，1-已保存
export type SetViewEditStatus = (status?: number) => void
export type GViewEditStatus = (state: DBState) => number | undefined
export type SViewEditStatus = (state: DBState) => SetViewEditStatus
export type UseViewEditStatus = (state: DBState) => [number | undefined, SetViewEditStatus]

export type DBState = {
  db?: MyDatabase
  setDb: SetDB
  view: ViewInfo | undefined
  setView: SetViewInfo
  types: NodeTypeObj[]
  setTypes: SetTypes
  tagMap: Map<string, CardTag>
  setTagMap: SetTagMap
  cardOp?: CardOp
  setCardOp: SetCardOp
  viewOp?: ViewOp
  setViewOp: SetViewOp
  viewEditStatus?: number
  setViewEditStatus: SetViewEditStatus
}

export const useDBStore = createWithEqualityFn<DBState>()(
  (set) => ({
    db: undefined,
    setDb: (dbIns?: MyDatabase) => set({ db: dbIns }),
    view: undefined,
    setView: (v: ViewInfo) => set({ view: v }),
    types: [],
    setTypes: (ts: NodeTypeObj[]) => set({ types: ts }),
    tagMap: new Map<string, CardTag>(),
    setTagMap: (ts: Map<string, CardTag>) => set({ tagMap: ts }),
    cardOp: undefined,
    setCardOp: (co: CardOp) => set({ cardOp: co }),
    viewOp: undefined,
    setViewOp: (vo: ViewOp) => set({ viewOp: vo }),
    viewEditStatus: undefined,
    setViewEditStatus: (status?: number) => set({ viewEditStatus: status }),
  }),
  Object.is
)
