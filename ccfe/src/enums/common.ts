// -100: 初始化，不展示页面，-1-所有页面刷新，0-展示页面, 1-展示数据同步弹窗, 2-永久展示时间异常，3-加载本地数据异常，4-浏览器版本不支持，5-远端数据更新，需要刷新页面
export enum DBStatusEnum {
  INIT = -100,
  RELOAD = -1,
  INITED = 0,
  SYNCING = 1,
  TIMEERR = 2,
  DATAERR = 3,
  VERSIONERR = 4,
  REMOTEUPDATE = 5,
}
