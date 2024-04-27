package api

import (
	"github.com/gin-gonic/gin"
	"cc/be/app"
	"cc/be/errcode"
)

// 绑定并校验参数
func validParams(c *gin.Context, param interface{}) (*app.Response, error) {
	resp := app.NewResponse(c)
	valid, errs := app.BindAndValid(c, param)
	if !valid {
		resp.Error(errcode.InvalidParams, errs)
		return resp, errs
	}
	return resp, nil
}
