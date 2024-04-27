package service

import (
	"errors"
	"cc/be/model"
	"cc/be/utils"
	"unicode/utf8"
)

// 批量创建节点
func (srv *Service) CreateCards(cards *[]*model.Card) error {
	var propList []*model.Propext
	for _, card := range *cards {
		// 判断当前字段长度，如果超长则添加到 propext 表
		if utf8.RuneCountInString(card.Props) > model.LIMIT_1024 {
			prop := &model.Propext{
				Uid:    card.Uid,
				Id:     card.Id,
				TypeId: model.TYPE_CARD_PROPS,
				Props:  card.Props,
			}
			card.Props = ""
			propList = append(propList, prop)
		}
		if utf8.RuneCountInString(card.Content) > model.LIMIT_2048 {
			prop := &model.Propext{
				Uid:    card.Uid,
				Id:     card.Id,
				TypeId: model.TYPE_CARD_CONTENT,
				Props:  card.Content,
			}
			card.Content = ""
			propList = append(propList, prop)
		}
	}
	n := &model.Card{}
	err := n.CreateCards(cards)
	if err != nil {
		return err
	}
	if len(propList) > 0 {
		p := &model.Propext{}
		err := p.CreatePropexts(&propList)
		if err != nil {
			return err
		}
	}
	return nil
}

// 批量更新节点
func (srv *Service) UpdateCards(uid int, cards *[]*model.Card, cardIds *[]string) error {
	n := &model.Card{}
	p := &model.Propext{}
	// 查询已经保存在 propext 扩展表的信息
	extIdTypeMap, err := p.GetPropextIdTypeMap(uid, cardIds)
	if err != nil {
		return err
	}
	var insertPropList []*model.Propext
	var updatePropList []*model.Propext
	for _, card := range *cards {
		// 如果 propext 表中已经存在扩展数据，则直接更新扩展数据
		if t, ok := (*extIdTypeMap)[card.Id]; ok {
			if (t & model.TYPE_CARD_PROPS) > 0 {
				prop := &model.Propext{
					Uid:    card.Uid,
					Id:     card.Id,
					TypeId: model.TYPE_CARD_PROPS,
					Props:  card.Props,
				}
				updatePropList = append(updatePropList, prop)
				card.Props = ""
			}
			if (t & model.TYPE_CARD_CONTENT) > 0 {
				prop := &model.Propext{
					Uid:    card.Uid,
					Id:     card.Id,
					TypeId: model.TYPE_CARD_CONTENT,
					Props:  card.Content,
				}
				updatePropList = append(updatePropList, prop)
				card.Content = ""
			}
		}
		// 否则判断当前字段长度，如果超长则添加到 propext 表
		if utf8.RuneCountInString(card.Props) > model.LIMIT_1024 {
			prop := &model.Propext{
				Uid:    card.Uid,
				Id:     card.Id,
				TypeId: model.TYPE_CARD_PROPS,
				Props:  card.Props,
			}
			card.Props = ""
			insertPropList = append(insertPropList, prop)
		}
		if utf8.RuneCountInString(card.Content) > model.LIMIT_2048 {
			prop := &model.Propext{
				Uid:    card.Uid,
				Id:     card.Id,
				TypeId: model.TYPE_CARD_CONTENT,
				Props:  card.Content,
			}
			card.Content = ""
			insertPropList = append(insertPropList, prop)
		}
	}
	err = n.UpdateCards(cards)
	if err != nil {
		return err
	}
	if len(insertPropList) > 0 {
		err := p.CreatePropexts(&insertPropList)
		if err != nil {
			return err
		}
	}
	if len(updatePropList) > 0 {
		err := p.UpdatePropexts(&updatePropList)
		if err != nil {
			return err
		}
	}
	return nil
}

// 获取节点分组列表
func (srv *Service) GetCards(uid int, updateTime int64, limit int) (*[]model.Card, error) {
	s := &model.Card{}
	list, err := s.GetCards(uid, updateTime, limit)
	if err != nil {
		return nil, err
	}
	if len(*list) <= 0 {
		return list, nil
	}
	var cardIds []string
	for _, card := range *list {
		if card.Props == "" || card.Content == "" {
			cardIds = append(cardIds, card.Id)
		}
	}
	if len(cardIds) <= 0 {
		return list, nil
	}
	p := &model.Propext{}
	propMap, err := p.GetPropexts(uid, &cardIds)
	if err != nil {
		return nil, err
	}
	for i, card := range *list {
		if prop, ok := (*propMap)[card.Id+string(rune(model.TYPE_CARD_PROPS))]; ok {
			(*list)[i].Props = prop
		}
		if prop, ok := (*propMap)[card.Id+string(rune(model.TYPE_CARD_CONTENT))]; ok {
			(*list)[i].Content = prop
		}
	}
	return list, nil
}

