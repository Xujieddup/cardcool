import type { UserConfig, UserData } from "@/types"
import { getTime } from "@/utils"

export const getUserConfig = (): UserConfig | null => {
  const str = localStorage.getItem("user")
  if (!str) {
    return null
  }
  const userData = JSON.parse(str) as UserConfig
  if (!userData) {
    return null
  }
  if (userData.token_expire <= getTime()) {
    clearUserConfig()
    return null
  }
  return userData
}
export const setUserConfig = (user: UserConfig) => {
  localStorage.setItem("user", JSON.stringify(user))
}
export const clearUserConfig = () => {
  localStorage.removeItem("user")
}

export const getToken = (): string => {
  const userConfig = getUserConfig()
  return userConfig ? "Bearer " + userConfig.token : ""
}
export const getUserData = (): UserData | null => {
  const userConfig = getUserConfig()
  return userConfig ? userConfig.user : null
}
