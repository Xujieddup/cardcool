import { NODE_WIDTH } from "@/constant"
import type { Config, SystemConf, ThemeConfig, ViewConf } from "@/types"

const defaultTheme: ThemeConfig = { type: "light", color: "#1677FF" }
const defaultViewConf: ViewConf = {
  showUnnamed: false,
  helperLine: false,
  mindAutoFold: true,
  inlineView: true,
  viewSnap: true,
}
const defaultSystemConf: SystemConf = { wechatFloat: true }
// 默认配置
const defaultConfig: Config = {
  theme: defaultTheme,
  nodeWidth: NODE_WIDTH,
  viewConf: defaultViewConf,
  systemConf: defaultSystemConf,
}

// 服务端同步配置
export const setSyncConfig = (config: Config) => {
  localStorage.setItem("sync_config", JSON.stringify(config))
}
export const setSyncConfigStr = (configStr: string) => {
  localStorage.setItem("sync_config", configStr)
}
export const getSyncConfig = () => {
  const configStr = localStorage.getItem("sync_config")
  if (!configStr) {
    return defaultConfig
  }
  return (JSON.parse(configStr) as Config) || defaultConfig
}
export const clearSyncConfig = () => {
  localStorage.removeItem("sync_config")
}

export const getThemeConfig = (): ThemeConfig => {
  const config = getSyncConfig()
  return config.theme || defaultTheme
}
export const setThemeConfig = (themeConfig: ThemeConfig): void => {
  if (themeConfig) {
    const config = getSyncConfig()
    config.theme = themeConfig
    setSyncConfig(config)
  }
}
export const getNodeWidth = (): number => {
  const config = getSyncConfig()
  return config.nodeWidth || NODE_WIDTH
}

export const getViewConf = (): ViewConf => {
  const config = getSyncConfig()
  if (!config.viewConf) return defaultViewConf
  if (config.viewConf.showUnnamed === undefined) {
    config.viewConf.showUnnamed = true
  }
  if (config.viewConf.inlineView === undefined) {
    config.viewConf.inlineView = true
    config.viewConf.viewSnap = true
  }
  return config.viewConf
}
export const setViewConf = (viewConfig: ViewConf): void => {
  const config = getSyncConfig()
  config.viewConf = viewConfig
  setSyncConfig(config)
}

export const getSystemConf = (): SystemConf => {
  const config = getSyncConfig()
  if (!config.systemConf) return defaultSystemConf
  return config.systemConf
}
export const setSystemConf = (systemConfig: SystemConf): void => {
  const config = getSyncConfig()
  config.systemConf = systemConfig
  setSyncConfig(config)
}
