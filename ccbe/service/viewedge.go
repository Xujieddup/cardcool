package service

import (
	"cc/be/model"
	"unicode/utf8"
)

// 批量创建节点
func (srv *Service) CreateViewedges(viewedges *[]*model.Viewedge) error {
	var propList []*model.Propext
	for _, v := range *viewedges {
		// 判断当前字段长度，如果超长则添加到 propext 表
		if utf8.RuneCountInString(v.Content) > model.LIMIT_512 {
			prop := &model.Propext{
				Uid:    v.Uid,
				Id:     v.Id,
				TypeId: model.TYPE_VE_CONFIG,
				Props:  v.Content,
			}
			v.Content = ""
			propList = append(propList, prop)
		}
	}
	mv := &model.Viewedge{}
	err := mv.CreateViewedges(viewedges)
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
func (srv *Service) UpdateViewedges(uid int, viewedges *[]*model.Viewedge, viewedgeIds *[]string) error {
	mv := &model.Viewedge{}
	p := &model.Propext{}
	// 查询已经保存在 propext 扩展表的信息
	extIdMap, err := p.GetExtIdMap(uid, viewedgeIds, model.TYPE_VE_CONFIG)
	if err != nil {
		return err
	}
	var insertPropList []*model.Propext
	var updatePropList []*model.Propext
	for _, v := range *viewedges {
		// 如果 propext 表中已经存在扩展数据，则直接更新扩展数据
		if _, ok := (*extIdMap)[v.Id]; ok {
			prop := &model.Propext{
				Uid:    v.Uid,
				Id:     v.Id,
				TypeId: model.TYPE_VE_CONFIG,
				Props:  v.Content,
			}
			updatePropList = append(updatePropList, prop)
			v.Content = ""
		}
		// 否则判断当前字段长度，如果超长则添加到 propext 表
		if utf8.RuneCountInString(v.Content) > model.LIMIT_512 {
			prop := &model.Propext{
				Uid:    v.Uid,
				Id:     v.Id,
				TypeId: model.TYPE_VE_CONFIG,
				Props:  v.Content,
			}
			insertPropList = append(insertPropList, prop)
			v.Content = ""
		}
	}
	err = mv.UpdateViewedges(viewedges)
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
func (srv *Service) GetViewedges(uid int, updateTime int64, limit int) (*[]model.Viewedge, error) {
	mv := &model.Viewedge{}
	list, err := mv.GetViewedges(uid, updateTime, limit)
	if err != nil {
		return nil, err
	}
	if len(*list) <= 0 {
		return list, nil
	}
	var viewedgeIds []string
	for _, v := range *list {
		if v.Content == "" {
			viewedgeIds = append(viewedgeIds, v.Id)
		}
	}
	if len(viewedgeIds) <= 0 {
		return list, nil
	}
	p := &model.Propext{}
	propMap, err := p.GetPropexts(uid, &viewedgeIds)
	if err != nil {
		return nil, err
	}
	for i, v := range *list {
		if prop, ok := (*propMap)[v.Id+string(rune(model.TYPE_VE_CONFIG))]; ok {
			(*list)[i].Content = prop
		}
	}
	return list, nil
}
