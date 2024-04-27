package cache

import (
	"context"
	"log"
	"cc/be/global"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

const USER_UPDATE_KEY = "user_update:"
const USER_UPDATE_EXPIRE = 864000 * time.Second

func getUserUpdateKey(uid int) string {
	return USER_UPDATE_KEY + strconv.Itoa(uid)
}

// 获取用户的更新时间缓存
func GetUserUpdateTime(uid int) int64 {
	ctx := context.Background()
	updateKey := getUserUpdateKey(uid)
	t, err := global.RedisDb.Get(ctx, updateKey).Result()
	if err == redis.Nil {
		// 未查询到缓存数据，则更新
		ti := time.Now().UnixMilli()
		// 刷新更新时间缓存
		err = global.RedisDb.Set(ctx, updateKey, ti, USER_UPDATE_EXPIRE).Err()
		if err != nil {
			log.Printf("Redis 更新缓存异常: %s", err)
		}
		return ti
	} else if err != nil {
		log.Printf("Redis 查询缓存异常: %s", err)
		return 0
	}
	i, err := strconv.ParseInt(t, 10, 64)
	if err != nil {
		log.Printf("数据转换异常: %s", err)
		return 0
	}
	return i
}

// 获取用户的更新时间缓存
func SetUserUpdateTime(uid int, newTime int64) {
	ctx := context.Background()
	currentTime := GetUserUpdateTime(uid)
	if currentTime < newTime {
		updateKey := getUserUpdateKey(uid)
		err := global.RedisDb.Set(ctx, updateKey, newTime, USER_UPDATE_EXPIRE).Err()
		if err != nil {
			log.Printf("Redis 更新缓存异常: %s", err)
		}
		// 推送更新消息给其他客户端
		// log.Println("Push msg", uid, global.Rid, newTime)
		// 发送当前时间到客户端消息频道
		global.SSEClientMap.PushMsg(uid, global.Rid, newTime)
	}
}
