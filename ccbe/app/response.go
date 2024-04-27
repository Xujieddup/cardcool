package app

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"cc/be/errcode"
	"cc/be/global"
	"cc/be/utils"
)

type Response struct {
	Ctx *gin.Context
}

type Pager struct {
	Page      int `json:"page"`
	PageSize  int `json:"page_size"`
	TotalRows int `json:"total_rows"`
}

func NewResponse(ctx *gin.Context) *Response {
	return &Response{Ctx: ctx}
}

func (r *Response) ToResponse(data interface{}) {
	if data == nil {
		data = gin.H{}
	}
	r.Ctx.JSON(http.StatusOK, data)
}

func (r *Response) ToResponseList(list interface{}, totalRows int) {
	r.Ctx.JSON(http.StatusOK, gin.H{
		"list": list,
		"pager": Pager{
			Page:      utils.GetPage(r.Ctx),
			PageSize:  utils.GetPageSize(r.Ctx),
			TotalRows: totalRows,
		},
	})
}

func (r *Response) ToErrorResponse(err *errcode.Error) {
	response := gin.H{"code": err.Code(), "msg": err.Msg()}
	details := err.Details()
	if len(details) > 0 {
		response["details"] = details
	}

	r.Ctx.JSON(err.StatusCode(), response)
}

// 错误响应
func (r *Response) Error(errcode *errcode.Error, err error) {
	message := errcode.Msg()
	if err != nil {
		message += ": " + err.Error()
	}
	global.Logger.Error(message)
	response := gin.H{"code": errcode.Code(), "msg": message}
	r.Ctx.JSON(errcode.StatusCode(), response)
}

// 成功响应
func (r *Response) Success(data interface{}) {
	errcode := errcode.Success
	response := gin.H{
		"code": errcode.Code(),
		"msg":  errcode.Msg(),
		"data": data,
	}
	r.Ctx.JSON(errcode.StatusCode(), response)
}
