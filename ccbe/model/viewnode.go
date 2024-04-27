package model

import (
	"fmt"
	"cc/be/global"
)

type Viewnode struct {
	Model
	ViewId   string `json:"view_id"`
	GroupId  string `json:"group_id"`
	Pid      string `json:"pid"`
	NodeType int    `json:"node_type"`
	NodeId   string `json:"node_id"`
	VnTypeId string `json:"vn_type_id"`
	Name     string `json:"name"`
	Content  string `json:"content"`
}

func (Viewnode) TableName() string {
	return "viewnode"
}

// 获取节点分组列表
func (s *Viewnode) GetViewnodeCheckMap(uid int, ids []string) (*map[string]int64, error) {
	var models []CheckModel
	err := global.DBEngine.Table("viewnode").Select("id,update_time").Where("uid", uid).Where("id in ?", ids).Find(&models).Error
	if err != nil {
		return nil, err
	}
	fmt.Println("models", models)
	return checkMap(models), nil
}

// 获取节点分组列表
func (s *Viewnode) GetViewnodes(uid int, updateTime int64, limit int) (*[]Viewnode, error) {
	var viewnodes []Viewnode
	err := global.DBEngine.Table("viewnode").Select("*").Where("uid", uid).Where("update_time > ?", updateTime).Limit(limit).Order("update_time").Find(&viewnodes).Error
	if err != nil {
		return nil, err
	}
	// 如果查询的结果数等于 limit ，则可能存在同一更新时间有多条记录的情况，需要查询剩余的记录
	if len(viewnodes) == limit {
		// 获取剩余记录
		var reminds []Viewnode
		err = global.DBEngine.Table("viewnode").Select("*").Where("uid", uid).Where("update_time", viewnodes[limit-1].UpdateTime).Where("unid > ?", viewnodes[limit-1].Unid).Find(&reminds).Error
		if err != nil {
			return nil, err
		}
		if len(reminds) > 0 {
			viewnodes = append(viewnodes, reminds...)
		}
	}
	// fmt.Println("viewnodes", viewnodes)
	return &viewnodes, nil
}

// 批量创建
func (s *Viewnode) CreateViewnodes(viewnodes *[]*Viewnode) error {
	return global.DBEngine.Create(viewnodes).Error
}

// 批量更新
func (s *Viewnode) UpdateViewnodes(viewnodes *[]*Viewnode) error {
	for _, viewnode := range *viewnodes {
		global.DBEngine.Select("group_id", "pid", "node_type", "node_id", "vn_type_id", "name", "content", "is_deleted", "deleted", "update_time").Where("uid", viewnode.Uid).Where("id", viewnode.Id).Updates(viewnode)
	}
	return nil
}
