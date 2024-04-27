package model

import (
	"cc/be/global"
	"cc/be/utils"
)

// 1-卡片属性, 2-卡片内容, 3-类型属性配置, 4-卡片样式, 5-视图配置, 6-画布边配置, 7-画布节点配置, 8-用户配置，9-文档内容
const TYPE_CARD_PROPS = 1
const TYPE_CARD_CONTENT = 2
const TYPE_TYPE_CONFIG = 3
const TYPE_TYPE_STYLE = 4
const TYPE_VIEW_CONFIG = 5
const TYPE_VE_CONFIG = 6
const TYPE_VN_CONFIG = 7
const TYPE_USER_CONFIG = 8
const TYPE_DOC_CONTENT = 9

const USER_CONFIG_ID = "user_configs"

const LIMIT_512 = 500
const LIMIT_1024 = 1000
const LIMIT_2048 = 2000
const LIMIT_4096 = 4000

type Propext struct {
	Unid   int    `gorm:"primary_key" json:"unid"`
	Uid    int    `json:"uid,omitempty"`
	Id     string `json:"id"`
	TypeId int8   `json:"type_id"`
	Props  string `json:"props"`
}

func (Propext) TableName() string {
	return "propext"
}

// 批量创建
func (p *Propext) CreatePropexts(propexts *[]*Propext) error {
	return global.DBEngine.Create(propexts).Error
}

// 批量更新
func (p *Propext) UpdatePropexts(propexts *[]*Propext) error {
	for _, propext := range *propexts {
		global.DBEngine.Select("props").Where("uid", propext.Uid).Where("id", propext.Id).Where("type_id", propext.TypeId).Updates(propext)
	}
	return nil
}

// 获取列表
func (p *Propext) GetPropexts(uid int, ids *[]string) (*map[string]string, error) {
	var propexts []Propext
	err := global.DBEngine.Table("propext").Select("id,type_id,props").Where("uid", uid).Where("id in ?", *ids).Find(&propexts).Error
	if err != nil {
		return nil, err
	}
	if len(propexts) <= 0 {
		return nil, nil
	}
	propMap := make(map[string]string, len(propexts))
	for _, prop := range propexts {
		propMap[prop.Id+string(rune(prop.TypeId))] = prop.Props
	}
	return &propMap, nil
}

// 获取使用扩展信息的列表
func (p *Propext) GetPropextIdTypeMap(uid int, ids *[]string) (*map[string]int8, error) {
	var exts []Propext
	err := global.DBEngine.Table("propext").Select("id,type_id").Where("uid", uid).Where("id in ?", *ids).Find(&exts).Error
	if err != nil {
		return nil, err
	}
	return idTypeMap(&exts), nil
}

func idTypeMap(list *[]Propext) *map[string]int8 {
	m := make(map[string]int8)
	for _, item := range *list {
		if val, ok := m[item.Id]; ok {
			m[item.Id] = (val | item.TypeId)
		} else {
			m[item.Id] = item.TypeId
		}
	}
	return &m
}

// 获取使用扩展信息的列表
func (p *Propext) GetExtIdMap(uid int, ids *[]string, typeId int) (*map[string]int8, error) {
	var exts []Propext
	err := global.DBEngine.Table("propext").Select("id").Where("uid", uid).Where("id in ?", *ids).Where("type_id", typeId).Find(&exts).Error
	if err != nil {
		return nil, err
	}
	m := make(map[string]int8)
	for _, item := range exts {
		m[item.Id] = 1
	}
	return &m, nil
}

// 获取指定扩展信息
func (p *Propext) GetExtPropByUid(uid int, id string, typeId int) string {
	res := global.DBEngine.Table("propext").Select("props").Where("uid", uid).Where("id", id).Where("type_id", typeId).Take(p)
	return utils.IfThen(res.RowsAffected > 0, p.Props, "")
}
