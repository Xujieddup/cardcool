package service

import (
	"errors"
	"cc/be/global"
	"cc/be/model"
	"cc/be/validreq"

	"gorm.io/gorm"
)

// 获取指定视图的分享信息
func (srv *Service) GetShareData(shareId string) (*model.Share, error) {
	ms := &model.Share{}
	err := ms.GetShareData(shareId)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return ms, err
}

// 获取指定视图的分享信息
func (srv *Service) GetShareInfo(uid int, viewId string) (*model.Share, error) {
	ms := &model.Share{}
	err := ms.GetShareInfo(uid, viewId)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return ms, nil
	}
	return ms, err
}

// 创建或刷新视图分享
func (srv *Service) CreateShare(uid int, params *validreq.CreateShareReq) (*model.Share, error) {
	// 查询视图信息
	if !srv.CheckViewExist(uid, params.ViewId) {
		return nil, errors.New("查询视图信息异常")
	}
	// 查询该视图当前是否存在分享数据
	ms := &model.Share{}
	err := ms.GetShareInfo(uid, params.ViewId)
	// 没有查询到分享数据，因此创建新的分享
	if errors.Is(err, gorm.ErrRecordNotFound) {
		err = ms.CreateShare(global.Uid, params.Type, params.ViewId, params.Name, params.Icon, params.Content)
		if err != nil {
			return nil, err
		}
		return ms, nil
	} else if err != nil || ms.Id == 0 {
		return nil, errors.New("查询分享数据异常")
	} else {
		// 已经存在分享数据，则进行更新
		err = ms.UpdateShare(ms.Id, params.Name, params.Icon, params.Content)
		if err != nil {
			return nil, err
		}
		return ms, nil
	}
}

// 更新视图分享状态
func (srv *Service) UpdateShareStatus(uid int, params *validreq.UpdateShareStatusReq) error {
	ms := &model.Share{}
	return ms.UpdateShareStatus(uid, params.ViewId, params.Status)
}
