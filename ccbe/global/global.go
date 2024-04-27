package global

import (
	"cc/be/server"
	"cc/be/setting"

	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

var (
	ServerSetting     *setting.ServerSetting
	AppSetting        *setting.AppSetting
	JwtSetting        *setting.JwtSetting
	DatabaseSetting   *setting.DatabaseSetting
	RedisSetting      *setting.RedisSetting
	QiniuSetting      *setting.QiniuSetting
)

var (
	DBEngine     *gorm.DB
	RedisDb      *redis.Client
	Logger       *zap.Logger
	Uid          int
	Rid          string
	SSEClientMap *server.ClientMap
)
