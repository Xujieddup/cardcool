import React, { useCallback, useState } from "react"
import { useHistory } from "react-router-dom"
import styled from "@emotion/styled"
import { App, Avatar, Card, Divider, Space } from "antd"
import { Dropdown } from "antd"
import { ExclamationCircleFilled, UserOutlined } from "@ant-design/icons"
import { logoutApi } from "@/datasource"
import { deleteDB } from "@/datasource/localdb"
import { GetUserinfoFunc, SMSettingId, useConfigStore, useModelStore } from "@/store"
import { IconTextBtn } from "@/ui"
import { IIcon } from "@/icons"

interface Props {
  spaceId: string
}

const mSettingSelector: SMSettingId = (state) => state.setMSettingId
const userinfoSelector: GetUserinfoFunc = (state) => state.userinfo

export const HeaderUser: React.FC<Props> = ({ spaceId }) => {
  const history = useHistory()
  const { message, modal } = App.useApp()
  const setMSettingId = useModelStore(mSettingSelector)
  const userinfo = useConfigStore(userinfoSelector)
  const [open, setOpen] = useState(false)
  const handleOpenChange = (flag: boolean) => {
    setOpen(flag)
  }
  const handleJump = useCallback(
    (id: string) => {
      history.push("/" + spaceId + "/" + id)
      setOpen(false)
    },
    [history, spaceId]
  )
  const handleOpenSetting = useCallback(() => {
    setMSettingId("user")
    setOpen(false)
  }, [setMSettingId])
  const handleLogout = useCallback(() => {
    logoutApi()
    history.push("/login_mobile")
  }, [history])
  const handleRefreshDB = useCallback(() => {
    setOpen(false)
    modal.confirm({
      title: "确认重构本地数据？",
      icon: <ExclamationCircleFilled />,
      content: "重构将会先清空本地数据库，再从远端服务器拉取全量数据到本地！",
      okText: "确认",
      okType: "danger",
      cancelText: "取消",
      onOk: () => {
        deleteDB().then(() => {
          window.location.href = "/"
        })
      },
    })
  }, [modal])
  console.log("Menu - Header - User - render")
  return (
    <>
      <Dropdown
        trigger={["click"]}
        open={open}
        onOpenChange={handleOpenChange}
        dropdownRender={() => (
          <UserCard>
            <Card.Meta
              avatar={<Avatar shape="square" src={userinfo?.avatar} icon={<UserOutlined />} />}
              title={userinfo?.username || "无名"}
              description="卡酷内测进行中..."
            />
            <Divider />
            <Space direction="vertical" size={4}>
              <IconTextBtn
                onClick={handleOpenSetting}
                type="text"
                block
                icon={<IIcon icon="setting" />}
              >
                设置中心
              </IconTextBtn>
              <IconTextBtn
                onClick={() => handleJump("spaces")}
                type="text"
                block
                icon={<IIcon icon="database" />}
              >
                卡片空间
              </IconTextBtn>
              <IconTextBtn
                onClick={handleRefreshDB}
                type="text"
                block
                icon={<IIcon icon="cloudsync" />}
              >
                重构本地数据库
              </IconTextBtn>
              <IconTextBtn onClick={handleLogout} type="text" block icon={<IIcon icon="exit" />}>
                退出登录
              </IconTextBtn>
            </Space>
          </UserCard>
        )}
      >
        <UserAvatar src={userinfo?.avatar} icon={<UserOutlined />} />
      </Dropdown>
    </>
  )
}

const UserAvatar = styled(Avatar)({
  marginLeft: 6,
  "&:hover": {
    cursor: "pointer",
  },
})
const UserCard = styled(Card)({
  width: 280,
  ".ant-card-body": {
    padding: 12,
  },
  ".ant-card-meta": {
    padding: 12,
    ".ant-card-meta-title": {
      fontSize: 14,
    },
  },
  ".ant-divider": {
    margin: "8px 0",
  },
  ".ant-space": {
    width: "100%",
    ".ant-btn": {
      textAlign: "left",
    },
  },
})
