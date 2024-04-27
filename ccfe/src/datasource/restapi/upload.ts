import type { UploadToken } from "@/types"
import { getUploadTokenConfig, setUploadTokenConfig } from "@/datasource"
import { postRequest } from "./base"

const uploadToken = async () => {
  return postRequest("/uploadToken").then((res) => {
    const { code, msg, data } = res
    if (code === 0) {
      return data as UploadToken
    }
    throw new Error(msg)
  })
}

export const getUploadTokenApi = async () => {
  const tokenStr = getUploadTokenConfig()
  if (tokenStr) {
    return tokenStr
  }
  const token = await uploadToken()
  if (token) {
    setUploadTokenConfig(token)
    return token.token
  }
  return ""
}
