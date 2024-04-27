package service

import (
	"errors"

	"cc/be/model"
	"cc/be/utils"
)

// 初始化空间
func (srv *Service) InitSpace(uid int, t int64) (string, error) {
	sid := utils.Unid(t)
	s := &model.Space{}
	space := model.Space{
		Model: model.Model{
			Uid:        uid,
			Id:         sid,
			UpdateTime: t,
		},
		Name: "默认空间",
		Icon: "planet",
		Desc: "你的默认卡片空间！",
		Snum: 10000,
	}
	err := s.CreateSpace(&space)
	if err != nil {
		return sid, errors.New("初始化空间数据异常")
	}
	return sid, nil
}
