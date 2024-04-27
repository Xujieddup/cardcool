package model

import (
	"fmt"
	"cc/be/global"
)

type Space struct {
	Model
	Name string `json:"name"`
	Icon string `json:"icon"`
	Desc string `json:"desc"`
	Snum int    `json:"snum"`
}

func (Space) TableName() string {
	return "space"
}

// 获取节点分组列表
func (s *Space) GetSpaceCheckMap(uid int, ids []string) (*map[string]int64, error) {
	var models []CheckModel
	err := global.DBEngine.Table("space").Select("id,update_time").Where("uid", uid).Where("id in ?", ids).Find(&models).Error
	if err != nil {
		return nil, err
	}
	fmt.Println("models", models)
	return checkMap(models), nil
}

// 获取节点分组列表
func (s *Space) GetSpaces(uid int, updateTime int64, limit int) (*[]Space, error) {
	var spaces []Space
	err := global.DBEngine.Table("space").Select("*").Where("uid", uid).Where("update_time > ?", updateTime).Limit(limit).Order("update_time").Find(&spaces).Error
	if err != nil {
		return nil, err
	}
	// 如果查询的结果数等于 limit ，则可能存在同一更新时间有多条记录的情况，需要查询剩余的记录
	if len(spaces) == limit {
		// 获取剩余记录
		var reminds []Space
		err = global.DBEngine.Table("space").Select("*").Where("uid", uid).Where("update_time", spaces[limit-1].UpdateTime).Where("unid > ?", spaces[limit-1].Unid).Find(&reminds).Error
		if err != nil {
			return nil, err
		}
		if len(reminds) > 0 {
			spaces = append(spaces, reminds...)
		}
	}
	fmt.Println("spaces", spaces)
	return &spaces, nil
}

// 创建
func (s *Space) CreateSpace(space *Space) error {
	return global.DBEngine.Create(space).Error
}

// 批量创建
func (s *Space) CreateSpaces(spaces *[]*Space) error {
	return global.DBEngine.Create(spaces).Error
}

// 批量更新
func (s *Space) UpdateSpaces(spaces *[]*Space) error {
	for _, space := range *spaces {
		global.DBEngine.Select("name", "icon", "desc", "snum", "is_deleted", "deleted", "update_time").Where("uid", space.Uid).Where("id", space.Id).Updates(space)
	}
	return nil
}
