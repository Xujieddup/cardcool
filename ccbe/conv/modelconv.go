package conv

import (
	"cc/be/graph/gmodel"
	"cc/be/model"
)

func SpaceDocToModel(uid int, i *gmodel.SpaceInput) (*model.Space, error) {
	space := model.Space{
		Model: model.Model{
			Uid:        uid,
			Id:         i.ID,
			UpdateTime: i.UpdateTime,
			IsDeleted:  0,
			Deleted:    0,
		},
		Name: i.Name,
		Icon: i.Icon,
		Desc: i.Desc,
		Snum: i.Snum,
	}
	if i.IsDeleted {
		space.IsDeleted = 1
	}
	if i.Deleted {
		space.Deleted = 1
	}
	return &space, nil
}

func SpaceModelToDoc(i *model.Space) *gmodel.Space {
	space := &gmodel.Space{
		ID:         i.Id,
		Name:       i.Name,
		Icon:       i.Icon,
		Desc:       i.Desc,
		Snum:       i.Snum,
		UpdateTime: i.UpdateTime,
		IsDeleted:  false,
		Deleted:    false,
	}
	if i.IsDeleted == 1 {
		space.IsDeleted = true
	}
	if i.Deleted == 1 {
		space.Deleted = true
	}
	return space
}

func FormatSpace(spaces *[]model.Space, updateTime int64) *gmodel.SpacePullBulk {
	var docs []*gmodel.Space
	for _, space := range *spaces {
		hd := SpaceModelToDoc(&space)
		docs = append(docs, hd)
		updateTime = space.UpdateTime
	}
	return &gmodel.SpacePullBulk{
		Documents: docs,
		Checkpoint: &gmodel.Checkpoint{
			UpdateTime: updateTime,
		},
	}
}

func TypeDocToModel(uid int, i *gmodel.TypeInput) (*model.Type, error) {
	t := model.Type{
		Model: model.Model{
			Uid:        uid,
			Id:         i.ID,
			UpdateTime: i.UpdateTime,
			IsDeleted:  0,
			Deleted:    0,
		},
		Name:   i.Name,
		Icon:   i.Icon,
		Snum:   i.Snum,
		Props:  i.Props,
		Styles: i.Styles,
		Desc:   i.Desc,
	}
	if i.IsDeleted {
		t.IsDeleted = 1
	}
	if i.Deleted {
		t.Deleted = 1
	}
	return &t, nil
}

func TypeModelToDoc(i *model.Type) *gmodel.Type {
	t := &gmodel.Type{
		ID:         i.Id,
		Name:       i.Name,
		Icon:       i.Icon,
		Snum:       i.Snum,
		Props:      i.Props,
		Styles:     i.Styles,
		Desc:       i.Desc,
		UpdateTime: i.UpdateTime,
		IsDeleted:  false,
		Deleted:    false,
	}
	if i.IsDeleted == 1 {
		t.IsDeleted = true
	}
	if i.Deleted == 1 {
		t.Deleted = true
	}
	return t
}

func FormatType(types *[]model.Type, updateTime int64) *gmodel.TypePullBulk {
	var docs []*gmodel.Type
	for _, t := range *types {
		hd := TypeModelToDoc(&t)
		docs = append(docs, hd)
		updateTime = t.UpdateTime
	}
	return &gmodel.TypePullBulk{
		Documents: docs,
		Checkpoint: &gmodel.Checkpoint{
			UpdateTime: updateTime,
		},
	}
}

func ViewDocToModel(uid int, i *gmodel.ViewInput) (*model.View, error) {
	view := model.View{
		Model: model.Model{
			Uid:        uid,
			Id:         i.ID,
			UpdateTime: i.UpdateTime,
			IsDeleted:  0,
			Deleted:    0,
		},
		Name:       i.Name,
		SpaceId:    i.SpaceID,
		Pid:        i.Pid,
		Snum:       i.Snum,
		Type:       i.Type,
		InlineType: i.InlineType,
		Config:     i.Config,
		Icon:       i.Icon,
		Desc:       i.Desc,
	}
	if i.IsDeleted {
		view.IsDeleted = 1
	}
	if i.Deleted {
		view.Deleted = 1
	}
	if i.IsFavor {
		view.IsFavor = 1
	}
	return &view, nil
}

