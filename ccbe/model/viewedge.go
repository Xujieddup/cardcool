package model

import (
	"fmt"
	"cc/be/global"
)

type Viewedge struct {
	Model
	ViewId       string `json:"view_id"`
	Source       string `json:"source"`
	Target       string `json:"target"`
	SourceHandle string `json:"source_handle"`
	TargetHandle string `json:"target_handle"`
	VeTypeId     string `json:"ve_type_id"`
	Name         string `json:"name"`
	Content      string `json:"content"`
}

func (Viewedge) TableName() string {
	return "viewedge"
}

// 获取节点分组列表
func (s *Viewedge) GetViewedgeCheckMap(uid int, ids []string) (*map[string]int64, error) {
	var models []CheckModel
	err := global.DBEngine.Table("viewedge").Select("id,update_time").Where("uid", uid).Where("id in ?", ids).Find(&models).Error
	if err != nil {
		return nil, err
	}
	fmt.Println("models", models)
	return checkMap(models), nil
}

// 获取节点分组列表
func (s *Viewedge) GetViewedges(uid int, updateTime int64, limit int) (*[]Viewedge, error) {
	var viewedges []Viewedge
	err := global.DBEngine.Table("viewedge").Select("*").Where("uid", uid).Where("update_time > ?", updateTime).Limit(limit).Order("update_time").Find(&viewedges).Error
	if err != nil {
		return nil, err
	}
	// 如果查询的结果数等于 limit ，则可能存在同一更新时间有多条记录的情况，需要查询剩余的记录
	if len(viewedges) == limit {
		// 获取剩余记录
		var reminds []Viewedge
		err = global.DBEngine.Table("viewedge").Select("*").Where("uid", uid).Where("update_time", viewedges[limit-1].UpdateTime).Where("unid > ?", viewedges[limit-1].Unid).Find(&reminds).Error
		if err != nil {
			return nil, err
		}
		if len(reminds) > 0 {
			viewedges = append(viewedges, reminds...)
		}
	}
	// fmt.Println("viewedges", viewedges)
	return &viewedges, nil
}

// 批量创建
func (s *Viewedge) CreateViewedges(viewedges *[]*Viewedge) error {
	return global.DBEngine.Create(viewedges).Error
}

// 批量更新
func (s *Viewedge) UpdateViewedges(viewedges *[]*Viewedge) error {
	for _, viewedge := range *viewedges {
		global.DBEngine.Select("source", "target", "source_handle", "target_handle", "ve_type_id", "name", "content", "is_deleted", "deleted", "update_time").Where("uid", viewedge.Uid).Where("id", viewedge.Id).Updates(viewedge)
	}
	return nil
}
