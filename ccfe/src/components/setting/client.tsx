import React, { useEffect, useState } from "react"
import { AlertOutlined, LinkOutlined } from "@ant-design/icons"
import { Typography, theme } from "antd"
import { IFlexR } from "@/ui"
import styled from "@emotion/styled"
import { getClientApi } from "@/datasource"
import { ClientInfo } from "@/types"
import { CLIENT_VERSION } from "@/config"

export const ClientSetting = React.memo(() => {
  const { token } = theme.useToken()
  const [client, setClient] = useState<ClientInfo>()
  useEffect(() => {
    getClientApi().then((clientData) => {
      clientData && setClient(clientData)
    })
  }, [])
  console.log("Render: ClientSetting")
  return (
    <>
      <ItemBox>
        <TextLabel type="secondary">
          当前版本 <Typography.Text type="success">{CLIENT_VERSION}</Typography.Text>
        </TextLabel>
        <Typography.Text>
          <AlertOutlined style={{ color: "red", marginRight: 2 }} />
          当前更新频次较高，建议直接使用{" "}
          <Typography.Text type="warning">在线网页端</Typography.Text>
          ，或客户端的 <Typography.Text type="warning">在线版</Typography.Text>
        </Typography.Text>
      </ItemBox>
      {client && (
        <>
          <ItemBox>
            <TextLabel type="secondary">
              夸克网盘 <Typography.Text type="warning">{client.version}</Typography.Text>
            </TextLabel>
            <ItemBlock style={{ backgroundColor: token.colorBorderSecondary }}>
              <ItemText ellipsis>
                <LinkOutlined />
                <Typography.Link href={client.kuake} target="_blank">
                  {client.kuake}
                </Typography.Link>
              </ItemText>
            </ItemBlock>
          </ItemBox>
          <ItemBox>
            <TextLabel type="secondary">
              百度网盘 <Typography.Text type="warning">{client.version}</Typography.Text>
            </TextLabel>
            <ItemBlock style={{ backgroundColor: token.colorBorderSecondary }}>
              <ItemText ellipsis>
                <LinkOutlined />
                <Typography.Link href={client.baidu} target="_blank">
                  {client.baidu}
                </Typography.Link>
              </ItemText>
            </ItemBlock>
          </ItemBox>
        </>
      )}
    </>
  )
})

const ItemBox = styled("div")({
  marginBottom: 16,
})

const TextLabel = styled(Typography.Paragraph)({
  "&.ant-typography": {
    marginBottom: 6,
  },
})

const ItemBlock = styled(IFlexR)({
  borderRadius: 6,
  paddingLeft: 8,
})
const ItemText = styled(Typography.Text)({
  flex: 1,
  lineHeight: "32px",
  ".anticon": { marginRight: 6 },
})
