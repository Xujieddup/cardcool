package api

import (
	"errors"
	"cc/be/app"
	"cc/be/errcode"
	"cc/be/global"
	"cc/be/service"
	"cc/be/validreq"

	"github.com/gin-gonic/gin"
)

type ShareApi struct{}

func NewShareApi() *ShareApi {
	return &ShareApi{}
}

// 获取指定视图的分享信息
func (s *ShareApi) GetShareData(c *gin.Context) {
	resp := app.NewResponse(c)
	shareId := c.Param("shareId")
	if shareId == "" {
		resp.Error(errcode.InvalidParams, errors.New("请求参数异常"))
		return
	}
	// 查询视图的分享信息
	srv := service.New(c.Request.Context())
	share, err := srv.GetShareData(shareId)
	if err != nil {
		resp.Error(errcode.QueryShareError, err)
		return
	}
	if share == nil {
		resp.Error(errcode.QueryShareNullError, err)
		return
	}
	if share.Status != 1 {
		resp.Error(errcode.ShareStatusError, err)
		return
	}
	resp.Success(gin.H{
		"uuid":       share.Uuid,
		"viewId":     share.ViewId,
		"name":       share.Name,
		"type":       share.Type,
		"icon":       share.Icon,
		"status":     share.Status,
		"content":    share.Content,
		"updateTime": share.UpdateTime,
	})
}

// 获取指定视图的分享信息
func (s *ShareApi) GetShareInfo(c *gin.Context) {
	resp := app.NewResponse(c)
	viewId := c.Param("viewId")
	if viewId == "" {
		resp.Error(errcode.InvalidParams, errors.New("请求参数异常"))
		return
	}
	// 查询视图的分享信息
	srv := service.New(c.Request.Context())
	share, err := srv.GetShareInfo(global.Uid, viewId)
	if err != nil {
		resp.Error(errcode.QueryShareError, err)
		return
	}
	resp.Success(gin.H{
		"uuid":       share.Uuid,
		"status":     share.Status,
		"viewId":     viewId,
		"updateTime": share.UpdateTime,
	})
}

// 创建或刷新视图分享
func (s *ShareApi) CreateShare(c *gin.Context) {
	params := &validreq.CreateShareReq{}
	resp, err := validParams(c, params)
	if err != nil {
		return
	}
	// 创建或刷新视图分享
	srv := service.New(c.Request.Context())
	share, err := srv.CreateShare(global.Uid, params)
	if err != nil {
		resp.Error(errcode.CreateShareError, err)
		return
	}
	resp.Success(gin.H{
		"uuid":       share.Uuid,
		"status":     share.Status,
		"viewId":     params.ViewId,
		"updateTime": share.UpdateTime,
	})
}

// 更新视图分享状态
func (s *ShareApi) UpdateShareStatus(c *gin.Context) {
	params := &validreq.UpdateShareStatusReq{}
	resp, err := validParams(c, params)
	if err != nil {
		return
	}
	// 更新视图分享状态
	srv := service.New(c.Request.Context())
	err = srv.UpdateShareStatus(global.Uid, params)
	if err != nil {
		resp.Error(errcode.UpdateShareStatusError, err)
		return
	}
	resp.Success(nil)
}
