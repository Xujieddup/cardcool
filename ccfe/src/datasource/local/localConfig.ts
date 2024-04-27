const defaultConfig: any = {
  // 菜单栏是否展开
  menuOpen: true,
  // 侧边卡片宽度(px)
  sideCardWidth: 360,
  spaceId: "",
  // 新增卡片时的默认卡片模板
  typeId: "default",
}
export const getLocalConfigData = () => {
  const str = localStorage.getItem("localconfig")
  if (!str) {
    return defaultConfig
  }
  return JSON.parse(str) || defaultConfig
}
export const getLocalConfig = (key: string) => {
  const config = getLocalConfigData()
  return config[key] !== undefined ? config[key] : defaultConfig[key]
}
export const setLocalConfig = (key: string, value: any) => {
  const config = getLocalConfigData()
  config[key] = value
  localStorage.setItem("localconfig", JSON.stringify(config))
}
export const clearLocalConfig = () => {
  localStorage.removeItem("localconfig")
}
export const getLocalMenuOpen = (): boolean => {
  return getLocalConfig("menuOpen") as boolean
}
export const setLocalMenuOpen = (open: boolean) => {
  setLocalConfig("menuOpen", open)
}
export const getLocalSideCardWidth = (): number => {
  return parseFloat(getLocalConfig("sideCardWidth")) as number
}
export const setLocalSideCardWidth = (width: number) => {
  setLocalConfig("sideCardWidth", width)
}
export const getLocalSpaceId = (): string => {
  return getLocalConfig("spaceId") || ""
}
export const setLocalSpaceId = (spaceId: string) => {
  setLocalConfig("spaceId", spaceId)
}
// 设置新增卡片的默认卡片模板
export const setLocalTypeId = (typeId: string) => {
  setLocalConfig("typeId", typeId)
}
export const getLocalTypeId = () => {
  const typeId = getLocalConfig("typeId")
  return typeId || "default"
}
