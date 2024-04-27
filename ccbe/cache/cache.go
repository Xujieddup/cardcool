package cache

import (
	"cc/be/setting"

	"github.com/redis/go-redis/v9"
)

// 初始化 db 实例
func NewRedisDb(redisSetting *setting.RedisSetting) *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:     redisSetting.Address,
		Password: redisSetting.Password,
		DB:       redisSetting.DB,
	})
}
