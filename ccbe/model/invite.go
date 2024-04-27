package model

import (
	"cc/be/global"
)

type Invite struct {
	Id         int    `gorm:"primary_key" json:"id"`
	Code       string `json:"code"`
	LimitType  int8   `json:"limit_type"`
	StartTime  int    `json:"start_time"`
	EndTime    int    `json:"end_time"`
	Status     int8   `json:"status"`
	CreateUid  int    `json:"create_uid"`
	CreateTime int    `gorm:"autoCreateTime" json:"create_time,omitempty"`
	UpdateTime int    `gorm:"autoUpdateTime" json:"update_time,omitempty"`
}

func (Invite) TableName() string {
	return "invite"
}

func (i *Invite) GetByCode(code string) error {
	return global.DBEngine.Select("id,limit_type,start_time,end_time,status,create_uid").Where("code", code).Take(i).Error
}

func (i *Invite) ExistByCode(code string) bool {
	res := global.DBEngine.Select("id").Where("code", code).Take(i)
	return res.RowsAffected > 0
}

func (i *Invite) BatchInsertInvites(uid, startTime, endTime int, limitType int8, codes *[]string) error {
	var list []*Invite
	for _, code := range *codes {
		inv := &Invite{
			Code:      code,
			LimitType: limitType,
			StartTime: startTime,
			EndTime:   endTime,
			Status:    0,
			CreateUid: uid,
		}
		list = append(list, inv)
	}
	return global.DBEngine.Create(list).Error
}

func (i *Invite) UpdateInviteStatus() error {
	invite := Invite{
		Status: 1,
	}
	return global.DBEngine.Model(i).Updates(invite).Error
}
