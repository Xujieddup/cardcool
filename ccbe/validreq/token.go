package validreq

// 登录接口请求参数校验规则
type LoginReq struct {
	Mobile   string `json:"mobile" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type CallbackReq struct {
	Code       string `json:"code" binding:"required"`
	InviteCode string `json:"invite_code"`
}

type RegisterReq struct {
	Mobile string `json:"mobile" binding:"required,len=11"`
	Code   string `json:"code" binding:"required"`
	// AuthCode string `json:"auth_code" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
}

type RegcodeReq struct {
	Code     string `json:"code" binding:"required"`
	Openid   string `json:"openid" binding:"required,min=20"`
	Unionid  string `json:"unionid"`
	Username string `json:"username"`
	Avatar   string `json:"avatar"`
}

// 根据微信扫码授权回调绑定原手机账号
type BindUserReq struct {
	Mobile   string `json:"mobile" binding:"required"`
	Password string `json:"password" binding:"required"`
	Openid   string `json:"openid" binding:"required,min=20"`
	Unionid  string `json:"unionid"`
	Username string `json:"username"`
	Avatar   string `json:"avatar"`
}

// 七牛云文件上传回调
type QiniuCallbackReq struct {
	Key   string `json:"key" binding:"required"`
	Hash  string `json:"hash" binding:"required"`
	Fsize int64  `json:"fsize" binding:"required"`
	Uid   int    `json:"uid" binding:"required"`
}
