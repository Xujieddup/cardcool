import { TEMP_DATE } from "@/constant"
import { getDate } from "@/utils"

// 字符串模板解析
export const tempParse = (str: string) => {
  if (str === TEMP_DATE) {
    return getDate()
  } else {
    return str || ""
  }
}
