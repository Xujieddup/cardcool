package api

import "github.com/gin-gonic/gin"

type Config struct{}

func NewConfig() *Config {
	return &Config{}
}

// 配置相关路由处理
// 获取配置详情
func (c *Config) Get(ctx *gin.Context) {}

// 更新配置信息
func (c *Config) Update(ctx *gin.Context) {}
