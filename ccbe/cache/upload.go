package cache

import (
	"context"
	"log"
	"cc/be/global"
	"cc/be/resp"
	"time"
)

const QINIU_UPLOAD_KEY = "qiniu_upload:"

func getUploadTokenKey(uidStr string) string {
	return QINIU_UPLOAD_KEY + uidStr
}

// 获取上传 Token 缓存
func GetUploadToken(uidStr string) *resp.UploadToken {
	ctx := context.Background()
	data := &resp.UploadToken{}
	key := getUploadTokenKey(uidStr)
	if err := global.RedisDb.HGetAll(ctx, key).Scan(data); err != nil {
		log.Printf("Redis 查询缓存异常: %s", err)
		return data
	}
	return data
}

// 设置上传 Token 缓存
func SetUploadToken(uidStr string, data *resp.UploadToken) {
	ctx := context.Background()
	key := getUploadTokenKey(uidStr)
	err := global.RedisDb.HMSet(ctx, key, data).Err()
	if err != nil {
		log.Printf("Redis 更新缓存异常: %s", err)
	}
	global.RedisDb.ExpireAt(ctx, key, time.Unix(data.ExpireTime, 0))
}