func ViewModelToDoc(i *model.View, contentMap *map[string]string) *gmodel.View {
	view := &gmodel.View{
		ID:         i.Id,
		Name:       i.Name,
		SpaceID:    i.SpaceId,
		Pid:        i.Pid,
		Snum:       i.Snum,
		Type:       i.Type,
		InlineType: i.InlineType,
		Config:     i.Config,
		Content:    (*contentMap)[i.Id],
		Icon:       i.Icon,
		Desc:       i.Desc,
		UpdateTime: i.UpdateTime,
		IsDeleted:  false,
		Deleted:    false,
	}
	if i.IsDeleted == 1 {
		view.IsDeleted = true
	}
	if i.Deleted == 1 {
		view.Deleted = true
	}
	if i.IsFavor == 1 {
		view.IsFavor = true
	}
	return view
}

func FormatView(views *[]model.View, contentMap *map[string]string, updateTime int64) *gmodel.ViewPullBulk {
	var docs []*gmodel.View
	for _, view := range *views {
		hd := ViewModelToDoc(&view, contentMap)
		docs = append(docs, hd)
		updateTime = view.UpdateTime
	}
	return &gmodel.ViewPullBulk{
		Documents: docs,
		Checkpoint: &gmodel.Checkpoint{
			UpdateTime: updateTime,
		},
	}
}

func TagDocToModel(uid int, i *gmodel.TagInput) (*model.Tag, error) {
	tag := model.Tag{
		Model: model.Model{
			Uid:        uid,
			Id:         i.ID,
			UpdateTime: i.UpdateTime,
			IsDeleted:  0,
			Deleted:    0,
		},
		Name:    i.Name,
		SpaceId: i.SpaceID,
		Pid:     i.Pid,
		Color:   i.Color,
		Snum:    i.Snum,
	}
	if i.IsDeleted {
		tag.IsDeleted = 1
	}
	if i.Deleted {
		tag.Deleted = 1
	}
	return &tag, nil
}

func TagModelToDoc(i *model.Tag) *gmodel.Tag {
	tag := &gmodel.Tag{
		ID:         i.Id,
		Name:       i.Name,
		SpaceID:    i.SpaceId,
		Pid:        i.Pid,
		Color:      i.Color,
		Snum:       i.Snum,
		UpdateTime: i.UpdateTime,
		IsDeleted:  false,
		Deleted:    false,
	}
	if i.IsDeleted == 1 {
		tag.IsDeleted = true
	}
	if i.Deleted == 1 {
		tag.Deleted = true
	}
	return tag
}

func FormatTag(tags *[]model.Tag, updateTime int64) *gmodel.TagPullBulk {
	var docs []*gmodel.Tag
	for _, tag := range *tags {
		hd := TagModelToDoc(&tag)
		docs = append(docs, hd)
		updateTime = tag.UpdateTime
	}
	return &gmodel.TagPullBulk{
		Documents: docs,
		Checkpoint: &gmodel.Checkpoint{
			UpdateTime: updateTime,
		},
	}
}

func CardDocToModel(uid int, i *gmodel.CardInput) (*model.Card, error) {
	node := model.Card{
		Model: model.Model{
			Uid:        uid,
			Id:         i.ID,
			UpdateTime: i.UpdateTime,
			IsDeleted:  0,
			Deleted:    0,
		},
		Name:       i.Name,
		SpaceId:    i.SpaceID,
		TypeId:     i.TypeID,
		Tags:       i.Tags,
		Props:      i.Props,
		Content:    i.Content,
		CreateTime: i.CreateTime,
	}
	if i.IsDeleted {
		node.IsDeleted = 1
	}
	if i.Deleted {
		node.Deleted = 1
	}
	return &node, nil
}

func CardModelToDoc(i *model.Card) *gmodel.Card {
	node := &gmodel.Card{
		ID:         i.Id,
		Name:       i.Name,
		SpaceID:    i.SpaceId,
		TypeID:     i.TypeId,
		Tags:       i.Tags,
		Props:      i.Props,
		Content:    i.Content,
		CreateTime: i.CreateTime,
		UpdateTime: i.UpdateTime,
		IsDeleted:  false,
		Deleted:    false,
	}
	if i.IsDeleted == 1 {
		node.IsDeleted = true
	}
	if i.Deleted == 1 {
		node.Deleted = true
	}
	return node
}

