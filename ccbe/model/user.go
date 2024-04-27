package model

import (
	"cc/be/global"
	"cc/be/utils"
)

type User struct {
	Id         int    `gorm:"primary_key" json:"id"`
	Mobile     string `json:"mobile"`
	Openid     string `json:"openid"`
	Unionid    string `json:"unionid"`
	Username   string `json:"username"`
	Avatar     string `json:"avatar"`
	Password   string `json:"password"`
	Dbpassword string `json:"dbpassword"`
	Code       string `json:"code"`
	Pid        int    `json:"pid"`
	Status     int8   `json:"status"`
	Config     string `json:"config"`
	CreateTime int    `gorm:"autoCreateTime" json:"create_time,omitempty"`
	UpdateTime int    `gorm:"autoUpdateTime" json:"update_time,omitempty"`
}

func (User) TableName() string {
	return "user"
}

func (u *User) SelectById(uid int) error {
	return global.DBEngine.Select("id,mobile,openid,unionid,username,avatar,password,dbpassword,code,config").Where("id", uid).Take(u).Error
}

func (u *User) SelectByCode(code string) bool {
	res := global.DBEngine.Select("id").Where("code", code).Take(u)
	return res.RowsAffected > 0
	// return utils.IfThen(res.RowsAffected > 0, u.Id, 0)
}

func (u *User) GetIdByCode(code string) int {
	res := global.DBEngine.Select("id").Where("code", code).Take(u)
	return utils.IfThen(res.RowsAffected > 0, u.Id, 0)
}

func (u *User) ExistByCode(code string) bool {
	res := global.DBEngine.Select("id").Where("code", code).Take(u)
	return res.RowsAffected > 0
}

func (u *User) ExistByMobile(mobile string) bool {
	res := global.DBEngine.Select("id").Where("mobile", mobile).Take(u)
	return res.RowsAffected > 0
}

func (u *User) ExistByOpenid(openid string) bool {
	nu := &User{}
	res := global.DBEngine.Select("id").Where("openid", openid).Take(nu)
	return res.RowsAffected > 0
}

// 根据 login_code 查询登陆码信息
func (u *User) SelectByMobile(mobile string) error {
	return global.DBEngine.Select("id,mobile,openid,unionid,username,avatar,password,dbpassword,code,config").Where("mobile = ?", mobile).Take(u).Error
}

// 根据 openid 查询用户信息
func (u *User) SelectByOpenId(openid string) error {
	return global.DBEngine.Select("id,mobile,openid,unionid,username,avatar,password,dbpassword,code,config").Where("openid = ?", openid).Take(u).Error
}

func (u *User) InsertUser(mobile, password, dbpassword, code string, pid int) error {
	u.Mobile = mobile
	u.Password = password
	u.Dbpassword = dbpassword
	u.Username = "未命名"
	u.Avatar = "/cc/avatar.png"
	u.Code = code
	u.Pid = pid
	u.Config = "{}"
	return global.DBEngine.Create(u).Error
}

func (u *User) InsertWechatUser(openid, unionid, username, avatar, dbpassword, code string, pid int) error {
	u.Openid = openid
	u.Unionid = unionid
	u.Dbpassword = dbpassword
	u.Username = utils.IfThen[string](username == "", "未命名", username)
	u.Avatar = utils.IfThen[string](avatar == "", "/cc/avatar.png", avatar)
	u.Code = code
	u.Pid = pid
	u.Config = "{}"
	return global.DBEngine.Create(u).Error
}

func (u *User) UpdateUser(mobile, username, password string) error {
	user := User{
		Username: username,
	}
	if u.Mobile != mobile {
		user.Mobile = mobile
	}
	if password != "" {
		user.Password = password
	}
	return global.DBEngine.Model(u).Updates(user).Error
}

func (u *User) BindWechat(uid int, openid, unionid string) error {
	user := User{
		Openid:  openid,
		Unionid: unionid,
	}
	return global.DBEngine.Select("openid", "unionid", "update_time").Where("id", uid).Updates(user).Error
}

func (u *User) UpdateMobileAccount(uid int, mobile, password string) error {
	user := User{
		Mobile:   mobile,
		Password: password,
	}
	return global.DBEngine.Select("mobile", "password", "update_time").Where("id", uid).Updates(user).Error
}

func (u *User) UpdateUserinfo(uid int, username, avatar string) error {
	user := User{
		Username: username,
		Avatar:   avatar,
	}
	return global.DBEngine.Select("username", "avatar", "update_time").Where("id", uid).Updates(user).Error
}

func (u *User) UpdateUserBind(uid int, openid, unionid, username, avatar string) error {
	user := User{
		Openid:   openid,
		Unionid:  unionid,
		Username: username,
		Avatar:   avatar,
	}
	return global.DBEngine.Select("openid", "unionid", "username", "avatar", "update_time").Where("id", uid).Updates(user).Error
}

func (u *User) UpdateConfig(uid int, config string) error {
	user := User{
		Config: config,
	}
	return global.DBEngine.Select("config", "update_time").Where("id", uid).Updates(user).Error
}
