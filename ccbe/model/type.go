package model

import (
	"fmt"
	"cc/be/global"
)

type Type struct {
	Model
	Name   string `json:"name"`
	Icon   string `json:"icon"`
	Snum   int    `json:"snum"`
	Props  string `json:"props"`
	Styles string `json:"styles"`
	Desc   string `json:"desc"`
}

func (Type) TableName() string {
	return "type"
}

// 获取节点分组列表
func (s *Type) GetTypeCheckMap(uid int, ids []string) (*map[string]int64, error) {
	var models []CheckModel
	err := global.DBEngine.Table("type").Select("id,update_time").Where("uid", uid).Where("id in ?", ids).Find(&models).Error
	if err != nil {
		return nil, err
	}
	fmt.Println("models", models)
	return checkMap(models), nil
}

// 获取节点分组列表
func (s *Type) GetTypes(uid int, updateTime int64, limit int) (*[]Type, error) {
	var types []Type
	err := global.DBEngine.Table("type").Select("*").Where("uid", uid).Where("update_time > ?", updateTime).Limit(limit).Order("update_time").Find(&types).Error
	if err != nil {
		return nil, err
	}
	// 如果查询的结果数等于 limit ，则可能存在同一更新时间有多条记录的情况，需要查询剩余的记录
	if len(types) == limit {
		// 获取剩余记录
		var reminds []Type
		err = global.DBEngine.Table("type").Select("*").Where("uid", uid).Where("update_time", types[limit-1].UpdateTime).Where("unid > ?", types[limit-1].Unid).Find(&reminds).Error
		if err != nil {
			return nil, err
		}
		if len(reminds) > 0 {
			types = append(types, reminds...)
		}
	}
	return &types, nil
}

// 批量创建
func (s *Type) CreateTypes(types *[]*Type) error {
	return global.DBEngine.Create(types).Error
}

// 批量更新
func (s *Type) UpdateTypes(types *[]*Type) error {
	for _, t := range *types {
		global.DBEngine.Select("name", "icon", "snum", "props", "styles", "desc", "is_deleted", "deleted", "update_time").Where("uid", t.Uid).Where("id", t.Id).Updates(t)
	}
	return nil
}
