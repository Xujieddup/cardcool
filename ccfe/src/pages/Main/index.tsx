import React, { memo, useCallback, useEffect, useMemo, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { MenuView } from "@/components/MenuView"
import { MainView } from "@/components/MainView"
import { getSpecialViewInfo, isElectron, isMac } from "@/utils"
import type { StyledToken, CardTag, View } from "@/types"
import { Global } from "@emotion/react"
import styled from "@emotion/styled"
import { App, FloatButton, Layout, Popover, QRCode, Typography, theme } from "antd"
import {
  UseListSider,
  GMenuOpen,
  SMCardId,
  useModelStore,
  useDBStore,
  GetDB,
  GetSetTagMap,
  GetSystemConfFunc,
  useConfigStore,
} from "@/store"
import { SiderList } from "@/views"
import { shallow } from "zustand/shallow"
import { CreateSpace } from "@/components/load/createSpace"
import { SettingView } from "@/components/setting"
import { getLocalSpaceId, setLocalSpaceId } from "@/datasource"
import { SpecialViewEnum, ViewInlineType } from "@/enums"
import { DdMenuBox } from "./ddmenu"
import { QRCODE, getGlobalStyle } from "@/config"
import { WechatOutlined } from "@ant-design/icons"
import cc from "classcat"

const dbSelector: GetDB = (state) => state.db
const tagSelector: GetSetTagMap = (state) => state.setTagMap
const mCardSelector: SMCardId = (state) => state.setMCardId
let queryHandler: any = null
let tagQueryHandler: any = null

type PathProp = {
  spaceId?: string
  viewId?: string
}

export const PreMain = memo(() => {
  const { spaceId: pathSpaceId = "", viewId = SpecialViewEnum.CARDS } = useParams<PathProp>()
  const db = useDBStore(dbSelector)
  const setTagMap = useDBStore(tagSelector)
  const { message } = App.useApp()
  const history = useHistory()
  const setMCardId = useModelStore(mCardSelector)
  const [forceCreateSpace, setForceCreateSpace] = useState(false)
  const [view, setView] = useState<View>()
  const errJump = useCallback(
    (msg: string, path: string) => {
      message.error(msg).then(() => {
        history.push(path)
      })
    },
    [history, message]
  )
  useEffect(() => {
    // 跳转页面时，自动关闭卡片编辑弹窗
    setMCardId()
    const localSpaceId = getLocalSpaceId()
    let sId = pathSpaceId && pathSpaceId !== "_" ? pathSpaceId : localSpaceId
    db?.space
      .getAllSpaceIds()
      .then((sIds) => {
        // 如果没有查询到空间数据，则跳转到创建空间的弹窗
        setForceCreateSpace(sIds.length <= 0)
        if (sIds.length <= 0) {
          return false
        }
        if (sId === "") {
          sId = sIds[0]
        }
        // 如果不存在
        if (!sIds.includes(sId)) {
          setLocalSpaceId("")
          errJump("未查询到空间数据！", "/")
          return false
        }
        if (sId !== localSpaceId) {
          setLocalSpaceId(sId)
        }
        return true
      })
      .then((spaceCheckRes) => {
        if (spaceCheckRes) {
          const view = getSpecialViewInfo(sId, viewId)
          if (view) {
            setView(view)
          } else {
            db?.view.getViewQuery(viewId).then((query) => {
              queryHandler = query.$.subscribe((viewDoc) => {
                if (viewDoc) {
                  const view = viewDoc.toJSON() as View
                  if (view.space_id !== sId) {
                    errJump("视图数据异常！", "/" + sId)
                  } else {
                    console.log("getViewQuery: ", view)
                    setView(view)
                  }
                } else {
                  setView(undefined)
                }
              })
            })
          }
        }
      })
    return () => queryHandler?.unsubscribe()
  }, [db, pathSpaceId, setMCardId, setView, viewId, errJump])
  useEffect(() => {
    if (view?.space_id) {
      db?.tag.getTagQuery(view.space_id).then((query) => {
        tagQueryHandler = query.$.subscribe((tagDocs) => {
          const map = new Map<string, CardTag>()
          tagDocs.forEach((tag) => {
            map.set(tag.id, tag.toJSON() as CardTag)
          })
          setTagMap(map)
        })
      })
      return () => tagQueryHandler?.unsubscribe()
    }
  }, [db, setTagMap, view?.space_id])
  // console.log("Render: PreMain")
  return forceCreateSpace && db ? <CreateSpace db={db} /> : view ? <Main view={view} /> : null
})

const selector: GMenuOpen = (state) => state.menuOpen
const listSiderSelector: UseListSider = (state) => [state.listSider, state.setListSider]
const systemConfSelector: GetSystemConfFunc = (state) => state.systemConf

export type MainProp = {
  view: View
}
const Main = memo(({ view }: MainProp) => {
  const { token } = theme.useToken()
  const menuOpen = useModelStore(selector)
  const [listSider, setListSider] = useModelStore(listSiderSelector, shallow)
  const systemConf = useConfigStore(systemConfSelector)
  const needCloseListSider = view.type !== 1 && listSider
  useEffect(() => {
    needCloseListSider && setListSider(false)
  }, [needCloseListSider, setListSider])
  const globalStyle = useMemo(() => getGlobalStyle(token), [token])
  const menuId = view.inline_type === ViewInlineType.INLINE ? view.pid : view.id
  console.log("Render: Main")
  return (
    <>
      <ILayout token={token} hasSider className={cc({ mac: isMac, electron: isElectron })}>
        <ISider
          width={280}
          collapsed={!menuOpen}
          collapsible
          collapsedWidth={0}
          trigger={null}
          style={{ backgroundColor: token.colorBgLayout }}
        >
          <MenuView spaceId={view.space_id} viewId={menuId} />
          <SettingView />
        </ISider>
        <MainLayout
          style={{ backgroundColor: token.colorBgContainer, boxShadow: token.boxShadow }}
          className={cc({ menuClose: !menuOpen })}
        >
          <MainView view={view} />
        </MainLayout>
        <ListSider
          width={292}
          collapsed={!listSider}
          collapsible
          collapsedWidth={0}
          trigger={null}
          style={{ backgroundColor: token.colorBgLayout }}
        >
          {listSider && <SiderList spaceId={view.space_id} />}
        </ListSider>
        {systemConf.wechatFloat && (
          <Popover
            trigger="click"
            placement="leftBottom"
            content={
              <QrcodeBox>
                <Typography.Paragraph style={{ margin: "8px 0 0" }}>
                  意见反馈交流请扫码加微信
                </Typography.Paragraph>
                <QRCode
                  errorLevel="M"
                  value={QRCODE}
                  bordered={false}
                  size={180}
                  icon="https://static.cardcool.top/cc/ac"
                />
              </QrcodeBox>
            }
          >
            <FloatButton icon={<WechatOutlined />} style={{ right: 16, bottom: 64 }} />
          </Popover>
        )}
      </ILayout>
      <Global styles={globalStyle} />
    </>
  )
})

// 定义通用样式
const ILayout = styled(Layout)(({ token }: StyledToken) => ({
  height: "100vh",
  backgroundColor: token.colorBgLayout,
  ".bgIcon": {
    backgroundColor: token.colorPrimary,
    color: token.colorBgContainer,
  },
  ".colorBgElevated": {
    backgroundColor: token.colorBgElevated,
  },
  ".normalBg": {
    backgroundColor: token.colorBgContainer,
  },
  ".greyHoverBg:hover": {
    backgroundColor: token.colorBorderSecondary,
  },
  ".hoverBg:hover, .hoverBgBtn.ant-btn-text:hover": {
    backgroundColor: token.colorBorder,
  },
  ".bgPrimary": {
    backgroundColor: token.colorPrimary,
  },
  ".colorPrimary": {
    color: token.colorPrimary,
  },
}))
const ISider = styled(Layout.Sider)({
  height: "100vh",
})
const MainLayout = styled(Layout)({
  margin: 8,
  borderRadius: 8,
  zIndex: 1,
  position: "relative",
  overflow: "hidden",
})
const ListSider = styled(Layout.Sider)({
  borderRadius: 8,
})

const QrcodeBox = styled("div")({
  // marginBottom: 30,
  textAlign: "center",
})
