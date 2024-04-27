package service

import (
	"errors"
	"cc/be/model"
	"cc/be/utils"
	"unicode/utf8"
)

// 批量创建节点
func (srv *Service) CreateTypes(types *[]*model.Type) error {
	var propList []*model.Propext
	for _, t := range *types {
		// 判断当前字段长度，如果超长则添加到 propext 表
		if utf8.RuneCountInString(t.Props) > model.LIMIT_4096 {
			prop := &model.Propext{
				Uid:    t.Uid,
				Id:     t.Id,
				TypeId: model.TYPE_TYPE_CONFIG,
				Props:  t.Props,
			}
			t.Props = ""
			propList = append(propList, prop)
		}
		if utf8.RuneCountInString(t.Styles) > model.LIMIT_4096 {
			prop := &model.Propext{
				Uid:    t.Uid,
				Id:     t.Id,
				TypeId: model.TYPE_TYPE_STYLE,
				Props:  t.Styles,
			}
			t.Styles = ""
			propList = append(propList, prop)
		}
	}
	mt := &model.Type{}
	err := mt.CreateTypes(types)
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
func (srv *Service) UpdateTypes(uid int, types *[]*model.Type, typeIds *[]string) error {
	mt := &model.Type{}
	p := &model.Propext{}
	// 查询已经保存在 propext 扩展表的信息
	extIdTypeMap, err := p.GetPropextIdTypeMap(uid, typeIds)
	if err != nil {
		return err
	}
	var insertPropList []*model.Propext
	var updatePropList []*model.Propext
	for _, ty := range *types {
		// 如果 propext 表中已经存在扩展数据，则直接更新扩展数据
		if t, ok := (*extIdTypeMap)[ty.Id]; ok {
			if (t & model.TYPE_TYPE_CONFIG) > 0 {
				prop := &model.Propext{
					Uid:    ty.Uid,
					Id:     ty.Id,
					TypeId: model.TYPE_TYPE_CONFIG,
					Props:  ty.Props,
				}
				updatePropList = append(updatePropList, prop)
				ty.Props = ""
			}
			if (t & model.TYPE_TYPE_STYLE) > 0 {
				prop := &model.Propext{
					Uid:    ty.Uid,
					Id:     ty.Id,
					TypeId: model.TYPE_TYPE_STYLE,
					Props:  ty.Styles,
				}
				updatePropList = append(updatePropList, prop)
				ty.Styles = ""
			}
		}
		// 否则判断当前字段长度，如果超长则添加到 propext 表
		if utf8.RuneCountInString(ty.Props) > model.LIMIT_4096 {
			prop := &model.Propext{
				Uid:    ty.Uid,
				Id:     ty.Id,
				TypeId: model.TYPE_TYPE_CONFIG,
				Props:  ty.Props,
			}
			ty.Props = ""
			insertPropList = append(insertPropList, prop)
		}
		if utf8.RuneCountInString(ty.Styles) > model.LIMIT_4096 {
			prop := &model.Propext{
				Uid:    ty.Uid,
				Id:     ty.Id,
				TypeId: model.TYPE_TYPE_STYLE,
				Props:  ty.Styles,
			}
			ty.Styles = ""
			insertPropList = append(insertPropList, prop)
		}
	}
	err = mt.UpdateTypes(types)
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
func (srv *Service) GetTypes(uid int, updateTime int64, limit int) (*[]model.Type, error) {
	mt := &model.Type{}
	list, err := mt.GetTypes(uid, updateTime, limit)
	if err != nil {
		return nil, err
	}
	if len(*list) <= 0 {
		return list, nil
	}
	var typeIds []string
	for _, t := range *list {
		if t.Props == "" || t.Styles == "" {
			typeIds = append(typeIds, t.Id)
		}
	}
	if len(typeIds) <= 0 {
		return list, nil
	}
	p := &model.Propext{}
	propMap, err := p.GetPropexts(uid, &typeIds)
	if err != nil {
		return nil, err
	}
	for i, t := range *list {
		if prop, ok := (*propMap)[t.Id+string(rune(model.TYPE_TYPE_CONFIG))]; ok {
			(*list)[i].Props = prop
		}
		if prop, ok := (*propMap)[t.Id+string(rune(model.TYPE_TYPE_STYLE))]; ok {
			(*list)[i].Styles = prop
		}
	}
	return list, nil
}

// 初始化类型
func (srv *Service) InitType(uid int, t int64) (*[]string, error) {
	ts := []string{utils.Unid(t), utils.Unid(t + 1)}
	types := []*model.Type{
		{
			Model: model.Model{
				Uid:        uid,
				Id:         ts[0],
				UpdateTime: t,
				IsDeleted:  0,
				Deleted:    0,
			},
			Name:   "人物卡",
			Icon:   "dup",
			Props:  `[{"id":"name","name":"人物名称","nameType":1,"type":"name","defaultVal":"","hide":0,"handles":["copy"],"show":[],"options":[],"layout":{"i":"name","w":6,"h":1,"x":0,"y":0,"minW":3,"maxH":1,"static":true}},{"id":"tags","name":"标签","nameType":1,"type":"tags","defaultVal":[],"hide":0,"handles":[],"show":[],"options":[],"layout":{"i":"tags","w":6,"h":1,"x":0,"y":1,"minW":3,"maxH":1,"static":false}},{"id":"TdqTDfDqrVq_","name":"生日","nameType":0,"type":"date","defaultVal":"","hide":0,"handles":["copy"],"show":["inline"],"layout":{"i":"TdqTDfDqrVq_","w":6,"h":1,"x":0,"y":2,"minW":3,"maxH":1,"static":false}},{"id":"TdqTMYfggFt_","name":"手机","type":"phone","handles":["copy"],"show":["inline"],"nameType":0,"defaultVal":"","hide":0,"layout":{"i":"TdqTMYfggFt_","w":6,"h":1,"x":0,"y":3,"minW":3,"maxH":1,"static":false}},{"id":"TdqTQeDUqLt_","name":"关系","type":"select","options":[{"id":"TdqTbxOTtfH_","label":"亲人","color":"#ff5722"},{"id":"TdqTcWLVedx_","label":"朋友","color":"#03a9f4"},{"id":"TdqTdzCrqtM_","label":"同事","color":"#4caf50"}],"nameType":0,"defaultVal":"TdqTcWLVedx_","hide":0,"layout":{"i":"TdqTQeDUqLt_","w":6,"h":1,"x":0,"y":4,"minW":3,"maxH":1,"static":false}},{"id":"TdqTLBKlOZl_","name":"地址","type":"text","handles":["copy"],"show":["inline"],"nameType":0,"defaultVal":"","hide":0,"layout":{"i":"TdqTLBKlOZl_","w":6,"h":1,"x":0,"y":5,"minW":3,"maxH":1,"static":false}},{"id":"content","name":"人物事件","nameType":1,"type":"content","defaultVal":null,"hide":0,"handles":[],"show":[],"options":[],"layout":{"i":"content","w":6,"h":6,"x":0,"y":6,"minW":3,"maxH":11,"static":false}}]`,
			Styles: "[]",
			Desc:   "人物信息卡片",
		},
		{
			Model: model.Model{
				Uid:        uid,
				Id:         ts[1],
				UpdateTime: t + 1,
				IsDeleted:  0,
				Deleted:    0,
			},
			Name:   "日记卡",
			Icon:   "dup",
			Props:  `[{"id":"name","name":"日记名","nameType":1,"type":"name","defaultVal":"{$d}","hide":0,"handles":["copy"],"show":[],"options":[],"layout":{"i":"name","w":6,"h":1,"x":0,"y":0,"minW":3,"maxH":1}},{"id":"tags","name":"标签","nameType":1,"type":"tags","defaultVal":[],"hide":0,"handles":[],"show":[],"options":[],"layout":{"i":"tags","w":6,"h":1,"x":0,"y":1,"minW":3,"maxH":1}},{"id":"U0gWTEhJkRJ_","name":"日期","nameType":0,"type":"date","defaultVal":"{$d}","hide":0,"handles":["copy"],"show":[],"options":[],"layout":{"i":"U0gWTEhJkRJ_","w":6,"h":1,"x":0,"y":2,"minW":3,"maxH":1}},{"id":"content","name":"日记内容","nameType":1,"type":"content","defaultVal":null,"hide":0,"handles":[],"show":[],"options":[],"layout":{"i":"content","w":6,"h":9,"x":0,"y":3,"minW":6,"maxH":11}}]`,
			Styles: "[]",
			Desc:   "每日记录、思考与总结",
		},
	}
	mt := &model.Type{}
	err := mt.CreateTypes(&types)
	if err != nil {
		return &ts, errors.New("初始化卡片类型数据异常")
	}
	return &ts, nil
}
