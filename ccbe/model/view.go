package model

import (
	"fmt"
	"cc/be/global"
)

// 0-列表,1-白板，2-看板，3-甘特，4-文档，5-大纲
const TYPE_VIEW_LIST = 0
const TYPE_VIEW_BOARD = 1
const TYPE_VIEW_KANBAN = 2
const TYPE_VIEW_GANTT = 3
const TYPE_VIEW_DOC = 4
const TYPE_VIEW_MDOC = 5

type View struct {
	Model
	Name       string `json:"name"`
	SpaceId    string `json:"space_id"`
	Pid        string `json:"pid"`
	Snum       int    `json:"snum"`
	Type       int    `json:"type"`
	InlineType int    `json:"inline_type"`
	IsFavor    int    `json:"is_favor"`
	Icon       string `json:"icon"`
	Desc       string `json:"desc"`
	Config     string `json:"config"`
}

func (View) TableName() string {
	return "view"
}

// 获取节点分组列表
func (m *View) GetViewCheckMap(uid int, ids []string) (*map[string]int64, error) {
	var models []CheckModel
	err := global.DBEngine.Table("view").Select("id,update_time").Where("uid", uid).Where("id in ?", ids).Find(&models).Error
	if err != nil {
		return nil, err
	}
	fmt.Println("models", models)
	return checkMap(models), nil
}

// 获取节点分组列表
func (m *View) GetViews(uid int, updateTime int64, limit int) (*[]View, error) {
	var views []View
	err := global.DBEngine.Table("view").Select("*").Where("uid", uid).Where("update_time > ?", updateTime).Limit(limit).Order("update_time").Find(&views).Error
	if err != nil {
		return nil, err
	}
	// 如果查询的结果数等于 limit ，则可能存在同一更新时间有多条记录的情况，需要查询剩余的记录
	if len(views) == limit {
		// 获取剩余记录
		var reminds []View
		err = global.DBEngine.Table("view").Select("*").Where("uid", uid).Where("update_time", views[limit-1].UpdateTime).Where("unid > ?", views[limit-1].Unid).Find(&reminds).Error
		if err != nil {
			return nil, err
		}
		if len(reminds) > 0 {
			views = append(views, reminds...)
		}
	}
	// fmt.Println("views", views)
	return &views, nil
}

// 批量创建
func (m *View) CreateViews(views *[]*View) error {
	return global.DBEngine.Create(views).Error
}

// 批量更新
func (m *View) UpdateViews(views *[]*View) error {
	for _, view := range *views {
		global.DBEngine.Select("name", "pid", "snum", "type", "inline_type", "is_favor", "icon", "desc", "config", "is_deleted", "deleted", "update_time").Where("uid", view.Uid).Where("id", view.Id).Updates(view)
	}
	return nil
}

func (m *View) ExistView(uid int, viewId string) bool {
	res := global.DBEngine.Select("unid").Where("uid", uid).Where("id", viewId).Take(m)
	return res.RowsAffected > 0
}
