import type { ShareInfo } from "@/types"
import { getNormalRequest, getRequest, postRequest } from "./base"

export const getShareInfoApi = async (viewId: string) => {
  return getRequest("/shareInfo/" + viewId).then((res) => {
    const { code, data } = res
    if (code === 0) {
      return data as ShareInfo
    }
    // 请求异常时返回 null
    return null
  })
}

export const createShareApi = async (
  view_id: string,
  name: string,
  type: number,
  icon: string,
  content: string
) => {
  return postRequest("/share", { view_id, name, type, icon, content }).then((res) => {
    const { code, data } = res
    if (code === 0) {
      return data as ShareInfo
    }
    // 请求异常时返回 null
    return null
  })
}
export const updateShareStatusApi = async (view_id: string, status: number) => {
  return postRequest("/updateShareStatus", { view_id, status }).then((res) => {
    const { code } = res
    return code === 0
  })
}

export const getShareDataApi = async (shareId: string) => {
  return getNormalRequest("/shareData/" + shareId)
}