// 生成初始化卡片
func (srv *Service) InitCard(uid int, t int64, sid string, ts *[]string) (*[]string, error) {
	cs := []string{utils.Unid(t), utils.Unid(t + 1), utils.Unid(t + 2)}
	cards := []*model.Card{
		{
			Model: model.Model{
				Uid:        uid,
				Id:         cs[0],
				UpdateTime: t,
				IsDeleted:  0,
				Deleted:    0,
			},
			SpaceId: sid,
			TypeId:  (*ts)[0],
			Name:    "唐僧",
			Tags:    "[]",
			Props:   `{"TdqTDfDqrVq_":"0602-01-01","TdqTMYfggFt_":"19999999999","TdqTQeDUqLt_":"TdqTbxOTtfH_","TdqTLBKlOZl_":"东土大唐净土寺","links":["` + cs[1] + `"]}`,
			Content: `{"type":"doc","content":[{"type":"blockquote","content":[{"type":"paragraph","content":[{"type":"text","text":"社会我唐哥，人狠话又多"}]}]},{"type":"nbl","content":[{"type":"nli","attrs":{"coll":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"背景：如来佛祖二弟子"}]}]},{"type":"nli","attrs":{"coll":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"经历：和 "},{"type":"mention","attrs":{"id":"` + cs[1] + `","label":"孙悟空","type":1,"icon":"card"}},{"type":"text","text":" 等西天取经，历经九九八十一难，终成正果"}]}]}]}]}`,
		},
		{
			Model: model.Model{
				Uid:        uid,
				Id:         cs[1],
				UpdateTime: t + 1,
				IsDeleted:  0,
				Deleted:    0,
			},
			SpaceId: sid,
			TypeId:  (*ts)[0],
			Name:    "孙悟空",
			Tags:    "[]",
			Props:   `{"TdqTDfDqrVq_":"0101-01-01","TdqTMYfggFt_":"16666666666","TdqTQeDUqLt_":"TdqTcWLVedx_","TdqTLBKlOZl_":"花果山水帘洞","links":["` + cs[0] + `"]}`,
			Content: `{"type":"doc","content":[{"type":"blockquote","content":[{"type":"paragraph","content":[{"type":"text","text":"猴哥猴哥，你真了不得！"}]}]},{"type":"nbl","content":[{"type":"nli","attrs":{"coll":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"护送 "},{"type":"mention","attrs":{"id":"` + cs[0] + `","label":"唐僧","type":1,"icon":"card"}},{"type":"text","text":" 西天取经，降妖除魔，历经九九八十一难，终成正果，封"},{"type":"text","marks":[{"type":"bold"}],"text":"斗战神佛"},{"type":"text","text":"！"}]}]}]}]}`,
		},
		{
			Model: model.Model{
				Uid:        uid,
				Id:         cs[2],
				UpdateTime: t + 2,
				IsDeleted:  0,
				Deleted:    0,
			},
			SpaceId: sid,
			TypeId:  (*ts)[1],
			Name:    "西游第一日",
			Tags:    "[]",
			Props:   `{"U0gWTEhJkRJ_":"0629-06-06","links":["` + cs[0] + `","` + cs[1] + `"]}`,
			Content: `{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"净业寺里， "},{"type":"mention","attrs":{"id":"` + cs[0] + `","label":"唐僧","type":1,"icon":"card"}},{"type":"text","text":" 与 "},{"type":"mention","attrs":{"id":"` + cs[1] + `","label":"孙悟空","type":1,"icon":"card"}},{"type":"text","text":" 对视一笑，眼中藏着迷人的火光。"}]},{"type":"paragraph","content":[{"type":"text","text":"猪八戒嘴角挑起，歪嘴邪笑，沙悟净则俏皮地眨眼。"}]},{"type":"paragraph","content":[{"type":"text","text":"一场禁忌的邂逅，心跳不已。"}]},{"type":"paragraph","content":[{"type":"text","text":"唐僧心头涌起莫名的悸动，四人的相遇，注定要引发一场爱的冒险。"}]}]}`,
		},
	}
	mc := &model.Card{}
	err := mc.CreateCards(&cards)
	if err != nil {
		return &cs, errors.New("初始化卡片数据异常")
	}
	return &cs, nil
}
