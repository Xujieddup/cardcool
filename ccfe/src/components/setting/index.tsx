import React, { memo, useState } from "react"
import { UserOutlined } from "@ant-design/icons"
import { Avatar, Layout, Modal, Typography, theme } from "antd"
import styled from "@emotion/styled"
import type { StyledToken } from "@/types"
import { IconBtn, IconTextBtn } from "../ui"
import { IFlexR } from "@/ui"
import { IIcon } from "@/icons"
import { UserSetting } from "./user"
import { ThemeSetting } from "./theme"
import { GetUserinfoFunc, UseMSettingId, useConfigStore, useModelStore } from "@/store"
import cc from "classcat"
import { shallow } from "zustand/shallow"
import { IText } from "@/ui"
import { ViewSetting } from "./view"
import { VipSetting } from "./vip"
import { OtherSetting } from "./other"
import { ClientSetting } from "./client"

const userinfoSelector: GetUserinfoFunc = (state) => state.userinfo
const mSettingSelector: UseMSettingId = (state) => [state.mSettingId, state.setMSettingId]

type MenuItem = {
  id: string
  icon: string
  name: string
}

const items: MenuItem[] = [
  {
    id: "user",
    icon: "user",
    name: "用户账号",
  },
  {
    id: "vip",
    icon: "vip",
    name: "会员订阅",
  },
  {
    id: "theme",
    icon: "magic",
    name: "主题切换",
  },
  {
    id: "view",
    icon: "boards",
    name: "视图设置",
  },
  {
    id: "client",
    icon: "desktop",
    name: "客户端下载",
  },
  {
    id: "other",
    icon: "more",
    name: "其他设置",
  },
]

export const SettingView = memo(() => {
  const userinfo = useConfigStore(userinfoSelector)
  const [mSettingId, setMSettingId] = useModelStore(mSettingSelector, shallow)
  const isOpen = mSettingId !== ""
  const { token } = theme.useToken()
  const [settingId, setSettingId] = useState("user")
  const currentSetting = items.find((item) => item.id === settingId)
  console.log("Render: SettingView")
  return (
    <SettingModal
      open={isOpen}
      onCancel={() => setMSettingId("")}
      footer={null}
      closable={false}
      width="80%"
    >
      <SLayout>
        <SSider style={{ backgroundColor: token.colorBgElevated }}>
          <SiderHeader>
            <Avatar shape="square" src={userinfo?.avatar} icon={<UserOutlined />} />
            <Typography.Text ellipsis strong className="flexPlace ml8">
              {userinfo?.username || "无名"}
            </Typography.Text>
          </SiderHeader>
          <MenuContainer token={token}>
            <MenuUl>
              {items.map(({ id, icon, name }) => (
                <MenuLi key={id}>
                  <MenuItem className={cc(["item", { selected: settingId === id }])}>
                    <IText ellipsis className="flexPlace" onClick={() => setSettingId(id)}>
                      <IIcon icon={icon} />
                      {name}
                    </IText>
                  </MenuItem>
                </MenuLi>
              ))}
            </MenuUl>
          </MenuContainer>
        </SSider>
        <MainLayout style={{ backgroundColor: token.colorBgContainer, boxShadow: token.boxShadow }}>
          <HeaderBox>
            <IconTextBtn
              type="text"
              className="titleBtn"
              icon={<IIcon icon={currentSetting?.icon} />}
            >
              {currentSetting?.name}
            </IconTextBtn>
            <div className="flexPlace" />
            <IconBtn
              onClick={() => setMSettingId("")}
              type="text"
              icon={<IIcon icon="close" />}
              className="closeBtn"
            />
          </HeaderBox>
          <MainBox>
            {settingId === "user" && <UserSetting userinfo={userinfo} />}
            {settingId === "theme" && <ThemeSetting />}
            {settingId === "view" && <ViewSetting />}
            {settingId === "vip" && <VipSetting fsize={userinfo?.fsize} />}
            {settingId === "client" && <ClientSetting />}
            {settingId === "other" && <OtherSetting />}
          </MainBox>
        </MainLayout>
      </SLayout>
    </SettingModal>
  )
})

const SettingModal = styled(Modal)({
  paddingBottom: 0,
  maxWidth: 600,
  ".ant-modal-content": {
    padding: 8,
  },
  ".ant-layout": {
    backgroundColor: "inherit",
  },
})
const SLayout = styled(Layout)({})
const SSider = styled(Layout.Sider)({
  width: 180,
})
const SiderHeader = styled(IFlexR)({
  padding: "8px 8px 16px 4px",
})
const MainLayout = styled(Layout)({
  width: 400,
  minHeight: 400,
  borderRadius: 8,
  zIndex: 1,
})
const MenuContainer = styled("div")(({ token }: StyledToken) => ({
  padding: "0 12px 0 4px",
  ".titleText": {
    fontWeight: 500,
  },
  ".item:hover": {
    cursor: "pointer",
    backgroundColor: token.colorBgTextHover,
    ".hide": {
      display: "inline-block",
    },
  },
  ".item.selected": {
    backgroundColor: token.colorBgTextActive,
  },
  ".item .ant-typography": {
    paddingTop: "1px",
    paddingBottom: "1px",
  },
}))
const MenuUl = styled("ul")({
  paddingLeft: 0,
  marginBottom: 0,
  overflow: "hidden",
})
const MenuLi = styled("li")({
  listStyle: "none",
  marginTop: 2,
})
const MenuItem = styled(IFlexR)({
  padding: "4px 6px 4px 8px",
  borderRadius: 6,
})
const HeaderBox = styled(IFlexR)({
  padding: 8,
  ".ant-typography-edit-content": {
    marginTop: -2,
    insetInlineStart: 0,
  },
  ".titleBtn": {
    fontWeight: 500,
  },
  ".closeBtn": {
    opacity: 0.5,
  },
  ".closeBtn:hover": {
    opacity: 1,
  },
})
const MainBox = styled("div")({
  padding: "8px 14px",
  // ".ant-typography-edit-content": {
  //   marginTop: -2,
  //   insetInlineStart: 0,
  // },
  // ".titleBtn": {
  //   fontWeight: 500,
  // },
})
