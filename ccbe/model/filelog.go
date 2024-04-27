package model

import (
	"cc/be/global"
)

type Filelog struct {
	Id         int    `gorm:"primary_key" json:"id"`
	Uid        int    `json:"uid"`
	Hash       string `json:"hash"`
	Size       int64  `json:"size"`
	CreateTime int    `gorm:"autoCreateTime" json:"create_time,omitempty"`
}

func (Filelog) TableName() string {
	return "filelog"
}
func (f *Filelog) CreateFilelog() error {
	return global.DBEngine.Create(f).Error
}

func (f *Filelog) ExistByHash(hash string) bool {
	nf := &Filelog{}
	res := global.DBEngine.Select("id").Where("hash", hash).Take(nf)
	return res.RowsAffected > 0
}

func (f *Filelog) SumSize(uid int) int64 {
	var total int64
	err := global.DBEngine.Model(&f).Select("sum(size) as total").Where("uid", uid).Scan(&total).Error
	if err != nil {
		return 0
	}
	return total
}
