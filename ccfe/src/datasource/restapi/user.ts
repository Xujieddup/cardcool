import type { ClientInfo, SystemConf, ThemeConfig, TimeData, ViewConf } from "@/types"
import { getNormalRequest, getRequest, postRequest } from "./base"
import { getSyncConfig, setSyncConfigStr, setUserinfo, setUserinfoParams } from "../local"

// 获取服务端信息，每次刷新页面都会尝试调用
export const getInfoApi = async () => {
  return getRequest("/info").then((res) => {
    const { code, data } = res
    if (code === 0) {
      const {
        userinfo: { config, ...userinfo },
        ...timeInfo
      } = data as any
      // console.log("getInfo", data, config, userinfo, timeInfo)
      // 缓存信息
      userinfo && setUserinfo(userinfo)
      config && setSyncConfigStr(config)
      return timeInfo as TimeData
    }
    // 请求异常时返回 null
    return null
  })
}

// 绑定微信
export const bindWechatApi = async (code: string) => {
  return postRequest("/bindWechat", { code }).then((res) => {
    const { code, data } = res
    if (code === 0 && data.openid) {
      // 缓存信息
      setUserinfoParams({ openid: data.openid })
    }
    return res
  })
}

// 更新微信账号
export const updateMobileAccountApi = async (
  mobile: string,
  editType: number,
  oldPassword: string,
  newPassword: string
) => {
  return postRequest("/updateMobileAccount", {
    mobile,
    edit_type: editType,
    old_password: oldPassword,
    new_password: newPassword,
  }).then((res) => {
    if (res.code === 0) {
      // 缓存信息
      setUserinfoParams({ mobile })
    }
    return res
  })
}

export const updateUserinfoApi = async (username: string, avatar: string) => {
  return postRequest("/updateUserinfo", { username, avatar }).then((res) => {
    const { code } = res
    return code === 0
  })
}

// 更新配置
const updateConfigApi = async (config: string) => {
  return postRequest("/updateConfig", { config }).then((res) => {
    const { code } = res
    return code === 0
  })
}

// 更新主题配置
export const updateThemeConfigApi = async (theme: ThemeConfig) => {
  // 先从本地获取配置信息
  const config = getSyncConfig()
  const configStr = JSON.stringify({ ...config, theme })
  setSyncConfigStr(configStr)
  return updateConfigApi(configStr)
}

// 更新视图配置
export const updateViewConfApi = async (viewConf: ViewConf) => {
  // 先从本地获取配置信息
  const config = getSyncConfig()
  const configStr = JSON.stringify({ ...config, viewConf })
  setSyncConfigStr(configStr)
  return updateConfigApi(configStr)
}

// 更新系统配置
export const updateSystemConfApi = async (systemConf: SystemConf) => {
  // 先从本地获取配置信息
  const config = getSyncConfig()
  const configStr = JSON.stringify({ ...config, systemConf })
  setSyncConfigStr(configStr)
  return updateConfigApi(configStr)
}

// 获取客户端信息
export const getClientApi = async () => {
  return getNormalRequest("/client").then((res) => {
    const { code, data } = res
    if (code === 0) {
      return data as ClientInfo
    }
    // 请求异常时返回 null
    return null
  })
}
