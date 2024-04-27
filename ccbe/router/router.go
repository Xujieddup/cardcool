package router

import (
	"io"
	"log"
	"cc/be/api"
	"cc/be/global"
	"cc/be/middleware"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sse"
	"github.com/gin-gonic/gin"
)

// 将新事件消息广播到所有已注册的客户端连接通道
type ClientChan chan int64

// 新建路由
func NewRouter() *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-type", "Referer", "User-Agent"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	a := r.Group("/api")
	tokenApi := api.NewTokenApi()
	// 视图分享逻辑
	shareApi := api.NewShareApi()
	{
		// 注册账号
		a.POST("/register", tokenApi.Register)
		// 登录账号
		a.POST("/login", tokenApi.Login)
		// 微信扫码登录回调
		a.POST("/callback", tokenApi.Callback)
		// 根据微信扫码授权回调和邀请码注册账号
		// a.POST("/regcode", tokenApi.RegisterByCode)
		// 根据微信扫码授权回调绑定原手机账号
		a.POST("/bind", tokenApi.BindUser)
		// 忘记密码
		// a.POST("/register", userApi.Register)
		// 七牛云文件上传回调
		a.POST("/qiniucallback", tokenApi.QiniuCallback)
		// 超时模拟
		a.POST("/timeout", tokenApi.Timeout)
		a.GET("/shareData/:shareId", shareApi.GetShareData)
		// 客户端下载
		a.GET("/client", tokenApi.Client)
	}
	a.Use(middleware.Auth())
	// 用户信息接口
	userApi := api.NewUserApi()
	{
		// 获取服务端信息
		a.GET("/info", userApi.GetInfo)
		// 绑定微信
		a.POST("/bindWechat", userApi.BindWechat)
		// 更新手机账号
		a.POST("/updateMobileAccount", userApi.UpdateMobileAccount)
		// 更新用户信息
		a.POST("/updateUserinfo", userApi.UpdateUserinfo)
		// 更新用户配置
		a.POST("/updateConfig", userApi.UpdateConfig)
		// 修改账号
		a.POST("/change", userApi.Change)
		// 修改密码
		// a.POST("/register", userApi.Register)
	}
	// 视图分享逻辑
	{
		// 获取指定视图的分享信息
		a.GET("/shareInfo/:viewId", shareApi.GetShareInfo)
		// 创建或刷新视图分享
		a.POST("/share", shareApi.CreateShare)
		// 更新视图分享状态
		a.POST("/updateShareStatus", shareApi.UpdateShareStatus)
	}
	// 文件上传凭证接口
	uploadApi := api.NewUploadApi()
	{
		// 获取时间
		a.POST("/uploadToken", uploadApi.GetUploadToken)
	}

	// 超级管理员权限校验
	ad := r.Group("/admin")
	ad.Use(middleware.Auth(), middleware.Admin())
	inviteApi := api.NewInviteApi()
	{
		// 添加账号
		ad.POST("/addAccount", userApi.AddAccount)
		// 生成邀请码
		ad.POST("/generateCodes", inviteApi.GenerateCodes)
		// 更新客户端版本
		ad.POST("/updateClient", userApi.UpdateClient)
	}

	// GraphQL
	gql := r.Group("/graph")
	// token 校验中间件
	gql.Use(middleware.Auth())
	gqlApi := api.NewGraphQLApi()
	{
		// GraphQL 工具
		// gql.GET("/play", gqlApi.PlaygroundHandler())
		// GraphQL 查询
		gql.POST("/query", gqlApi.GraphQLHandler())
	}
	return r
}

// 新建路由
func NewSSERouter() *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "Content-type", "Referer", "User-Agent"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	a := r.Group("/sse")
	a.Use(middleware.Auth())
	// 用户信息接口
	// userApi := api.NewUserApi()
	{
		// 获取服务端的更新通知
		a.GET("/notice", HeadersMiddleware(), serveHTTP(), func(c *gin.Context) {
			v, ok := c.Get("clientChan")
			if !ok {
				return
			}
			clientChan, ok := v.(ClientChan)
			if !ok {
				return
			}
			// 1s 后下发 retry time 给前端，更新前端的重试时间
			go func() {
				time.Sleep(time.Second * 1)
				clientChan <- 0
			}()
			c.Stream(func(w io.Writer) bool {
				// Stream message to client from message channel
				if msg, ok := <-clientChan; ok {
					c.Render(-1, sse.Event{
						Event: "message",
						Data:  msg,
						Retry: 60000,
					})
					return true
				}
				return false
			})
		})

	}
	return r
}

func serveHTTP() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 初始化一个客户端 channel
		clientChan := make(ClientChan)
		// 保存新客户端连接
		global.SSEClientMap.AddClient(global.Uid, global.Rid, clientChan)
		log.Println("Client added. ", global.SSEClientMap)
		defer func() {
			// 链接断开时，通知连接关闭
			global.SSEClientMap.DelClient(global.Uid, global.Rid)
			close(clientChan)
			log.Println("Client deleted. ", global.SSEClientMap)
		}()
		c.Set("clientChan", clientChan)
		c.Next()
	}
}

// Add event-streaming headers
func HeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Content-Type", "text/event-stream")
		c.Writer.Header().Set("Cache-Control", "no-cache")
		c.Writer.Header().Set("Connection", "keep-alive")
		c.Next()
	}
}
