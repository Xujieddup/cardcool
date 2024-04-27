import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import { Drawer, theme } from "antd"
import { Resizable } from "re-resizable"
import { getLocalSideCardWidth, setLocalSideCardWidth } from "@/datasource"
import cc from "classcat"
import { GMenuSideOpen, useModelStore } from "@/store"
import { shallow } from "zustand/shallow"
import styled from "@emotion/styled"

interface Props {
  open: boolean
  full: boolean
  children: ReactNode
}

const initWidth = getLocalSideCardWidth()
// 获取拖拽相关参数
const resizeDiretion = {
  top: false,
  right: false,
  bottom: false,
  left: true,
  topRight: false,
  bottomRight: false,
  bottomLeft: false,
  topLeft: false,
}
const handleStyles = {
  left: {
    width: "3px",
    left: "0",
  },
}
const sideSelector: GMenuSideOpen = (state) => [state.menuOpen, state.listSider]

export const CardDrawer: React.FC<Props> = ({ open, full, children }: Props) => {
  const { token } = theme.useToken()
  const [width, setWidth] = useState<number>(initWidth)
  const [menuOpen, sideOpen] = useModelStore(sideSelector, shallow)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const maxWidth = useMemo(
    () => windowWidth - (menuOpen ? 280 : 0) - (sideOpen ? 280 : 0) - 32,
    [menuOpen, sideOpen, windowWidth]
  )
  const size = {
    width: full ? maxWidth : width,
    height: "100%",
  }
  useEffect(() => {
    window.onresize = () => {
      setWindowWidth(window.innerWidth)
    }
  }, [])
  // 拖拽更新宽度
  const setResizeSizeValue = useCallback((w: number) => {
    setWidth((oldWidth) => {
      const nw = oldWidth + w
      setLocalSideCardWidth(nw)
      return nw
    })
  }, [])
  // console.log("ICard - Drawer - render")
  return (
    <CardDrawerBox
      title={null}
      closable={false}
      placement="right"
      mask={false}
      open={open}
      contentWrapperStyle={{
        top: full ? 8 : 48,
        bottom: 8,
        right: 8,
        borderRadius: 8,
        boxShadow: token.boxShadow,
      }}
      style={{
        borderRadius: 8,
      }}
      styles={{ body: { padding: 0 } }}
      width="auto"
      className="cardDrawer"
      getContainer={false}
    >
      <Resizable
        size={size}
        enable={resizeDiretion}
        onResizeStop={(_e, _direction, _ref, d) => {
          setResizeSizeValue(d.width)
        }}
        handleWrapperClass={cc(["resizeHandle", { hide: full }])}
        handleStyles={handleStyles}
        className="resizeBox"
        maxWidth={maxWidth}
        // style={{ width: "100%" }}
      >
        {children}
      </Resizable>
    </CardDrawerBox>
  )
}
const CardDrawerBox = styled(Drawer)({
  // 全屏时宽度变化动画
  ".resizeBox": {
    transition: "width 0.3s",
  },
  ".resizeBox.full": {
    // width
  },
  // 卡片弹窗左侧调整宽度的操作条
  ".resizeHandle > div:hover": {
    backgroundColor: "#CCC",
  },
})
