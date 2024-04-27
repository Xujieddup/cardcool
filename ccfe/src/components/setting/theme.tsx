import React, { memo, useCallback } from "react"
import { CheckOutlined } from "@ant-design/icons"
import { Button, Typography, Space, App } from "antd"
import { IFlexR } from "@/ui"
import styled from "@emotion/styled"
import cc from "classcat"
import { UseTheme, useConfigStore } from "@/store"
import { shallow } from "zustand/shallow"
import { ThemeConfig } from "@/types"
import { updateThemeConfigApi } from "@/datasource"
import { DarkThemeIcon, LightThemeIcon } from "@/icons"

const themeSelector: UseTheme = (state) => ({
  theme: state.theme,
  setThemeType: state.setThemeType,
  setThemeColor: state.setThemeColor,
})

const colors = [
  "#1677FF",
  "#5A54F9",
  "#9E339F",
  "#ED4192",
  "#E0282E",
  "#F4801A",
  "#F2BD27",
  "#00B96B",
]

export const ThemeSetting = memo(() => {
  const { theme, setThemeType, setThemeColor } = useConfigStore(themeSelector, shallow)
  const { message } = App.useApp()
  const handleUpdate = useCallback(
    (theme: ThemeConfig) => {
      if (!theme.type) {
        message.error("请选择主题")
        return
      }
      if (!theme.color) {
        message.error("请选择主题色")
        return
      }
      updateThemeConfigApi(theme).then((res) => {
        if (!res) {
          message.error("同步服务端配置失败")
        } else {
          message.success("更新主题配置成功")
        }
      })
    },
    [message]
  )
  console.log("Render: ThemeSetting")
  return (
    <>
      <ItemBox>
        <TextLabel type="secondary">主题</TextLabel>
        <IFlexR style={{ paddingTop: 6 }}>
          <ThemeBox
            className={cc({ selected: theme.type === "light" })}
            onClick={() => setThemeType("light")}
            color={theme.color}
          >
            <LightThemeIcon />
            <Typography.Paragraph>默认</Typography.Paragraph>
          </ThemeBox>
          <ThemeBox
            className={cc({ selected: theme.type === "dark" })}
            onClick={() => setThemeType("dark")}
            color={theme.color}
          >
            <DarkThemeIcon />
            <Typography.Paragraph>暗黑</Typography.Paragraph>
          </ThemeBox>
        </IFlexR>
      </ItemBox>
      <ItemBox>
        <TextLabel type="secondary">主题色</TextLabel>
        <Space size={[8, 8]} wrap>
          {colors.map((item) => (
            <Button
              key={"colorBtn" + item}
              type="primary"
              style={{ backgroundColor: item }}
              icon={item === theme.color && <CheckOutlined />}
              onClick={() => setThemeColor(item)}
              className="colorBtn"
            />
          ))}
        </Space>
      </ItemBox>
      <ItemBox>
        <IFlexR>
          {/* <div className="flexPlace" /> */}
          <Button type="primary" onClick={() => handleUpdate(theme)}>
            确认
          </Button>
        </IFlexR>
      </ItemBox>
    </>
  )
})

const ThemeBox = styled("div")(({ color }: { color: string }) => ({
  paddingRight: 16,
  ".anticon": {
    width: "100%",
    borderRadius: 6,
    "&>svg": {
      borderRadius: "inherit",
    },
  },
  ".anticon:hover": {
    cursor: "pointer",
  },
  " &.selected .anticon": {
    boxShadow: "0 0 0 3px " + color,
  },
  ".ant-typography": {
    textAlign: "center",
    marginBottom: 0,
    marginTop: 8,
  },
}))
const ItemBox = styled("div")({
  marginBottom: 16,
})

const TextLabel = styled(Typography.Paragraph)({
  "&.ant-typography": {
    marginBottom: 6,
  },
})
