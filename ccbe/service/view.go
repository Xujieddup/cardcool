package service

import (
	"errors"
	"cc/be/model"
	"cc/be/utils"
	"unicode/utf8"
)

// 批量创建
func (srv *Service) CreateViews(views *[]*model.View, contentMap *map[string]string) error {
	var propList []*model.Propext
	for _, v := range *views {
		// 判断当前字段长度，如果超长则添加到 propext 表
		if utf8.RuneCountInString(v.Config) > model.LIMIT_2048 {
			prop := &model.Propext{
				Uid:    v.Uid,
				Id:     v.Id,
				TypeId: model.TYPE_VIEW_CONFIG,
				Props:  v.Config,
			}
			v.Config = ""
			propList = append(propList, prop)
		}
		// 文档或大纲，需保存 content
		if checkDocView(v.Type) {
			content := &model.Propext{
				Uid:    v.Uid,
				Id:     v.Id,
				TypeId: model.TYPE_DOC_CONTENT,
				Props:  (*contentMap)[v.Id],
			}
			propList = append(propList, content)
		}
	}
	mv := &model.View{}
	err := mv.CreateViews(views)
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

func checkDocView(t int) bool {
	return t == model.TYPE_VIEW_DOC || t == model.TYPE_VIEW_MDOC
}

// 批量更新
func (srv *Service) UpdateViews(uid int, views *[]*model.View, viewIds *[]string, contentMap *map[string]string) error {
	mv := &model.View{}
	p := &model.Propext{}
	// 查询已经保存在 propext 扩展表的信息
	extIdMap, err := p.GetExtIdMap(uid, viewIds, model.TYPE_VIEW_CONFIG)
	if err != nil {
		return err
	}
	var insertPropList []*model.Propext
	var updatePropList []*model.Propext
	for _, v := range *views {
		// 如果 propext 表中已经存在扩展数据，则直接更新扩展数据
		if _, ok := (*extIdMap)[v.Id]; ok {
			prop := &model.Propext{
				Uid:    v.Uid,
				Id:     v.Id,
				TypeId: model.TYPE_VIEW_CONFIG,
				Props:  v.Config,
			}
			updatePropList = append(updatePropList, prop)
			v.Config = ""
		}
		// 文档或大纲，需保存 content
		if checkDocView(v.Type) {
			content := &model.Propext{
				Uid:    v.Uid,
				Id:     v.Id,
				TypeId: model.TYPE_DOC_CONTENT,
				Props:  (*contentMap)[v.Id],
			}
			updatePropList = append(updatePropList, content)
		}
		// 否则判断当前字段长度，如果超长则添加到 propext 表
		if utf8.RuneCountInString(v.Config) > model.LIMIT_2048 {
			prop := &model.Propext{
				Uid:    v.Uid,
				Id:     v.Id,
				TypeId: model.TYPE_VIEW_CONFIG,
				Props:  v.Config,
			}
			insertPropList = append(insertPropList, prop)
			v.Config = ""
		}
	}
	err = mv.UpdateViews(views)
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

// 获取分组列表
func (srv *Service) GetViews(uid int, updateTime int64, limit int) (*[]model.View, *map[string]string, error) {
	mv := &model.View{}
	// var contentMap = make(map[string]string)
	contentMap := &map[string]string{}
	list, err := mv.GetViews(uid, updateTime, limit)
	if err != nil {
		return nil, contentMap, err
	}
	if len(*list) <= 0 {
		return list, contentMap, nil
	}
	var viewIds []string
	for _, v := range *list {
		if v.Config == "" || checkDocView(v.Type) {
			viewIds = append(viewIds, v.Id)
		}
	}
	if len(viewIds) <= 0 {
		return list, contentMap, nil
	}
	p := &model.Propext{}
	propMap, err := p.GetPropexts(uid, &viewIds)
	if err != nil {
		return nil, contentMap, err
	}
	for i, v := range *list {
		if prop, ok := (*propMap)[v.Id+string(rune(model.TYPE_VIEW_CONFIG))]; ok {
			(*list)[i].Config = prop
		}
		if content, ok := (*propMap)[v.Id+string(rune(model.TYPE_DOC_CONTENT))]; ok {
			(*contentMap)[v.Id] = content
		}
	}
	return list, contentMap, nil
}

func (srv *Service) CheckViewExist(uid int, viewId string) bool {
	mv := &model.View{}
	return mv.ExistView(uid, viewId)
}

// 生成初始化视图
func (srv *Service) InitView(uid int, t int64, sid string, cid string) (*[]string, error) {
	vs := []string{utils.Unid(t), utils.Unid(t + 1)}
	views := []*model.View{
		{
			Model: model.Model{
				Uid:        uid,
				Id:         vs[0],
				UpdateTime: t,
				IsDeleted:  0,
				Deleted:    0,
			},
			Name:       "文档草稿",
			SpaceId:    sid,
			Pid:        "",
			Snum:       10000,
			Type:       model.TYPE_VIEW_DOC,
			InlineType: 0,
			IsFavor:    1,
			Icon:       "doc",
			Desc:       "无压输入，定期整理",
			Config:     `{"ruleId":"","rules":[]}`,
		}, {
			Model: model.Model{
				Uid:        uid,
				Id:         vs[1],
				UpdateTime: t + 1,
				IsDeleted:  0,
				Deleted:    0,
			},
			Name:       "白板草稿",
			SpaceId:    sid,
			Pid:        "",
			Snum:       20000,
			Type:       model.TYPE_VIEW_BOARD,
			InlineType: 0,
			IsFavor:    1,
			Icon:       "board",
			Desc:       "视觉化笔记，自由组织信息",
			Config:     `{"ruleId":"","rules":[]}`,
		},
	}
	mv := &model.View{}
	err := mv.CreateViews(&views)
	if err != nil {
		return &vs, errors.New("初始化视图数据异常")
	}
	contents := []*model.Propext{
		{
			Uid:    uid,
			Id:     vs[0],
			TypeId: model.TYPE_DOC_CONTENT,
			Props:  `{"type":"doc","content":[{"type":"blockquote","content":[{"type":"paragraph","content":[{"type":"text","text":"问题反馈、意见建议、学习交流，欢迎加开发者微信（"},{"type":"text","marks":[{"type":"bold"}],"text":"cardcool666"},{"type":"text","text":"）"}]}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"文档基本功能"}]},{"type":"nbl","content":[{"type":"nli","attrs":{"coll":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"支持常用 "},{"type":"text","marks":[{"type":"code"}],"text":"Markdown"},{"type":"text","text":" 语法"}]}]},{"type":"nli","attrs":{"coll":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"使用 "},{"type":"text","marks":[{"type":"code"}],"text":"/"},{"type":"text","text":" 可唤起命令"}]}]},{"type":"nli","attrs":{"coll":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"选中文本可弹窗浮动菜单，修改文本样式"}]}]},{"type":"nli","attrs":{"coll":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"输入 "},{"type":"text","marks":[{"type":"code"}],"text":"@+关键词"},{"type":"text","text":" 可引用卡片或其他视图， "},{"type":"mention","attrs":{"id":"` + cid + `","label":"孙悟空","type":1,"icon":"card"}},{"type":"text","text":" "}]}]}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"功能规划"}]},{"type":"nbl","content":[{"type":"nli","attrs":{"coll":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"更完善的编辑体验"}]}]},{"type":"nli","attrs":{"coll":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"文档、大纲、白板、看板多种视图融合，可在一个页面同时打开多个视图"}]}]},{"type":"nli","attrs":{"coll":false},"content":[{"type":"paragraph","content":[{"type":"text","text":"面向应用场景进行功能迭代…"}]}]}]},{"type":"paragraph"},{"type":"paragraph"}]}`,
		},
	}
	p := &model.Propext{}
	err = p.CreatePropexts(&contents)
	if err != nil {
		return &vs, err
	}
	return &vs, nil
}
