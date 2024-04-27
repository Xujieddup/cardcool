import { createWithEqualityFn } from "zustand/traditional"
import { getLocalMenuOpen, setLocalMenuOpen } from "@/datasource"
import { ViewInlineType, ViewTypeEnum } from "@/enums"
import type { DdMenu, InsertViewCfg, RuleSnap, ScreenProp } from "@/types"
import { fullScreen, menuScreen } from "@/config"

// 卡片模板信息编辑弹窗，undefined-不弹窗，""-弹窗新增模板，"xxx"-弹窗修改模板
export type MTypeId = string | undefined
export type SetMTypeId = (tId?: string) => void
export type GMTypeId = (state: ModelState) => MTypeId
export type SMTypeId = (state: ModelState) => SetMTypeId
export type UseMTypeId = (state: ModelState) => [MTypeId, SetMTypeId]

// 卡片空间编辑弹窗，undefined-不弹窗，""-弹窗新增空间，"xxx"-弹窗修改空间
export type MSpaceId = string | undefined
export type SetMSpaceId = (tId?: string) => void
export type GMSpaceId = (state: ModelState) => MSpaceId
export type SMSpaceId = (state: ModelState) => SetMSpaceId
export type UseMSpaceId = (state: ModelState) => [MSpaceId, SetMSpaceId]

// 卡片视图编辑弹窗，undefined-不弹窗，view_id 为 ""-新增视图，view_id 不为空-弹窗修改视图
// viewId 和 spaceId 无论新增还是修改都必传，pid/config/currType/allowTypes 只有新增时才传(allowTypes只要传值就表示不能创建白板)
type EditView = {
  viewId: string
  spaceId: string
  pid?: string
  config?: InsertViewCfg
  currType?: ViewTypeEnum
  allowTypes?: number
  inlineType?: ViewInlineType
}
export type MEditView = EditView | undefined
export type SetMEditView = (ev?: EditView) => void
export type GMEditView = (state: ModelState) => MEditView
export type SMEditView = (state: ModelState) => SetMEditView
export type UseMEditView = (state: ModelState) => [MEditView, SetMEditView, RefreshMenu]

// 卡片编辑弹窗，undefined-不弹窗，"xxx"-弹窗修改（新增时会直接创建然后修改弹窗）
export type MCardId = string | undefined
export type SetMCardId = (tId?: string) => void
export type GMCardId = (state: ModelState) => MCardId
export type SMCardId = (state: ModelState) => SetMCardId
export type UseMCardId = (state: ModelState) => [MCardId, SetMCardId]

// 卡片模板属性编辑弹窗，undefined-不弹窗，"xxx"-弹窗修改模板属性
export type MTPropTypeId = string | undefined
export type SetMTPropTypeId = (tId?: string) => void
export type GMTPropTypeId = (state: ModelState) => MTPropTypeId
export type SMTPropTypeId = (state: ModelState) => SetMTPropTypeId
export type UseMTPropTypeId = (state: ModelState) => [MTPropTypeId, SetMTPropTypeId]
export type UseMTypeAndPropId = (state: ModelState) => [SetMTypeId, SetMTPropTypeId]
export type UseMTypeAndPropEditId = (state: ModelState) => [MTypeId, SetMTypeId, SetMTPropTypeId]

export type SwitchMenuOpen = () => void
export type GMenuOpen = (state: ModelState) => boolean
export type SSwitchMenuOpen = (state: ModelState) => SwitchMenuOpen
export type UseMenuOpen = (state: ModelState) => [boolean, SwitchMenuOpen]
export type GScreenProp = (state: ModelState) => ScreenProp

export type MenuRefreshVal = { time: number; viewId?: string }
export type RefreshMenu = (viewId?: string) => void
export type GSRefreshMenu = (state: ModelState) => RefreshMenu
export type UseByHeader = (state: ModelState) => [SwitchMenuOpen, MenuRefreshVal, RefreshMenu]
export type UseByMenu = (state: ModelState) => [MenuRefreshVal, RefreshMenu, SetMEditView]

export type SetListSider = (lsider?: boolean) => void
export type GListSider = (state: ModelState) => boolean
export type SSetListSider = (state: ModelState) => SetListSider
export type UseListSider = (state: ModelState) => [boolean, SetListSider]

