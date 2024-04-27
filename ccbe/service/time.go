package service

import (
	"cc/be/cache"
	"cc/be/global"
)

// 查询时间信息
func (srv *Service) GetUpdateTime() int64 {
	// 获取用户的更新时间缓存
	return cache.GetUserUpdateTime(global.Uid)
}
