import React, { ReactNode } from "react"
import { App, ConfigProvider, theme } from "antd"
import locale from "antd/locale/zh_CN"
import "dayjs/locale/zh-cn"
import { GetTheme, useConfigStore } from "@/store"

type ThemeProps = {
  children: ReactNode
}

const themeSelector: GetTheme = (state) => state.theme

export const Theme: React.FC<ThemeProps> = ({ children }) => {
  const { type, color } = useConfigStore(themeSelector)
  return (
    <ConfigProvider
      theme={{
        algorithm: type === "light" ? theme.defaultAlgorithm : theme.darkAlgorithm,
        token: {
          colorPrimary: color,
        },
        components: {
          Tag: {
            fontSize: 12,
            lineHeight: 1.66666667,
          },
        },
      }}
      locale={locale}
    >
      <App className={"type_" + type}>{children}</App>
    </ConfigProvider>
  )
}
