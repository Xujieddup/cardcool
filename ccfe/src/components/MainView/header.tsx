import React, { memo, useCallback, useEffect, useState } from "react"
import styled from "@emotion/styled"
import {
  GetDB,
  SMCardId,
  SMEditView,
  SSetListSider,
  useConfigStore,
  useDBStore,
  useModelStore,
} from "@/store"
import type {
  SMTypeId,
  SMSpaceId,
  UseByHeader,
  SViewOp,
  GViewEditStatus,
  GetViewConfFunc,
} from "@/store"
import { IIcon } from "@/icons"
// import { Share } from "./share"
import { AddTextBtn, IconBtn, IFlexR } from "@/ui"
import { App, Dropdown, MenuProps, Tooltip, Typography, theme } from "antd"
import { StyledToken, View } from "@/types"
import cc from "classcat"
import { OpEnum, SpecialViewTypeEnum, ViewInlineType, ViewTypeEnum } from "@/enums"
import { useHistory } from "react-router-dom"
import { ExclamationCircleFilled } from "@ant-design/icons"
import { shallow } from "zustand/shallow"
import { InlineManager } from "./panel"
import { deleteView } from "@/datasource"

type Props = {
  spaceId: string
  viewId: string
  viewName: string
  viewIcon: string
  viewType: number
  mainViewId?: string
}

const typeSelector: SMTypeId = (state) => state.setMTypeId
const spaceSelector: SMSpaceId = (state) => state.setMSpaceId
const viewSelector: SMEditView = (state) => state.setMEditView
const viewOpSelector: SViewOp = (state) => state.setViewOp
const viewEditStatusSelector: GViewEditStatus = (state) => state.viewEditStatus
const menuSelector: UseByHeader = (state) => [
  state.switchMenuOpen,
  state.menuRefreshVal,
  state.refreshMenu,
]
const dbSelector: GetDB = (state) => state.db
const cardSelector: SMCardId = (state) => state.setMCardId
const listSiderSelector: SSetListSider = (state) => state.setListSider
const viewConfSelector: GetViewConfFunc = (state) => state.viewConf

const items = [
  { key: "edit", icon: <IIcon icon="edit" />, label: "编辑视图" },
  { key: "unfavor", icon: <IIcon icon="favorfill" />, label: "取消标记" },
  { key: "delete", icon: <IIcon icon="delete" />, danger: true, label: "删除" },
]
const items2 = [
  { key: "edit", icon: <IIcon icon="edit" />, label: "编辑视图" },
  { key: "favor", icon: <IIcon icon="favor" />, label: "标记" },
  { key: "delete", icon: <IIcon icon="delete" />, danger: true, label: "删除" },
]

