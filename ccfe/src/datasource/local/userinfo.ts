import { STATIC_URL } from "@/config"
import type { Userinfo } from "@/types"

export const getUserinfo = (): Userinfo | null => {
  const str = localStorage.getItem("userinfo")
  if (!str) {
    return null
  }
  const userinfo = JSON.parse(str) as Userinfo
  if (!userinfo) {
    return null
  }
  if (!userinfo.avatar.startsWith("https")) {
    userinfo.avatar = STATIC_URL + userinfo.avatar
  }
  return userinfo
}
export const setUserinfo = (userinfo: Userinfo): void => {
  localStorage.setItem("userinfo", JSON.stringify(userinfo))
}
export const setUserinfoParams = (info: Partial<Userinfo>): void => {
  const userinfo = getUserinfo()
  if (userinfo) {
    localStorage.setItem("userinfo", JSON.stringify({ ...userinfo, ...info }))
  }
}
export const clearUserinfo = () => {
  localStorage.removeItem("userinfo")
}
