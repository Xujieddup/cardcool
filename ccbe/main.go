package main

import (
	"log"
	"net/http"
	"time"

	"cc/be/cache"
	"cc/be/global"
	"cc/be/model"
	"cc/be/router"
	"cc/be/server"
	"cc/be/setting"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func init() {
	err := initSetting()
	if err != nil {
		log.Fatalf("init Setting err: %v", err)
	}
	err = initDBEngine()
	if err != nil {
		log.Fatalf("init DBEngine err: %v", err)
	}
	initRedis()
	// if err != nil {
	// 	log.Fatalf("init RedisDb err: %v", err)
	// }
	initSSE()
	initLogger()
}

func initSetting() error {
	setting, err := setting.NewSetting()
	if err != nil {
		return err
	}
	err = setting.ReadSection("Server", &global.ServerSetting)
	if err != nil {
		return err
	}
	// 转换配置单位
	global.ServerSetting.ReadTimeout *= time.Second
	global.ServerSetting.WriteTimeout *= time.Second
	err = setting.ReadSection("App", &global.AppSetting)
	if err != nil {
		return err
	}
	err = setting.ReadSection("Jwt", &global.JwtSetting)
	if err != nil {
		return err
	}
	global.JwtSetting.Expire *= time.Second
	err = setting.ReadSection("Database", &global.DatabaseSetting)
	if err != nil {
		return err
	}
	err = setting.ReadSection("Redis", &global.RedisSetting)
	if err != nil {
		return err
	}
	err = setting.ReadSection("Qiniu", &global.QiniuSetting)
	if err != nil {
		return err
	}
	return nil
}

func initDBEngine() error {
	var err error
	global.DBEngine, err = model.NewDBEngine(global.DatabaseSetting)
	if err != nil {
		return err
	}
	return nil
}

func initRedis() {
	global.RedisDb = cache.NewRedisDb(global.RedisSetting)
}

func initLogger() {
	global.Logger, _ = zap.NewDevelopment()
	// defer logger.Sync()
}

func initSSE() {
	// 初始化流服务
	global.SSEClientMap = server.NewSSEClientMap()
}

func main() {
	gin.SetMode(global.ServerSetting.RunMode)

	go func() {
		sseserver := &http.Server{
			Addr:           ":" + global.ServerSetting.HttpSSEPort,
			Handler:        router.NewSSERouter(),
			ReadTimeout:    global.ServerSetting.ReadTimeout,
			WriteTimeout:   0,
			MaxHeaderBytes: 1 << 20,
		}
		sseserver.ListenAndServe()
	}()

	s := &http.Server{
		Addr:           ":" + global.ServerSetting.HttpPort,
		Handler:        router.NewRouter(),
		ReadTimeout:    global.ServerSetting.ReadTimeout,
		WriteTimeout:   global.ServerSetting.WriteTimeout,
		MaxHeaderBytes: 1 << 20,
	}
	s.ListenAndServe()
}