export const HeaderView = memo(
  ({ spaceId, viewId, viewName, viewIcon, viewType, mainViewId }: Props) => {
    const db = useDBStore(dbSelector)
    const history = useHistory()
    const { modal, message } = App.useApp()
    const { token } = theme.useToken()
    const isNormalView = viewType >= 0
    const showSaveStatus = viewType === ViewTypeEnum.DOC || viewType === ViewTypeEnum.MDOC
    const showCreateCardBtn =
      viewType !== SpecialViewTypeEnum.SPACES &&
      viewType !== SpecialViewTypeEnum.TYPES &&
      !showSaveStatus
    const setMEditView = useModelStore(viewSelector)
    const viewConf = useConfigStore(viewConfSelector)
    const setViewOp = useDBStore(viewOpSelector)
    const viewEditStatus = useDBStore(viewEditStatusSelector)
    // 侧边栏切换
    const [switchMenuOpen, menuRefreshVal, refreshMenu] = useModelStore(menuSelector, shallow)
    const setListSider = useModelStore(listSiderSelector)
    const [mainView, setMainView] = useState<View>()
    const [inlineViews, setInlineViews] = useState<View[]>([])
    useEffect(() => {
      if (isNormalView) {
        db?.view.getViewAndInlineViews(mainViewId || viewId).then((views) => {
          const [mainView, ...inlineViews] = views
          setMainView(mainView)
          setInlineViews(inlineViews)
          // console.log("views", views)
        })
      } else {
        setMainView(undefined)
        setInlineViews([])
      }
    }, [viewId, mainViewId, db, isNormalView, menuRefreshVal])
    const handleJump = useCallback(
      (viewId: string) => {
        history.push("/" + spaceId + "/" + viewId)
      },
      [history, spaceId]
    )
    const showDeleteConfirm = useCallback(
      (id: string) => {
        const content =
          mainViewId && mainViewId !== id
            ? "是否确认删除该内联视图？请慎重操作！"
            : "一经确认，当前视图及其所有子视图和内联视图均将被删除！请慎重操作！"
        modal.confirm({
          title: "删除视图？",
          icon: <ExclamationCircleFilled />,
          content: content,
          okText: "确认",
          okType: "danger",
          cancelText: "取消",
          onOk() {
            deleteView(db, id).then((vids) => {
              message.success("删除视图成功！")
              setViewOp({ op: OpEnum.DELETE, ids: vids })
              mainViewId ? handleJump(mainViewId) : refreshMenu("views")
            })
          },
        })
      },
      [db, handleJump, mainViewId, message, modal, refreshMenu, setViewOp]
    )
    // 设置和取消星标
    const setFavor = useCallback(
      (id: string, isFavor: boolean) => {
        db?.view.updateViewFavor(id, isFavor).then(() => {
          refreshMenu()
        })
      },
      [db?.view, refreshMenu]
    )
    const handleClick: MenuProps["onClick"] = useCallback(
      ({ key }: { key: string }) => {
        const id = mainViewId || viewId
        if (key === "edit") {
          setMEditView({ viewId: id, spaceId })
        } else if (key === "delete") {
          showDeleteConfirm(id)
        } else if (key === "favor") {
          setFavor(id, true)
        } else if (key === "unfavor") {
          setFavor(id, false)
        }
        setOpen(false)
      },
      [mainViewId, setFavor, setMEditView, showDeleteConfirm, spaceId, viewId]
    )
    // 创建内联视图
    const handleAddView = useCallback(() => {
      setMEditView({
        viewId: "",
        spaceId: spaceId,
        pid: mainViewId || viewId,
        currType: viewType,
        inlineType: ViewInlineType.INLINE,
      })
    }, [mainViewId, setMEditView, spaceId, viewId, viewType])
    // 新卡片
    const setMCardId = useModelStore(cardSelector)
    const handleCreateNewCard = useCallback(() => {
      setMCardId("")
    }, [setMCardId])
    // 新模板
    const setMTypeId = useModelStore(typeSelector)
    const handleCreateCardType = useCallback(() => {
      setMTypeId("")
    }, [setMTypeId])
    // 新空间
    const setMSpaceId = useModelStore(spaceSelector)
    const handleCreateSpace = useCallback(() => {
      setMSpaceId("")
    }, [setMSpaceId])
    const [open, setOpen] = useState(false)
    const handleOpenChange = useCallback((newOpen: boolean) => {
      setOpen(newOpen)
    }, [])
    console.log("Render: MainHeader")
    return (
      <HeaderBox token={token} className="mainHeaderBox">
        <IconBtn
          onClick={switchMenuOpen}
          type="text"
          className="shrink mr-1"
          icon={<IIcon icon="siderl" fontSize={18} />}
        />
        {!isNormalView ? (
          <ViewItem className={cc(["item", "systemItem"])}>
            <IIcon icon={viewIcon + "fill"} />
            <Typography.Text className="name" ellipsis>
              {viewName}
            </Typography.Text>
          </ViewItem>
        ) : mainView ? (
          <ViewItem
            className={cc(["item", { selected: mainView.id === viewId }])}
            onClick={() => mainView.id !== viewId && !open && handleJump(mainView.id)}
          >
            <IIcon icon={mainView.icon + (mainView.id === viewId ? "fill" : "")} />
            <Typography.Text className="name" ellipsis>
              {(mainView.id === viewId ? viewName : mainView.name) || "未命名"}
            </Typography.Text>
            <Dropdown
              menu={{ items: mainView.is_favor ? items : items2, onClick: handleClick }}
              open={open}
              onOpenChange={handleOpenChange}
              trigger={["click"]}
              placement="bottom"
            >
              <IconBtn
                size="small"
                type="text"
                className="mainMore"
                icon={<IIcon icon="vmore" />}
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          </ViewItem>
        ) : null}
        <InlineViewDiv className="hideScrollbar">
          {inlineViews.map((view) => (
            <ViewItem
              key={"iv_" + view.id}
              className={cc(["item", { selected: view.id === viewId }])}
              onClick={() => handleJump?.(view.id)}
            >
              <IIcon icon={view.icon + (view.id === viewId ? "fill" : "")} />
              <Typography.Text className="name" ellipsis>
                {(view.id === viewId ? viewName : view.name) || "未命名"}
              </Typography.Text>
            </ViewItem>
          ))}
        </InlineViewDiv>
        {isNormalView &&
          mainView &&
          (inlineViews.length > 0 ? (
            <InlineManager
              spaceId={spaceId}
              viewId={viewId}
              mainViewId={mainViewId || viewId}
              viewConf={viewConf}
              viewType={viewType}
              inlineViews={inlineViews}
              setInlineViews={setInlineViews}
              setMEditView={setMEditView}
              showDeleteConfirm={showDeleteConfirm}
            />
          ) : (
            viewConf.inlineView && (
              <Tooltip title="创建内联视图" placement="right">
                <IconBtn
                  onClick={handleAddView}
                  className="mr-1 shrink"
                  type="text"
                  icon={<IIcon icon="plus" />}
                />
              </Tooltip>
            )
          ))}
        <div className="flexPlace" />
        {viewType === SpecialViewTypeEnum.SPACES && (
          <AddTextBtn type="text" icon={<IIcon icon="plus" />} onClick={handleCreateSpace}>
            新空间
          </AddTextBtn>
        )}
        {viewType === SpecialViewTypeEnum.TYPES && (
          <AddTextBtn type="text" icon={<IIcon icon="plus" />} onClick={handleCreateCardType}>
            新模板
          </AddTextBtn>
        )}
        {showCreateCardBtn && (
          <AddTextBtn type="text" icon={<IIcon icon="plus" />} onClick={handleCreateNewCard}>
            新卡片
          </AddTextBtn>
        )}
        {/* 暂时隐藏分享功能 TODO */}
        {/* {viewType >= 0 && <Share viewId={viewId} />} */}
        {viewType === ViewTypeEnum.BOARD && (
          <IconBtn
            onClick={() => setListSider()}
            type="text"
            icon={<IIcon icon="siderr" fontSize={18} />}
          />
        )}
        {showSaveStatus && viewEditStatus !== undefined && (
          <IFlexR className="view_edit_status">
            <span className={cc(["dot", { status_editing: viewEditStatus === 1 }])} />
            <Typography.Text ellipsis type="secondary" style={{ fontSize: 12 }}>
              {viewEditStatus === 1 ? "编辑中" : "已保存"}
            </Typography.Text>
          </IFlexR>
        )}
      </HeaderBox>
    )
  }
)

