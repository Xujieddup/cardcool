// 缓存最后同步时间
export const getSyncTime = (): number => {
  const syncTime = localStorage.getItem("sync_time")
  return syncTime ? parseInt(syncTime) : 0
}
export const setSyncTime = (newTime: number) => {
  localStorage.setItem("sync_time", newTime.toString())
}
export const clearSyncTime = () => {
  localStorage.removeItem("sync_time")
}
