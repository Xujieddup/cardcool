package cache

import (
	"context"
	"log"
	"cc/be/global"

	"github.com/redis/go-redis/v9"
)

// 用户信息缓存: username/mobile/avatar/config
const CLIENT_INFO_KEY = "client_info"

// 获取客户端信息缓存
func GetClientInfo() *map[string]string {
	ctx := context.Background()
	info, err := global.RedisDb.HGetAll(ctx, CLIENT_INFO_KEY).Result()
	if err == redis.Nil {
		return nil
	} else if err != nil {
		log.Printf("查询用户信息缓存异常: %s", err)
		return nil
	} else if len(info) == 0 {
		return nil
	} else {
		return &info
	}
}

// 设置客户端信息缓存
func SetClientInfo(info *map[string]string) {
	ctx := context.Background()
	err := global.RedisDb.HMSet(ctx, CLIENT_INFO_KEY, *info).Err()
	if err != nil {
		log.Printf("更新客户端信息缓存异常: %s", err)
	}
}
