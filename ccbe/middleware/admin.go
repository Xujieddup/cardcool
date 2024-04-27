package middleware

import (
	"cc/be/app"
	"cc/be/errcode"
	"cc/be/global"

	"github.com/gin-gonic/gin"
)

// 超级管理员权限校验中间件
func Admin() gin.HandlerFunc {
	return func(c *gin.Context) {
		if global.Uid != 1 {
			app.NewResponse(c).Error(errcode.AdminAuthError, nil)
			c.Abort()
			return
		}
		c.Next()
	}
}
