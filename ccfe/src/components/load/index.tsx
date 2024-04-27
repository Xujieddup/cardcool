import React, { memo, ReactNode, useMemo } from "react"
import { Button, Modal, Typography } from "antd"
import { AlertTwoTone, SyncOutlined, WarningTwoTone } from "@ant-design/icons"
import styled from "@emotion/styled"
import { deleteDB } from "@/datasource/localdb"
import { DBStatusEnum } from "@/enums"

type ExceProp = {
  status: DBStatusEnum
  title: ReactNode
  content: ReactNode
  footer: ReactNode[]
}

const refreshPage = () => {
  location.reload()
}
const refreshDB = () => {
  deleteDB().then(() => {
    window.location.href = "/"
  })
}

type Props = {
  status: DBStatusEnum
  reloadAllPage: () => void
}
export const Load: React.FC<Props> = memo(({ status, reloadAllPage }: Props) => {
  const exceptions: ExceProp[] = useMemo(
    () => [
      {
        status: DBStatusEnum.SYNCING,
        title: (
          <>
            数据同步中
            <SyncOutlined spin style={{ marginLeft: 8 }} />
          </>
        ),
        content: "正在同步远端数据，请稍等...",
        footer: [],
      },
      {
        status: DBStatusEnum.TIMEERR,
        title: (
          <>
            <WarningTwoTone twoToneColor="#f00" />
            本地时间异常
          </>
        ),
        content: "暂无法加载卡酷！请修正您的本地时间之后刷新重试！！！",
        footer: [
          <Button key="back" type="primary" onClick={refreshPage}>
            刷新页面
          </Button>,
        ],
      },
      {
        status: DBStatusEnum.DATAERR,
        title: (
          <>
            <AlertTwoTone twoToneColor="#f00" />
            本地数据异常
          </>
        ),
        content: "加载本地数据出现异常，请刷新重试或重构本地数据库！",
        footer: [
          <Button key="submit" danger onClick={refreshDB}>
            重构本地数据库
          </Button>,
          <Button key="back" type="primary" onClick={refreshPage}>
            刷新页面
          </Button>,
        ],
      },
      {
        status: DBStatusEnum.VERSIONERR,
        title: (
          <>
            浏览器版本过低
            <WarningTwoTone style={{ marginLeft: 8 }} twoToneColor="#f00" />
          </>
        ),
        content: "请升级您的浏览器：Chrome > 87，Firefox > 78，Safari > 14，Edge > 88",
        footer: [],
      },
      {
        status: DBStatusEnum.REMOTEUPDATE,
        title: (
          <>
            <WarningTwoTone twoToneColor="#f00" />
            远端数据已更新
          </>
        ),
        content: "请刷新页面，加载远端数据...",
        footer: [
          <Button key="back" type="primary" onClick={reloadAllPage}>
            刷新页面
          </Button>,
        ],
      },
    ],
    [reloadAllPage]
  )
  const e = useMemo(() => exceptions.find((i) => i.status === status), [exceptions, status])
  console.log("Render: LoadPage")
  return e ? (
    <LoadModal title={e.title} centered open={true} closable={false} footer={e.footer}>
      <Typography>{e.content}</Typography>
    </LoadModal>
  ) : null
})

const LoadModal = styled(Modal)({
  ".ant-modal-title .anticon": {
    marginRight: 8,
  },
  ".ant-modal-body": {
    paddingTop: 8,
  },
  ".ant-modal-footer": {
    marginTop: 20,
  },
})
