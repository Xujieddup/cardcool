package middleware

import (
	"cc/be/app"
	"cc/be/errcode"
	"cc/be/global"

	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v4"
)

// token 校验中间件
func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		var (
			auth  = c.GetHeader("Authorization")
			ecode = errcode.Success
		)
		uid := 0
		rid := ""
		if auth == "" {
			ecode = errcode.TokenParamEmpty
		} else {
			// 截取前面的 Bearer
			token := auth[7:]
			if auth == "" || token == "" {
				ecode = errcode.TokenParamEmpty
			} else {
				claims, err := app.ParseToken(token)
				if err != nil {
					switch err.(*jwt.ValidationError).Errors {
					case jwt.ValidationErrorExpired:
						ecode = errcode.TokenExpired
					default:
						ecode = errcode.TokenParseError
					}
				} else {
					uid = claims.Uid
					rid = claims.Rid
				}
			}
		}
		if ecode != errcode.Success {
			app.NewResponse(c).Error(ecode, nil)
			c.Abort()
			return
		}
		global.Uid = uid
		global.Rid = rid
		c.Next()
	}
}
