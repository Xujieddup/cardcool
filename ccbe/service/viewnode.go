package service

import (
	"cc/be/model"
	"unicode/utf8"
)

// 批量创建节点
func (srv *Service) CreateViewnodes(viewnodes *[]*model.Viewnode) error {
	var propList []*model.Propext
	for _, v := range *viewnodes {
		// 判断当前字段长度，如果超长则添加到 propext 表
		if utf8.RuneCountInString(v.Content) > model.LIMIT_1024 {
			prop := &model.Propext{
				Uid:    v.Uid,
				Id:     v.Id,
				TypeId: model.TYPE_VIEW_CONFIG,
				Props:  v.Content,
			}
			v.Content = ""
			propList = append(propList, prop)
		}
	}
	mv := &model.Viewnode{}
	err := mv.CreateViewnodes(viewnodes)
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
func (srv *Service) UpdateViewnodes(uid int, viewnodes *[]*model.Viewnode, viewnodeIds *[]string) error {
	mv := &model.Viewnode{}
	p := &model.Propext{}
	// 查询已经保存在 propext 扩展表的信息
	extIdMap, err := p.GetExtIdMap(uid, viewnodeIds, model.TYPE_VIEW_CONFIG)
	if err != nil {
		return err
	}
	var insertPropList []*model.Propext
	var updatePropList []*model.Propext
	for _, v := range *viewnodes {
		// 如果 propext 表中已经存在扩展数据，则直接更新扩展数据
		if _, ok := (*extIdMap)[v.Id]; ok {
			prop := &model.Propext{
				Uid:    v.Uid,
				Id:     v.Id,
				TypeId: model.TYPE_VIEW_CONFIG,
				Props:  v.Content,
			}
			updatePropList = append(updatePropList, prop)
			v.Content = ""
		}
		// 否则判断当前字段长度，如果超长则添加到 propext 表
		if utf8.RuneCountInString(v.Content) > model.LIMIT_1024 {
			prop := &model.Propext{
				Uid:    v.Uid,
				Id:     v.Id,
				TypeId: model.TYPE_VIEW_CONFIG,
				Props:  v.Content,
			}
			insertPropList = append(insertPropList, prop)
			v.Content = ""
		}
	}
	err = mv.UpdateViewnodes(viewnodes)
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
func (srv *Service) GetViewnodes(uid int, updateTime int64, limit int) (*[]model.Viewnode, error) {
	mv := &model.Viewnode{}
	list, err := mv.GetViewnodes(uid, updateTime, limit)
	if err != nil {
		return nil, err
	}
	if len(*list) <= 0 {
		return list, nil
	}
	var viewnodeIds []string
	for _, v := range *list {
		if v.Content == "" {
			viewnodeIds = append(viewnodeIds, v.Id)
		}
	}
	if len(viewnodeIds) <= 0 {
		return list, nil
	}
	p := &model.Propext{}
	propMap, err := p.GetPropexts(uid, &viewnodeIds)
	if err != nil {
		return nil, err
	}
	for i, v := range *list {
		if prop, ok := (*propMap)[v.Id+string(rune(model.TYPE_VIEW_CONFIG))]; ok {
			(*list)[i].Content = prop
		}
	}
	return list, nil
}
