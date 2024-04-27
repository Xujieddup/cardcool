package validreq

type AddAccountReq struct {
	Mobile string `json:"mobile" binding:"required"`
}

type BindWechatReq struct {
	Code string `json:"code" binding:"required"`
}

type UpdateMobileAccountReq struct {
	Mobile      string `json:"mobile" binding:"required"`
	EditType    int32  `json:"edit_type" binding:"required"`
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

type UpdateUserinfoReq struct {
	Username string `json:"username" binding:"required"`
	Avatar   string `json:"avatar" binding:"required"`
}

type UpdateConfigReq struct {
	Config string `json:"config" binding:"required"`
}

type ChangeReq struct {
	Mobile   string `json:"mobile" binding:"required"`
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type UpdateClientReq struct {
	Version string `json:"version" binding:"required"`
	Baidu   string `json:"baidu" binding:"required"`
	Kuake   string `json:"kuake" binding:"required"`
}
