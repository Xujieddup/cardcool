import type { UploadToken } from "@/types"
import { getTime } from "@/utils"

// 缓存上传文件凭证
export const setUploadTokenConfig = (token: UploadToken) => {
  localStorage.setItem("upload_token", JSON.stringify(token))
}
export const getUploadTokenConfig = () => {
  const tokenStr = localStorage.getItem("upload_token")
  const token = tokenStr ? (JSON.parse(tokenStr) as UploadToken) : null
  if (!token) {
    return ""
  }
  if (token.expire_time <= getTime()) {
    clearUploadTokenConfig()
    return ""
  }
  return token.token
}
export const clearUploadTokenConfig = () => {
  localStorage.removeItem("upload_token")
}
