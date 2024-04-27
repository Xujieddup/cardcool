package model

import (
	"fmt"

	"cc/be/setting"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Model struct {
	Unid       int    `gorm:"primary_key" json:"unid"`
	Uid        int    `json:"uid,omitempty"`
	Id         string `json:"id"`
	UpdateTime int64  `json:"update_time,omitempty"`
	IsDeleted  int8   `json:"is_deleted"`
	Deleted    int8   `json:"deleted"`
}

type CheckModel struct {
	Id         string `json:"id"`
	UpdateTime int64  `json:"update_time,omitempty"`
}

type Model2 struct {
	Id         int `gorm:"primary_key" json:"id"`
	Uid        int `json:"uid,omitempty"`
	CreateTime int `gorm:"autoCreateTime" json:"create_time,omitempty"`
	UpdateTime int `gorm:"autoUpdateTime" json:"update_time,omitempty"`
}

// 初始化 db 实例
func NewDBEngine(databaseSetting *setting.DatabaseSetting) (*gorm.DB, error) {
	// 拼接 dsn 参数
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s)/%s?charset=%s&parseTime=%v&loc=Local",
		databaseSetting.UserName,
		databaseSetting.Password,
		databaseSetting.Host,
		databaseSetting.DBName,
		databaseSetting.Charset,
		databaseSetting.ParseTime,
	)
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, err
	}
	sqlDb, _ := db.DB()
	sqlDb.SetMaxIdleConns(databaseSetting.MaxIdleConns)
	sqlDb.SetMaxOpenConns(databaseSetting.MaxOpenConns)

	return db, nil
}

func checkMap(list []CheckModel) *map[string]int64 {
	m := make(map[string]int64)
	for _, item := range list {
		m[item.Id] = item.UpdateTime
	}
	return &m
}

func idMap(list *[]Model) *map[string]int8 {
	m := make(map[string]int8)
	for _, item := range *list {
		m[item.Id] = 1
	}
	return &m
}

func listToUpdateMap(list []Model2) map[string]int64 {
	m := make(map[string]int64)
	return m
	// for _, item := range list {
	// 	m[item.Id] = item.UpdatedTime
	// }
	// return m
}
