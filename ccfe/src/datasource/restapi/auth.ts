import axios from "axios"
import {
  clearUploadTokenConfig,
  clearSyncConfig,
  clearUserConfig,
  clearUserinfo,
  setUserConfig,
  setUserinfo,
  setSyncConfigStr,
} from "@/datasource"
import { CBUserData, Resp } from "@/types"
import { clearLocalConfig, clearSyncTime } from "@/datasource"
import { API_URL } from "@/config"

// 根据微信 code 登录或注册账号
export const callback = async (code: string, inviteCode: string) => {
  return axios.post(API_URL + "/callback", { code, invite_code: inviteCode }).then((response) => {
    const { code, data } = response.data
    // 登录成功
    if (code === 0) {
      saveLocalData(data)
    }
    return response.data as Resp
  })
}

export const regcodeApi = async (code: string, userData: CBUserData) => {
  return axios
    .post(API_URL + "/regcode", {
      code,
      openid: userData.openid,
      unionid: userData.unionid,
      username: userData.username,
      avatar: userData.avatar,
    })
    .then((response) => {
      const { code, data } = response.data
      if (code === 0) {
        saveLocalData(data)
      }
      return response.data as Resp
    })
}

export const bindApi = async (mobile: string, password: string, userData: CBUserData) => {
  return axios
    .post(API_URL + "/bind", {
      mobile,
      password,
      openid: userData.openid,
      unionid: userData.unionid,
      username: userData.username,
      avatar: userData.avatar,
    })
    .then((response) => {
      const { code, data } = response.data
      if (code === 0) {
        saveLocalData(data)
      }
      return response.data as Resp
    })
}

export const loginApi = async (mobile: string, password: string) => {
  return axios
    .post(API_URL + "/login", {
      mobile,
      password,
    })
    .then((response) => {
      const { code, data } = response.data
      if (code === 0) {
        saveLocalData(data)
      }
      return response.data as Resp
    })
}

export const registerApi = async (
  mobile: string,
  code: string,
  auth_code: string,
  password: string
) => {
  return axios
    .post(API_URL + "/register", {
      mobile,
      code,
      auth_code,
      password,
    })
    .then((response) => {
      const { code, data } = response.data
      if (code === 0) {
        saveLocalData(data)
      }
      return response.data as Resp
    })
}

const saveLocalData = (data: any) => {
  const { userinfo, config, ...user } = data
  setUserinfo(userinfo)
  setSyncConfigStr(config)
  setUserConfig(user)
}

export const logoutApi = () => {
  // 清除用户信息缓存
  clearUserConfig()
  clearUserinfo()
  clearUploadTokenConfig()
  // 清除同步时间缓存
  clearSyncTime()
  // 清除本地配置
  clearLocalConfig()
  // 清除同步配置
  clearSyncConfig()
}

export const timeoutApi = async () => {
  return axios.post(API_URL + "/timeout").then((response) => {
    return response.data as Resp
  })
}
