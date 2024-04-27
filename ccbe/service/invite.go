package service

import (
	"errors"
	"math/rand"
	"time"

	"cc/be/global"
	"cc/be/model"
	"cc/be/utils"
)

func genCodes(num int) *[]string {
	// 利用当前时间的UNIX时间戳初始化rand包
	rand.Seed(time.Now().UnixNano())
	codes := make([]string, num)
	im := &model.Invite{}
	for i := 0; i < num; i++ {
		code := utils.RandStr(10)
		for im.ExistByCode(code) {
			im = &model.Invite{}
			code = utils.RandStr(10)
		}
		codes[i] = code
	}

	return &codes
}

// 注册账号
func (srv *Service) GenerateCodes(limitType int8, startTime, endTime, num int) error {
	if limitType < 0 || startTime < 0 || endTime < 0 || num <= 0 {
		return errors.New("参数异常")
	}
	im := &model.Invite{}
	codes := genCodes(num)
	err := im.BatchInsertInvites(global.Uid, startTime, endTime, limitType, codes)
	if err != nil {
		return errors.New("生成邀请码失败")
	}
	return nil
}
