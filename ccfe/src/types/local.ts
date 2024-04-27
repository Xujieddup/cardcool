// sync_config
export type ThemeType = "light" | "dark"
export type ThemeConfig = {
  type: ThemeType
  color: string
}
export type Config = {
  theme: ThemeConfig
  nodeWidth: number
  viewConf: ViewConf
  systemConf: SystemConf
}

// user
export type UserData = {
  uid: number
  dbkey: string
}
export type UserConfig = {
  user: UserData
  token: string
  token_expire: number
}

// userinfo
export type Userinfo = {
  username: string
  mobile: string
  openid: string
  avatar: string
  code: string
  fsize: string
}

// upload_token
export type UploadToken = {
  token: string
  expire_time: number
}

// 全局视图配置
export type ViewConf = {
  // 卡片盒默认展示所有未命名的卡片
  showUnnamed: boolean
  // 白板上拖动节点时是否显示辅助线
  helperLine: boolean
  // 白板上拖拽卡片和视图节点到导图分组中时，是否自动折叠
  mindAutoFold: boolean
  // 启用内联视图功能
  inlineView: boolean
  // 启用视图快照功能
  viewSnap: boolean
}

// 系统配置
export type SystemConf = {
  // 是否展示微信悬浮按钮
  wechatFloat: boolean
}
