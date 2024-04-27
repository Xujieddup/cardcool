package cache

import (
	"context"
	"log"
	"cc/be/global"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

// 用户信息缓存: username/mobile/avatar/config
const USER_INFO_KEY = "user_info:"
const USER_INFO_EXPIRE = 864000 * time.Second

func getUserInfoKey(uid int) string {
	return USER_INFO_KEY + strconv.Itoa(uid)
}

// 获取用户信息缓存
func GetUserInfo(uid int) *map[string]string {
	ctx := context.Background()
	key := getUserInfoKey(uid)
	info, err := global.RedisDb.HGetAll(ctx, key).Result()
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

// 设置用户信息缓存
func SetUserInfo(uid int, info *map[string]string) {
	ctx := context.Background()
	key := getUserInfoKey(uid)
	err := global.RedisDb.HMSet(ctx, key, *info).Err()
	if err != nil {
		log.Printf("更新用户信息缓存异常: %s", err)
	}
	global.RedisDb.Expire(ctx, key, USER_INFO_EXPIRE)
}

// 更新用户文件上传容量
func UpdateUserFsize(uid int, size int64) {
	ctx := context.Background()
	key := getUserInfoKey(uid)
	err := global.RedisDb.HIncrBy(ctx, key, "fsize", size).Err()
	if err != nil {
		log.Printf("更新用户文件容量缓存异常: %s", err)
	}
	global.RedisDb.Expire(ctx, key, USER_INFO_EXPIRE)
}

// 清除用户信息缓存
func ClearUserInfo(uid int) {
	ctx := context.Background()
	key := getUserInfoKey(uid)
	global.RedisDb.Del(ctx, key)
}
