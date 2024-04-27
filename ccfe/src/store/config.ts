import { createWithEqualityFn } from "zustand/traditional"
import { getSystemConf, getThemeConfig, getUserinfo, getViewConf } from "@/datasource"
import type { Colors, SystemConf, ThemeConfig, ThemeType, Userinfo, ViewConf } from "@/types"
import { colorDarkMap, colorMap, colorTypes } from "@/config"
import { THEME_COLOR } from "@/constant"

export type SetUserinfoFunc = (info: Partial<Userinfo>) => void
export type GetUserinfoFunc = (state: ConfigState) => Userinfo | null
export type GetSetUserinfoFunc = (state: ConfigState) => SetUserinfoFunc

export type SetThemeTypeFunc = (t: ThemeType) => void
export type SetThemeColorFunc = (c: string) => void
export type GetTheme = (state: ConfigState) => ThemeConfig
export type UseTheme = (state: ConfigState) => {
  theme: ThemeConfig
  setThemeType: SetThemeTypeFunc
  setThemeColor: SetThemeColorFunc
}

export type GetColors = (state: ConfigState) => Colors

// 全局视图配置
export type SetViewConfFunc = (vc: ViewConf) => void
export type GetViewConfFunc = (state: ConfigState) => ViewConf
export type UseViewConfFunc = (state: ConfigState) => [ViewConf, SetViewConfFunc]

// 获取全局配置
export type GetConf = (state: ConfigState) => [ViewConf]

// 系统配置
export type SetSystemConfFunc = (sc: SystemConf) => void
export type GetSystemConfFunc = (state: ConfigState) => SystemConf
export type UseSystemConfFunc = (state: ConfigState) => [SystemConf, SetSystemConfFunc]

export type ConfigState = {
  userinfo: Userinfo | null
  setUserinfo: SetUserinfoFunc
  theme: ThemeConfig
  setThemeType: SetThemeTypeFunc
  setThemeColor: SetThemeColorFunc
  colors: Colors
  viewConf: ViewConf
  setViewConf: SetViewConfFunc
  systemConf: SystemConf
  setSystemConf: SetSystemConfFunc
}

// const calcColors2 = (themeConfig: ThemeConfig) => {
//   // 遍历默认颜色
//   const colors = themeConfig.type === "light" ? colorMap : colorDarkMap
//   // 添加 primary 颜色
//   const primaryColors = generate(themeConfig.color, {
//     theme: themeConfig.type === "dark" ? "dark" : "default",
//   })
//   colors["primary"] = primaryColors[5]
//   // generateColor("#FFF")
//   return colors
// }
// const calcColorList = (colors: Record<string, string>) => {
//   const list = []
//   for (const c in colors) {
//     if (c !== "bg" && c !== "twhite" && c !== "tblack") {
//       list.push({ type: c, color: colors[c] })
//     }
//   }
//   return list
// }
// const generateColor = (color: string) => {
//   const darkColor = generate(color, {
//     theme: "dark",
//   })[5]
//   const lightColor = generate(color, {
//     theme: "default",
//   })[5]
//   console.log("generateColor", {
//     light: lightColor,
//     dark: darkColor,
//   })
// }
const colorNums = [100, 300, 500, 700, 900]
const calcColors = (themeConfig: ThemeConfig) => {
  const cm = themeConfig.type === "light" ? colorMap : colorDarkMap
  const colors: Colors = new Map()
  colorNums.forEach((num) => {
    const c =
      num < 500
        ? undefined
        : themeConfig.type === "light"
        ? "rgba(255, 255, 255, 0.85)"
        : "rgba(0, 0, 0, 0.88)"
    // themeConfig.type === "light"
    // ? num < 500
    //   ? undefined
    //   : "rgba(255, 255, 255, 0.85)"
    // : num < 500
    //   ? undefined
    //   : "rgba(0, 0, 0, 0.88)"
    colorTypes.forEach((t) => {
      const k = t + num
      colors.set(k, { type: k, bg: cm[k], num: num, color: c })
    })
  })
  // key 为 undefined 表示透明色，为 theme 表示主题色
  colors.set(THEME_COLOR, {
    type: THEME_COLOR,
    bg: themeConfig.color,
    num: 0,
    color: "rgba(255, 255, 255, 0.85)",
  })
  return colors
}

const userinfo = getUserinfo()
const themeData = getThemeConfig()
const viewConf = getViewConf()
const systemConf = getSystemConf()
const initColors = calcColors(themeData)

export const useConfigStore = createWithEqualityFn<ConfigState>()(
  (set) => ({
    userinfo: userinfo,
    setUserinfo: (info: Partial<Userinfo>) =>
      set((state) => {
        return { userinfo: state.userinfo ? { ...state.userinfo, ...info } : null }
      }),
    theme: themeData,
    setThemeType: (t: ThemeType) =>
      set((state) => {
        const newTheme = { ...state.theme, type: t }
        const newColors = calcColors(newTheme)
        return { theme: newTheme, colors: newColors }
      }),
    setThemeColor: (c: string) =>
      set((state) => {
        const newTheme = { ...state.theme, color: c }
        const newColors = calcColors(newTheme)
        return { theme: newTheme, colors: newColors }
      }),
    colors: initColors,
    viewConf: viewConf,
    setViewConf: (vc: ViewConf) => set({ viewConf: vc }),
    systemConf: systemConf,
    setSystemConf: (sc: SystemConf) => set({ systemConf: sc }),
  }),
  Object.is
)
