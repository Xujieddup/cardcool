package model

import (
	"cc/be/global"
)

type Tag struct {
	Model
	Name    string `json:"name"`
	SpaceId string `json:"space_id"`
	Pid     string `json:"pid"`
	Color   string `json:"color"`
	Snum    int    `json:"snum"`
}

func (Tag) TableName() string {
	return "tag"
}

// 获取节点分组列表
func (t *Tag) GetTagCheckMap(uid int, ids []string) (*map[string]int64, error) {
	var models []CheckModel
	err := global.DBEngine.Table("tag").Select("id,update_time").Where("uid", uid).Where("id in ?", ids).Find(&models).Error
	if err != nil {
		return nil, err
	}
	return checkMap(models), nil
}

// 获取节点分组列表
func (t *Tag) GetTags(uid int, updateTime int64, limit int) (*[]Tag, error) {
	var tags []Tag
	err := global.DBEngine.Table("tag").Select("*").Where("uid", uid).Where("update_time > ?", updateTime).Limit(limit).Order("update_time").Find(&tags).Error
	if err != nil {
		return nil, err
	}
	// 如果查询的结果数等于 limit ，则可能存在同一更新时间有多条记录的情况，需要查询剩余的记录
	if len(tags) == limit {
		// 获取剩余记录
		var reminds []Tag
		err = global.DBEngine.Table("tag").Select("*").Where("uid", uid).Where("update_time", tags[limit-1].UpdateTime).Where("unid > ?", tags[limit-1].Unid).Find(&reminds).Error
		if err != nil {
			return nil, err
		}
		if len(reminds) > 0 {
			tags = append(tags, reminds...)
		}
	}
	// fmt.Println("tags", tags)
	return &tags, nil
}

// 创建
func (t *Tag) CreateTag(tag *Tag) error {
	return global.DBEngine.Create(tag).Error
}

// 批量创建
func (t *Tag) CreateTags(tags *[]*Tag) error {
	return global.DBEngine.Create(tags).Error
}

// 批量更新
func (t *Tag) UpdateTags(tags *[]*Tag) error {
	for _, tag := range *tags {
		global.DBEngine.Select("name", "space_id", "pid", "color", "snum", "is_deleted", "deleted", "update_time").Where("uid", tag.Uid).Where("id", tag.Id).Updates(tag)
	}
	return nil
}