func FormatCard(nodes *[]model.Card, updateTime int64) *gmodel.CardPullBulk {
	var docs []*gmodel.Card
	for _, node := range *nodes {
		hd := CardModelToDoc(&node)
		docs = append(docs, hd)
		updateTime = node.UpdateTime
	}
	return &gmodel.CardPullBulk{
		Documents: docs,
		Checkpoint: &gmodel.Checkpoint{
			UpdateTime: updateTime,
		},
	}
}

// viewedge
func ViewedgeDocToModel(uid int, i *gmodel.ViewedgeInput) (*model.Viewedge, error) {
	ve := model.Viewedge{
		Model: model.Model{
			Uid:        uid,
			Id:         i.ID,
			UpdateTime: i.UpdateTime,
			IsDeleted:  0,
			Deleted:    0,
		},
		ViewId:       i.ViewID,
		Source:       i.Source,
		Target:       i.Target,
		SourceHandle: i.SourceHandle,
		TargetHandle: i.TargetHandle,
		VeTypeId:     i.VeTypeID,
		Name:         i.Name,
		Content:      i.Content,
	}
	if i.IsDeleted {
		ve.IsDeleted = 1
	}
	if i.Deleted {
		ve.Deleted = 1
	}
	return &ve, nil
}

func ViewedgeModelToDoc(i *model.Viewedge) *gmodel.Viewedge {
	ve := &gmodel.Viewedge{
		ID:           i.Id,
		ViewID:       i.ViewId,
		Source:       i.Source,
		Target:       i.Target,
		SourceHandle: i.SourceHandle,
		TargetHandle: i.TargetHandle,
		VeTypeID:     i.VeTypeId,
		Name:         i.Name,
		Content:      i.Content,
		UpdateTime:   i.UpdateTime,
		IsDeleted:    false,
		Deleted:      false,
	}
	if i.IsDeleted == 1 {
		ve.IsDeleted = true
	}
	if i.Deleted == 1 {
		ve.Deleted = true
	}
	return ve
}

func FormatViewedge(ves *[]model.Viewedge, updateTime int64) *gmodel.ViewedgePullBulk {
	var docs []*gmodel.Viewedge
	for _, ve := range *ves {
		hd := ViewedgeModelToDoc(&ve)
		docs = append(docs, hd)
		updateTime = ve.UpdateTime
	}
	return &gmodel.ViewedgePullBulk{
		Documents: docs,
		Checkpoint: &gmodel.Checkpoint{
			UpdateTime: updateTime,
		},
	}
}

// viewnode
func ViewnodeDocToModel(uid int, i *gmodel.ViewnodeInput) (*model.Viewnode, error) {
	vn := model.Viewnode{
		Model: model.Model{
			Uid:        uid,
			Id:         i.ID,
			UpdateTime: i.UpdateTime,
			IsDeleted:  0,
			Deleted:    0,
		},
		ViewId:   i.ViewID,
		GroupId:  i.GroupID,
		Pid:      i.Pid,
		NodeType: i.NodeType,
		NodeId:   i.NodeID,
		VnTypeId: i.VnTypeID,
		Name:     i.Name,
		Content:  i.Content,
	}
	if i.IsDeleted {
		vn.IsDeleted = 1
	}
	if i.Deleted {
		vn.Deleted = 1
	}
	return &vn, nil
}

func ViewnodeModelToDoc(i *model.Viewnode) *gmodel.Viewnode {
	vn := &gmodel.Viewnode{
		ID:         i.Id,
		ViewID:     i.ViewId,
		GroupID:    i.GroupId,
		Pid:        i.Pid,
		NodeType:   i.NodeType,
		NodeID:     i.NodeId,
		VnTypeID:   i.VnTypeId,
		Name:       i.Name,
		Content:    i.Content,
		UpdateTime: i.UpdateTime,
		IsDeleted:  false,
		Deleted:    false,
	}
	if i.IsDeleted == 1 {
		vn.IsDeleted = true
	}
	if i.Deleted == 1 {
		vn.Deleted = true
	}
	return vn
}

func FormatViewnode(vns *[]model.Viewnode, updateTime int64) *gmodel.ViewnodePullBulk {
	var docs []*gmodel.Viewnode
	for _, vn := range *vns {
		hd := ViewnodeModelToDoc(&vn)
		docs = append(docs, hd)
		updateTime = vn.UpdateTime
	}
	return &gmodel.ViewnodePullBulk{
		Documents: docs,
		Checkpoint: &gmodel.Checkpoint{
			UpdateTime: updateTime,
		},
	}
}
