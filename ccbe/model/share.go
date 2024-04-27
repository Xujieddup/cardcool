package model

import (
	"cc/be/global"
	"cc/be/utils"
)

type Share struct {
	Id         int    `gorm:"primary_key" json:"id"`
	Uuid       string `json:"uuid"`
	Uid        int    `json:"uid"`
	ViewId     string `json:"view_id"`
	Name       string `json:"name"`
	Type       int8   `json:"type"`
	Icon       string `json:"icon"`
	Status     int8   `json:"status"`
	Content    string `json:"content"`
	CreateTime int    `gorm:"autoCreateTime" json:"create_time,omitempty"`
	UpdateTime int    `gorm:"autoUpdateTime" json:"update_time,omitempty"`
}

func (Share) TableName() string {
	return "share"
}

func (s *Share) GetShareInfo(uid int, viewId string) error {
	return global.DBEngine.Select("id,uuid,status,update_time").Where("uid", uid).Where("view_id", viewId).Take(s).Error
}

func (s *Share) GetShareData(shareId string) error {
	return global.DBEngine.Select("uuid,view_id,name,type,icon,status,content,update_time").Where("uuid", shareId).Take(s).Error
}

func (s *Share) CreateShare(uid int, t int8, viewId, name, icon, content string) error {
	s.Uid = uid
	s.Uuid = utils.UnidByNum(24)
	s.ViewId = viewId
	s.Name = name
	s.Icon = icon
	s.Type = t
	s.Status = 1
	s.Content = content
	return global.DBEngine.Create(s).Error
}

func (s *Share) UpdateShare(id int, name, icon, content string) error {
	s.Name = name
	s.Icon = icon
	s.Status = 1
	s.Content = content
	return global.DBEngine.Select("name", "icon", "status", "content", "update_time").Updates(s).Error
}

func (s *Share) UpdateShareStatus(uid int, viewId string, status int8) error {
	s.Status = status
	return global.DBEngine.Select("status", "update_time").Where("uid", uid).Where("view_id", viewId).Updates(s).Error
}
