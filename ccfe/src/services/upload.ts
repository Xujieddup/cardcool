import { getUploadTokenApi } from "@/datasource"
import { message } from "antd"
import * as qiniu from "qiniu-js"

export const uploadImage = async (file: File) => {
  try {
    const token = await getUploadTokenApi()
    if (!token) {
      message.error("获取上传文件凭证失败，请重试")
      return ""
    }
    return new Promise((resolve: (value: string) => void) => {
      const observer = {
        next(res: any) {
          console.log("upload next", res)
        },
        error(err: Error) {
          console.error("upload error", err)
          message.error("上传文件出现异常，请重试")
        },
        complete(res: any) {
          // console.log("upload complete", res)
          const url = res.key ? "/" + res.key : ""
          resolve(url)
        },
      }
      qiniu
        .compressImage(file, {
          // 图片压缩质量[0, 1](默认 0.92)，只对 image/jpeg 和 image/webp 有效
          quality: 0.8,
          // 为 true 时如果发现压缩后图片大小比原来还大，则返回源图片
          noCompressIfLarger: true,
        })
        .then((res: any) => {
          // console.log("compressImage res", res)
          // dist: 压缩后输出的 Blob 对象或原始的 File 对象，具体看下面的 options 配置
          qiniu.upload(res.dist, null, token).subscribe(observer) // 上传开始
        })
      // 上传取消
      // subscription.unsubscribe()
    })
  } catch (e) {
    message.error((e as Error).message)
    return ""
  }
}
