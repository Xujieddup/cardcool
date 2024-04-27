import React, { memo, useCallback, useEffect, useState } from "react"
import styled from "@emotion/styled"
import { App, Button, Popover, Space, Switch, theme, Typography } from "antd"
import { IFlexR } from "@/ui"
import { GetDBTypes, useDBStore } from "@/store"
import { IIcon } from "@/icons"
import { createShareApi, getShareInfoApi, getViewContent, updateShareStatusApi } from "@/datasource"
import { ShareInfo } from "@/types"
import { shallow } from "zustand/shallow"
import copy from "copy-to-clipboard"
import { formatDateTime } from "@/utils"
import { IconBtn } from "@/ui"

type Props = {
  viewId: string
}

const dbTypesSelector: GetDBTypes = (state) => [state.db, state.types]

const defaultShare = {
  uuid: "",
  status: 0,
  viewId: "",
  updateTime: 0,
}

export const Share = memo(({ viewId }: Props) => {
  const [db, types] = useDBStore(dbTypesSelector, shallow)
  const { message } = App.useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [shareInfo, setShareInfo] = useState<ShareInfo>(defaultShare)
  const isShare = shareInfo.status === 1
  const link = shareInfo.uuid ? "https://cardcool.top/s/" + shareInfo.uuid : ""
  const lastUpdateTime = shareInfo.updateTime > 0 ? formatDateTime(shareInfo.updateTime) : ""
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
  }, [])
  const handleShare = useCallback(() => {
    // 先查询视图信息
    db?.view.getViewById(viewId).then((view) => {
      if (view) {
        // 再查询视图内容
        getViewContent(db, view, types).then((content) => {
          createShareApi(viewId, view.name, view.type, view.icon, content).then((share) => {
            console.log("share", share)
            share && setShareInfo(share)
          })
        })
      }
    })
  }, [db, types, viewId])
  const handleChangeShareStatus = useCallback(
    (checked: boolean) => {
      console.log("handleChangeShareStatus", checked)
      const status = checked ? 1 : 0
      // 开启分享：先判断之前是否已经分享，如果未分享，则创建分享，如果已分享，则更新分享状态
      if (checked) {
        if (shareInfo.uuid === "") {
          handleShare()
          return
        }
      }
      updateShareStatusApi(viewId, status).then((res) => {
        console.log("share", res)
        setShareInfo((share) => ({ ...share, status }))
      })
    },
    [handleShare, shareInfo.uuid, viewId]
  )
  useEffect(() => {
    // 打开弹窗且 viewId 变更才会触发网络请求
    if (isOpen && shareInfo.viewId !== viewId) {
      getShareInfoApi(viewId).then((share) => {
        console.log("share", share)
        share && setShareInfo(share)
      })
    }
  }, [viewId, isOpen, shareInfo])
  const { token } = theme.useToken()
  const handleCopy = useCallback(
    (url: string) => {
      const copyRes = copy(url)
      copyRes && message.success("复制成功")
    },
    [message]
  )
  console.log("Render: Share")
  return (
    <Popover
      trigger={["click"]}
      open={isOpen}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
      overlayInnerStyle={{ width: 314 }}
      title={
        <IFlexR>
          <Typography.Text strong className="flexPlace">
            分享到互联网
          </Typography.Text>
          <Switch onChange={handleChangeShareStatus} checked={isShare} size="small" />
        </IFlexR>
      }
      content={
        isShare ? (
          <SharedBox>
            {link && (
              <LinkBox block style={{ backgroundColor: token.colorBorderSecondary }}>
                <Typography.Link href={link} ellipsis className="flexPlace" target="_blank">
                  {link}
                </Typography.Link>
                <IconBtn
                  onClick={() => handleCopy(link)}
                  type="text"
                  icon={<IIcon icon="copy" />}
                />
              </LinkBox>
            )}
            {lastUpdateTime && (
              <LinkDesc>
                <Typography.Paragraph type="secondary">
                  {"上次分享于 " + lastUpdateTime}
                  <Button onClick={handleShare} type="link" size="small">
                    发布变更
                  </Button>
                </Typography.Paragraph>
              </LinkDesc>
            )}
          </SharedBox>
        ) : (
          <LinkDesc>
            <Typography.Paragraph type="secondary">
              可通过链接访问您的分享内容...
            </Typography.Paragraph>
          </LinkDesc>
        )
      }
    >
      <IconBtn type="text" icon={<IIcon icon="share" fontSize={16} />} />
    </Popover>
  )
})

const SharedBox = styled("div")({
  paddingTop: 8,
})
const LinkBox = styled(Space.Compact)({
  paddingLeft: 8,
  borderRadius: 4,
  marginBottom: 12,
  a: {
    lineHeight: "32px",
  },
})
const LinkDesc = styled("div")({
  fontSize: 12,
  ".ant-typography": {
    marginBottom: 0,
  },
})
