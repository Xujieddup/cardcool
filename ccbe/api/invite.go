package api

import (
	"cc/be/errcode"
	"cc/be/service"
	"cc/be/validreq"

	"github.com/gin-gonic/gin"
)

type InviteApi struct{}

func NewInviteApi() *InviteApi {
	return &InviteApi{}
}

// 超级管理员生成邀请码
func (u *InviteApi) GenerateCodes(c *gin.Context) {
	param := &validreq.GenerateCodesReq{}
	resp, err := validParams(c, param)
	if err != nil {
		return
	}
	// 创建用户
	srv := service.New(c.Request.Context())
	err = srv.GenerateCodes(param.LimitType, param.StartTime, param.EndTime, param.Num)
	if err != nil {
		resp.Error(errcode.GenerateCodeError, err)
		return
	}
	resp.Success(gin.H{
		"cnt": param.Num,
	})
}
