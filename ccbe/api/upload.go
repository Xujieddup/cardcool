package api

import (
	"cc/be/app"
	"cc/be/errcode"
	"cc/be/service"

	"github.com/gin-gonic/gin"
)

type UploadApi struct{}

func NewUploadApi() *UploadApi {
	return &UploadApi{}
}

func (u *UploadApi) GetUploadToken(c *gin.Context) {
	resp := app.NewResponse(c)
	srv := service.New(c.Request.Context())
	res, err := srv.GetUploadToken()
	if err != nil {
		resp.Error(errcode.UploadTokenError, err)
		return
	}
	resp.Success(res)
}