export type GMenuSideOpen = (state: ModelState) => [boolean, boolean]

// 设置中心弹窗，""-不弹窗，"xxx"-弹窗
export type MSettingId = string
export type SetMSettingId = (sId: string) => void
export type GMSettingId = (state: ModelState) => MSettingId
export type SMSettingId = (state: ModelState) => SetMSettingId
export type UseMSettingId = (state: ModelState) => [MSettingId, SetMSettingId]

export type SetRuleOpenTime = () => void
export type GRuleOpenTime = (state: ModelState) => number
export type SRuleOpenTime = (state: ModelState) => SetRuleOpenTime

// 设置快照名字
export type SetRuleSnap = (rs?: RuleSnap) => void
export type GRuleSnap = (state: ModelState) => RuleSnap | undefined
export type SRuleSnap = (state: ModelState) => SetRuleSnap
export type UseRuleSnap = (state: ModelState) => [RuleSnap | undefined, SetRuleSnap]

// 下拉弹窗菜单
export type SetDdMenu = (d: DdMenu) => void
export type GDdMenu = (state: ModelState) => DdMenu
export type SDdMenu = (state: ModelState) => SetDdMenu
export type UseDdMenu = (state: ModelState) => [DdMenu, SetDdMenu]

export type ModelState = {
  mTypeId: MTypeId
  setMTypeId: SetMTypeId
  mSpaceId: MSpaceId
  setMSpaceId: SetMSpaceId
  mEditView: MEditView
  setMEditView: SetMEditView
  mCardId: MCardId
  setMCardId: SetMCardId
  mTPropTypeId: MTPropTypeId
  setMTPropTypeId: SetMTPropTypeId
  menuOpen: boolean
  switchMenuOpen: SwitchMenuOpen
  screenProp: ScreenProp
  menuRefreshVal: MenuRefreshVal
  refreshMenu: RefreshMenu
  listSider: boolean
  setListSider: SetListSider
  mSettingId: MSettingId
  setMSettingId: SetMSettingId
  ruleOpenTime: number
  setRuleOpenTime: SetRuleOpenTime
  ruleSnap?: RuleSnap
  setRuleSnap: SetRuleSnap
  ddMenu: DdMenu
  setDdMenu: SetDdMenu
}

export const useModelStore = createWithEqualityFn<ModelState>()(
  (set) => ({
    mTypeId: undefined,
    setMTypeId: (tId?: string) => set({ mTypeId: tId }),
    mSpaceId: undefined,
    setMSpaceId: (sId?: string) => set({ mSpaceId: sId }),
    mEditView: undefined,
    setMEditView: (ev: MEditView) => set({ mEditView: ev }),
    mCardId: undefined,
    setMCardId: (cId?: string) => set({ mCardId: cId }),
    mTPropTypeId: undefined,
    setMTPropTypeId: (tId?: string) => set({ mTPropTypeId: tId }),
    menuOpen: getLocalMenuOpen(),
    switchMenuOpen: () =>
      set((state) => {
        setLocalMenuOpen(!state.menuOpen)
        const newMenuOpen = !state.menuOpen
        return { menuOpen: newMenuOpen, screenProp: newMenuOpen ? menuScreen : fullScreen }
      }),
    screenProp: getLocalMenuOpen() ? menuScreen : fullScreen,
    menuRefreshVal: { time: 0 },
    refreshMenu: (viewId?: string) => set({ menuRefreshVal: { time: Date.now(), viewId } }),
    listSider: false,
    setListSider: (lsider?: boolean) =>
      set((state) => ({ listSider: lsider === undefined ? !state.listSider : lsider })),
    switchListSider: () => set((state) => ({ listSider: !state.listSider })),
    mSettingId: "",
    setMSettingId: (sId: string) => set({ mSettingId: sId }),
    ruleOpenTime: 0,
    setRuleOpenTime: () => set({ ruleOpenTime: Date.now() }),
    ruleSnap: undefined,
    setRuleSnap: (rs?: RuleSnap) => set({ ruleSnap: rs }),
    ddMenu: { x: 0, y: 0, w: 0, h: 0, items: [] },
    setDdMenu: (d: DdMenu) => set({ ddMenu: d }),
  }),
  Object.is
)
