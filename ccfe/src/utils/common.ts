export const isEmpty = (val: any) => {
  if (val instanceof Array) {
    return val.length === 0
  } else if (val instanceof Object) {
    return JSON.stringify(val) === "{}"
  } else {
    return !val
  }
}
// 强制更新组件
export const forceUpdateFunc = (x: number) => x + 1

export const isMac = navigator?.userAgent?.indexOf("Mac") >= 0
export const isElectron = navigator?.userAgent?.indexOf("Electron") >= 0
