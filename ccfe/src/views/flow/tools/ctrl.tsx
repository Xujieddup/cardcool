import React, { memo } from "react"
import styled from "@emotion/styled"
import { StyledToken } from "@/types"
import { Space, theme } from "antd"
import { IconBtn } from "@/ui"
import { IIcon } from "@/icons"
import { useReactFlow, Panel } from "@/reactflow"

export const FlowCtrl = memo(() => {
  const { token } = theme.useToken()
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  const onZoomInHandler = () => {
    zoomIn({ duration: 600 })
  }

  const onZoomOutHandler = () => {
    zoomOut({ duration: 600 })
  }

  const onFitViewHandler = () => {
    fitView({ maxZoom: 1, duration: 600 })
  }

  return (
    <Panel position="bottom-right">
      <CtrlBox token={token}>
        <Space size={2}>
          <IconBtn onClick={onZoomInHandler} type="text" icon={<IIcon icon="plus" />} />
          <IconBtn onClick={onZoomOutHandler} type="text" icon={<IIcon icon="minus" />} />
          <IconBtn onClick={onFitViewHandler} type="text" icon={<IIcon icon="fitview" />} />
        </Space>
      </CtrlBox>
    </Panel>
  )
})

const CtrlBox = styled("div")(({ token }: StyledToken) => ({
  padding: 4,
  borderRadius: 6,
  backgroundColor: token.colorBgContainer,
  boxShadow: token.boxShadow,
}))
