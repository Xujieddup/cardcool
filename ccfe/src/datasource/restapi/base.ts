import type { Resp } from "@/types"
import { getSyncTime, getToken } from "@/datasource"
import axios from "axios"
import { API_URL, NOTICE_URL } from "@/config"
import { fetchEventSource } from "@microsoft/fetch-event-source"

const resp = {
  code: -1,
  msg: "",
  data: null,
}

export const getRequest = async (uri: string) => {
  const token = getToken()
  if (!token) {
    return { ...resp, msg: "获取 Token 失败" }
  }
  return axios
    .get(API_URL + uri, {
      headers: {
        Authorization: token,
      },
    })
    .then((response) => {
      return response.data as Resp
    })
    .catch((error) => {
      console.error("Get Request Error", error)
      return { ...resp, msg: "请求出现异常" }
    })
}

export const postRequest = async (uri: string, data?: any) => {
  const token = getToken()
  if (!token) {
    return { ...resp, msg: "获取 Token 失败" }
  }
  return axios
    .post(API_URL + uri, data, {
      headers: {
        Authorization: token,
      },
    })
    .then((response) => {
      return response.data as Resp
    })
    .catch((error) => {
      console.error("Post Request Error", error)
      return { ...resp, msg: "请求出现异常" }
    })
}

export const getNormalRequest = async (uri: string) => {
  return axios
    .get(API_URL + uri)
    .then((response) => {
      return response.data as Resp
    })
    .catch((error) => {
      console.error("Get Normal Request Error", error)
      return { ...resp, msg: "请求出现异常" }
    })
}

export const getSSEStrem = async (uri: string, fn: () => void) => {
  const token = getToken()
  if (!token) {
    return { ...resp, msg: "获取 Token 失败" }
  }
  await fetchEventSource(NOTICE_URL + uri, {
    headers: {
      Authorization: token,
    },
    onmessage(ev) {
      const newTime = parseInt(ev.data)
      // console.log(ev, newTime)
      if (newTime && newTime > getSyncTime()) {
        fn()
      }
    },
    onerror(err) {
      console.error("sse err", err)
    },
    openWhenHidden: true,
  })
}
