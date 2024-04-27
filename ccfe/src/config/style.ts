import type { GlobalToken } from "antd"

export const getGlobalStyle = (token: GlobalToken) => ({
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
})
