package model

import (
	"fmt"
	"cc/be/global"
	"cc/be/validreq"
)

type Card struct {
	Model
	Name       string `json:"name"`
	SpaceId    string `json:"space_id"`
	TypeId     string `json:"type_id"`
	Tags       string `json:"tags"`
	Props      string `json:"props"`
	Content    string `json:"content"`
	CreateTime int    `json:"create_time"`
}

func (Card) TableName() string {
	return "card"
}

// 创建节点
func (n *Card) CreateCard(param *validreq.CreateCardReq) error {
	n.Uid = global.Uid
	n.Name = param.Name
	// n.TypeId = param.TypeId
	// n.CateId = param.CateId
	// n.Content = param.Content
	return global.DBEngine.Create(n).Error
}

// 获取节点分组列表
func (s *Card) GetCardCheckMap(uid int, ids []string) (*map[string]int64, error) {
	var models []CheckModel
	err := global.DBEngine.Table("card").Select("id,update_time").Where("uid", uid).Where("id in ?", ids).Find(&models).Error
	if err != nil {
		return nil, err
	}
	fmt.Println("models", models)
	return checkMap(models), nil
}

// 获取节点分组列表
func (s *Card) GetCards(uid int, updateTime int64, limit int) (*[]Card, error) {
	var cards []Card
	err := global.DBEngine.Table("card").Select("*").Where("uid", uid).Where("update_time > ?", updateTime).Limit(limit).Order("update_time").Find(&cards).Error
	if err != nil {
		return nil, err
	}
	// 如果查询的结果数等于 limit ，则可能存在同一更新时间有多条记录的情况，需要查询剩余的记录
	if len(cards) == limit {
		// 获取剩余记录
		var reminds []Card
		err = global.DBEngine.Table("card").Select("*").Where("uid", uid).Where("update_time", cards[limit-1].UpdateTime).Where("unid > ?", cards[limit-1].Unid).Find(&reminds).Error
		if err != nil {
			return nil, err
		}
		if len(reminds) > 0 {
			cards = append(cards, reminds...)
		}
	}
	// fmt.Println("cards", cards)
	return &cards, nil
}

// 批量创建
func (s *Card) CreateCards(cards *[]*Card) error {
	return global.DBEngine.Create(cards).Error
}

// 批量更新
func (s *Card) UpdateCards(cards *[]*Card) error {
	for _, card := range *cards {
		global.DBEngine.Select("name", "type_id", "tags", "space_id", "props", "content", "is_deleted", "deleted", "create_time", "update_time").Where("uid", card.Uid).Where("id", card.Id).Updates(card)
	}
	return nil
}

// 获取使用扩展信息的节点列表
func (s *Card) GetPropextCardIds(uid int, ids *[]string) (*map[string]int8, error) {
	var cards []Model
	err := global.DBEngine.Table("card").Select("id,type_id").Where("uid", uid).Where("id in ?", *ids).Where("props = ? OR content = ?", "", "").Find(&cards).Error
	if err != nil {
		return nil, err
	}
	return idMap(&cards), nil
}
