import React, { memo, useMemo } from "react"
import { Typography } from "antd"
import { IFlexRB } from "@/ui"
import styled from "@emotion/styled"

type Props = {
  fsize?: string
}

export const VipSetting = memo(({ fsize }: Props) => {
  const fsizeStr = useMemo(() => {
    if (!fsize) return ""
    const size = parseInt(fsize)
    if (size <= 1024) return "1KB"
    else if (size <= 1048576) return (size / 1024).toFixed(2) + "KB"
    else if (size <= 1073741824) return (size / 1048576).toFixed(2) + "MB"
    else return (size / 1073741824).toFixed(2) + "GB"
  }, [fsize])
  // console.log("Render: VipSetting")
  return (
    <>
      <ItemBox>
        <TextLabel type="warning">免费使用</TextLabel>
        <IFlexRB>
          <Typography.Text>
            当前用户量不多，开发君还能够承担起服务器流量费用，大家可以免费使用~
          </Typography.Text>
          {/* <Typography.Text type="warning">2023-12-31</Typography.Text> */}
        </IFlexRB>
      </ItemBox>
      <ItemBox>
        <TextLabel type="secondary">资源额度</TextLabel>
        <IFlexRB>
          <Typography.Text>图片、文件等资源上传额度</Typography.Text>
          <Typography.Text>
            <Typography.Text type="success">{fsizeStr}</Typography.Text>/1G
          </Typography.Text>
        </IFlexRB>
      </ItemBox>
    </>
  )
})

const ItemBox = styled("div")({
  marginBottom: 16,
  "&>div": {
    marginBottom: 4,
  },
})

const TextLabel = styled(Typography.Paragraph)({
  "&.ant-typography": {
    marginBottom: 6,
  },
})
