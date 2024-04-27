package api

import (
	"cc/be/app"
	"cc/be/cache"
	"cc/be/errcode"
	"cc/be/model"
	"cc/be/service"
	"cc/be/validreq"
	"errors"
	"time"

	"github.com/gin-gonic/gin"
)

// 回调状态：1-直接登录，2-绑定注册
const CB_LOGIN = 1
const CB_BIND = 2

type TokenApi struct{}

func NewTokenApi() *TokenApi {
	return &TokenApi{}
}

func (t *TokenApi) Login(c *gin.Context) {
	param := &validreq.LoginReq{}
	resp, err := validParams(c, param)
	if err != nil {
		return
	}
	srv := service.New(c.Request.Context())
	user, err := srv.Login(param)
	if err != nil {
		resp.Error(errcode.LoginError, err)
		return
	}
	// 查询配置信息
	if user.Config == "" {
		p := &model.Propext{}
		user.Config = p.GetExtPropByUid(user.Id, model.USER_CONFIG_ID, model.TYPE_USER_CONFIG)
	}
	// 生成 Token
	token, expireTime, err := app.GenerateToken(user.Id)
	if err != nil {
		resp.Error(errcode.GenerateTokenError, err)
		return
	}
	resp.Success(getRespData(token, expireTime, user))
}

func (t *TokenApi) BindUser(c *gin.Context) {
	param := &validreq.BindUserReq{}
	resp, err := validParams(c, param)
	if err != nil {
		return
	}
	srv := service.New(c.Request.Context())
	user, err := srv.BindUser(param)
	if err != nil {
		resp.Error(errcode.LoginError, err)
		return
	}
	// 查询配置信息
	if user.Config == "" {
		p := &model.Propext{}
		user.Config = p.GetExtPropByUid(user.Id, model.USER_CONFIG_ID, model.TYPE_USER_CONFIG)
	}
	// 生成 Token
	token, expireTime, err := app.GenerateToken(user.Id)
	if err != nil {
		resp.Error(errcode.GenerateTokenError, err)
		return
	}
	resp.Success(getRespData(token, expireTime, user))
}

func (t *TokenApi) Callback(c *gin.Context) {
	param := &validreq.CallbackReq{}
	resp, err := validParams(c, param)
	if err != nil {
		return
	}
	srv := service.New(c.Request.Context())
	user, err := srv.Callback(param)
	if err != nil {
		resp.Error(errcode.LoginError, err)
		return
	}
	if user.Id == 0 {
		resp.Error(errcode.WechatCallbackUserError, err)
		return
	}
	// 查询配置信息
	if user.Config == "" {
		p := &model.Propext{}
		user.Config = p.GetExtPropByUid(user.Id, model.USER_CONFIG_ID, model.TYPE_USER_CONFIG)
	}
	// 生成 Token
	token, expireTime, err := app.GenerateToken(user.Id)
	if err != nil {
		resp.Error(errcode.GenerateTokenError, err)
		return
	}
	resp.Success(getRespData(token, expireTime, user))
}

func getRespData(token string, expireTime int64, user *model.User) map[string]any {
	return gin.H{
		"token":        token,
		"token_expire": expireTime,
		"user": map[string]interface{}{
			"uid":   user.Id,
			"dbkey": user.Dbpassword,
		},
		"userinfo": map[string]interface{}{
			"username": user.Username,
			"avatar":   user.Avatar,
			"mobile":   user.Mobile,
			"openid":   user.Openid,
			"code":     user.Code,
		},
		"config": user.Config,
	}
}

func (t *TokenApi) Register(c *gin.Context) {
	param := &validreq.RegisterReq{}
	resp, err := validParams(c, param)
	if err != nil {
		return
	}
	// 注册用户
	srv := service.New(c.Request.Context())
	user, err := srv.Register(param)
	if err != nil {
		resp.Error(errcode.RegisterError, err)
		return
	}
	// 初始化用户数据: 默认空间
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
	// 生成 Token
	token, expireTime, err := app.GenerateToken(user.Id)
	if err != nil {
		resp.Error(errcode.GenerateTokenError, err)
		return
	}
	resp.Success(getRespData(token, expireTime, user))
}

func (t *TokenApi) RegisterByCode(c *gin.Context) {
	param := &validreq.RegcodeReq{}
	resp, err := validParams(c, param)
	if err != nil {
		return
	}
	// 注册用户
	srv := service.New(c.Request.Context())
	user, err := srv.RegisterByCode(param)
	if err != nil {
		resp.Error(errcode.RegisterError, err)
		return
	}
	// 初始化用户数据: 默认空间
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
	// 生成 Token
	token, expireTime, err := app.GenerateToken(user.Id)
	if err != nil {
		resp.Error(errcode.GenerateTokenError, err)
		return
	}
	resp.Success(getRespData(token, expireTime, user))
}

func (t *TokenApi) Timeout(c *gin.Context) {
	resp := app.NewResponse(c)
	time.Sleep(time.Duration(5) * time.Second)
	resp.Success("success")
}

func (t *TokenApi) Client(c *gin.Context) {
	resp := app.NewResponse(c)
	info := cache.GetClientInfo()
	resp.Success(info)
}

// 七牛云文件上传回调
func (t *TokenApi) QiniuCallback(c *gin.Context) {
	param := &validreq.QiniuCallbackReq{}
	resp, err := validParams(c, param)
	if err != nil {
		return
	}
	srv := service.New(c.Request.Context())
	verifyRes, err := srv.VerifyQiniuCallback(c.Request)
	if err != nil {
		resp.Error(errcode.QiniuCallbackAuthVerifyError, err)
		return
	}
	if !verifyRes {
		resp.Error(errcode.QiniuCallbackAuthError, errors.New("七牛回调验签失败"))
		return
	}
	err = srv.QiniuCallback(param)
	if err != nil {
		resp.Error(errcode.QiniuCallbackError, err)
		return
	}
	resp.Ctx.JSON(errcode.Success.StatusCode(), param)
}
