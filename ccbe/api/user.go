package api

import (
	"cc/be/app"
	"cc/be/cache"
	"cc/be/errcode"
	"cc/be/service"
	"cc/be/validreq"
	"time"

	"github.com/gin-gonic/gin"
)

type UserApi struct{}

func NewUserApi() *UserApi {
	return &UserApi{}
}

// 超级管理员添加账号
func (u *UserApi) AddAccount(c *gin.Context) {
	param := &validreq.AddAccountReq{}
	resp, err := validParams(c, param)
	if err != nil {
		return
	}
	// 创建用户
	srv := service.New(c.Request.Context())
	user, err := srv.AddAccount(param.Mobile)
	if err != nil {
		resp.Error(errcode.RegisterError, err)
		return
	}
	// 初始化用户数据: 默认空间、默认视图
	ti := time.Now().UnixMilli()
	sid, err := srv.InitSpace(user.Id, ti)
	if err != nil {
		resp.Error(errcode.RegisterError, err)
		return
	}
	ts, err := srv.InitType(user.Id, ti+1)
	if err != nil {
		resp.Error(errcode.RegisterError, err)
		return
	}
	cs, err := srv.InitCard(user.Id, ti+10, sid, ts)
	if err != nil {
		resp.Error(errcode.RegisterError, err)
		return
	}
	_, err = srv.InitView(user.Id, ti+20, sid, (*cs)[1])
	if err != nil {
		resp.Error(errcode.RegisterError, err)
		return
	}
	// 刷新更新时间缓存
	cache.SetUserUpdateTime(user.Id, ti+100)
	// 初始化用户的默认卡片类型：账号、个人、物品等
	// TODO 创建默认的引导视图
	// err = srv.InitViews(user.Id)
	// if err != nil {
	// 	resp.Error(errcode.LoginError, err)
	// 	return
	// }
	resp.Success(user)
}

func (u *UserApi) GetInfo(c *gin.Context) {
	resp := app.NewResponse(c)
	srv := service.New(c.Request.Context())
	// 查询用户信息
	userinfo, err := srv.GetUserInfo()
	if err != nil {
		resp.Error(errcode.QueryUserError, err)
		return
	}
	// 查询服务端更新时间
	updateTime := srv.GetUpdateTime()
	resp.Success(gin.H{
		"userinfo":         userinfo,
		"last_update_time": updateTime,
		"current_time":     time.Now().UnixMilli(),
	})
}

func (u *UserApi) BindWechat(c *gin.Context) {
	param := &validreq.BindWechatReq{}
	resp, err := validParams(c, param)
	if err != nil {
		return
	}
	srv := service.New(c.Request.Context())
	openid, err := srv.BindWechat(param)
	if err != nil {
		resp.Error(errcode.BindWechatError, err)
		return
	}
	resp.Success(gin.H{
		"openid": openid,
	})
}

func (u *UserApi) UpdateMobileAccount(c *gin.Context) {
	param := &validreq.UpdateMobileAccountReq{}
	resp, err := validParams(c, param)
	if err != nil {
		return
	}
	srv := service.New(c.Request.Context())
	err = srv.UpdateMobileAccount(param)
	if err != nil {
		resp.Error(errcode.UpdateMobileAccountError, err)
		return
	}
	resp.Success(nil)
}

func (u *UserApi) UpdateUserinfo(c *gin.Context) {
	param := &validreq.UpdateUserinfoReq{}
	resp, err := validParams(c, param)
	if err != nil {
		return
	}
	srv := service.New(c.Request.Context())
	err = srv.UpdateUserinfo(param)
	if err != nil {
		resp.Error(errcode.LoginError, err)
		return
	}
	resp.Success(nil)
}

func (u *UserApi) UpdateConfig(c *gin.Context) {
	param := &validreq.UpdateConfigReq{}
	resp, err := validParams(c, param)
	if err != nil {
		return
	}
	srv := service.New(c.Request.Context())
	err = srv.UpdateConfig(param.Config)
	if err != nil {
		resp.Error(errcode.LoginError, err)
		return
	}
	resp.Success(nil)
}

func (u *UserApi) Change(c *gin.Context) {
	param := &validreq.ChangeReq{}
	resp, err := validParams(c, param)
	if err != nil {
		return
	}
	srv := service.New(c.Request.Context())
	user, err := srv.Change(param)
	if err != nil {
		resp.Error(errcode.LoginError, err)
		return
	}
	resp.Success(user)
}

// 用户相关路由处理
// 获取信息列表和配置数据
func (u *UserApi) GetToken(c *gin.Context) {}

// 更新客户端版本
func (u *UserApi) UpdateClient(c *gin.Context) {
	param := &validreq.UpdateClientReq{}
	resp, err := validParams(c, param)
	if err != nil {
		return
	}
	info := &map[string]string{
		"version": param.Version,
		"baidu":   param.Baidu,
		"kuake":   param.Kuake,
	}
	cache.SetClientInfo(info)
	resp.Success(nil)
}