const HeaderBox = styled(IFlexR)(({ token }: StyledToken) => ({
  padding: 8,
  ".ant-typography-edit-content": {
    marginTop: -2,
    insetInlineStart: 0,
  },
  ".mainMore": {
    margin: "0 -7px 0 1px",
    opacity: 0.5,
  },
  ".mainMore:hover": {
    opacity: 1,
  },
  ".name": {
    fontWeight: 500,
    fontSize: 13,
    marginLeft: 4,
    lineHeight: "24px",
  },
  ".item.systemItem, .item.selected": {
    opacity: 1,
  },
  ".item:hover": {
    cursor: "pointer",
    backgroundColor: token.colorBorderSecondary,
    opacity: 1,
  },
  ".view_edit_status": {
    paddingRight: 8,
    ".dot": {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: token.colorSuccess,
      marginRight: 4,
      "&.status_editing": {
        background: token.colorWarning,
      },
    },
    "&:hover": {
      cursor: "default",
    },
  },
}))

const ViewItem = styled(IFlexR)({
  padding: "4px 10px 4px 8px",
  borderRadius: 6,
  position: "relative",
  userSelect: "none",
  marginRight: 4,
  opacity: 0.6,
})
const InlineViewDiv = styled(IFlexR)({
  overflowX: "auto",
})
