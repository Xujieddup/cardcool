package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"errors"
	"fmt"
	"cc/be/cache"
	"cc/be/conv"
	"cc/be/global"
	"cc/be/graph/generated"
	"cc/be/graph/gmodel"
	"cc/be/model"
	"cc/be/service"
	"cc/be/utils"
)

// PushSpace is the resolver for the pushSpace field.
func (r *mutationResolver) PushSpace(ctx context.Context, spacePushRow []*gmodel.SpaceInputPushRow) ([]*gmodel.Space, error) {
	uid := global.Uid
	var ids []string
	for _, row := range spacePushRow {
		ids = append(ids, row.NewDocumentState.ID)
	}
	s := &model.Space{}
	checkMap, err := s.GetSpaceCheckMap(uid, ids)
	if err != nil {
		return nil, errors.New("查询数据异常")
	}
	// 判断数据库
	var insertList []*model.Space
	var updateList []*model.Space
	var ut int64 = 0
	for _, row := range spacePushRow {
		tmp, _ := conv.SpaceDocToModel(uid, row.NewDocumentState)
		if updateTime := (*checkMap)[tmp.Id]; updateTime > 0 { // 需要更新
			if updateTime < tmp.UpdateTime {
				ut = utils.MaxTime(ut, tmp.UpdateTime)
				updateList = append(updateList, tmp)
			}
		} else { // 新增
			ut = utils.MaxTime(ut, tmp.UpdateTime)
			insertList = append(insertList, tmp)
		}
	}
	if len(insertList) > 0 {
		err = s.CreateSpaces(&insertList)
		fmt.Println("create spaces err", err)
	}
	if len(updateList) > 0 {
		err = s.UpdateSpaces(&updateList)
		fmt.Println("update spaces err", err)
	}
	// 刷新更新时间缓存
	cache.SetUserUpdateTime(uid, ut)
	// 第一个参数为冲突的数据列表
	return nil, nil
}

// PushType is the resolver for the pushType field.
func (r *mutationResolver) PushType(ctx context.Context, typePushRow []*gmodel.TypeInputPushRow) ([]*gmodel.Type, error) {
	uid := global.Uid
	var ids []string
	for _, row := range typePushRow {
		ids = append(ids, row.NewDocumentState.ID)
	}
	t := &model.Type{}
	checkMap, err := t.GetTypeCheckMap(uid, ids)
	if err != nil {
		return nil, errors.New("查询数据异常")
	}
	// 判断数据库
	var insertList []*model.Type
	var updateIds []string
	var updateList []*model.Type
	var ut int64 = 0
	for _, row := range typePushRow {
		tmp, _ := conv.TypeDocToModel(uid, row.NewDocumentState)
		if updateTime := (*checkMap)[tmp.Id]; updateTime > 0 { // 需要更新
			if updateTime < tmp.UpdateTime {
				ut = utils.MaxTime(ut, tmp.UpdateTime)
				updateIds = append(updateIds, tmp.Id)
				updateList = append(updateList, tmp)
			}
		} else { // 新增
			ut = utils.MaxTime(ut, tmp.UpdateTime)
			insertList = append(insertList, tmp)
		}
	}
	srv := service.New(ctx)
	if len(insertList) > 0 {
		err = srv.CreateTypes(&insertList)
		fmt.Println("create types err", err)
	}
	if len(updateList) > 0 {
		err = srv.UpdateTypes(uid, &updateList, &updateIds)
		fmt.Println("update types err", err)
	}
	cache.SetUserUpdateTime(uid, ut)
	// 第一个参数为冲突的数据列表
	return nil, nil
}

// PushCard is the resolver for the pushCard field.
func (r *mutationResolver) PushCard(ctx context.Context, cardPushRow []*gmodel.CardInputPushRow) ([]*gmodel.Card, error) {
	uid := global.Uid
	var ids []string
	for _, row := range cardPushRow {
		ids = append(ids, row.NewDocumentState.ID)
	}
	t := &model.Card{}
	checkMap, err := t.GetCardCheckMap(uid, ids)
	if err != nil {
		return nil, errors.New("查询数据异常")
	}
	// 判断数据库
	var insertList []*model.Card
	var updateIds []string
	var updateList []*model.Card
	var ut int64 = 0
	for _, row := range cardPushRow {
		tmp, _ := conv.CardDocToModel(uid, row.NewDocumentState)
		if updateTime := (*checkMap)[tmp.Id]; updateTime > 0 { // 需要更新
			if updateTime < tmp.UpdateTime {
				ut = utils.MaxTime(ut, tmp.UpdateTime)
				updateIds = append(updateIds, tmp.Id)
				updateList = append(updateList, tmp)
			}
		} else { // 新增
			ut = utils.MaxTime(ut, tmp.UpdateTime)
			insertList = append(insertList, tmp)
		}
	}
	srv := service.New(ctx)
	if len(insertList) > 0 {
		err = srv.CreateCards(&insertList)
		fmt.Println("create cards err", err)
	}
	if len(updateList) > 0 {
		err = srv.UpdateCards(uid, &updateList, &updateIds)
		fmt.Println("update cards err", err)
	}
	cache.SetUserUpdateTime(uid, ut)
	// 第一个参数为冲突的数据列表
	return nil, nil
}

// PushTag is the resolver for the pushTag field.
func (r *mutationResolver) PushTag(ctx context.Context, tagPushRow []*gmodel.TagInputPushRow) ([]*gmodel.Tag, error) {
	uid := global.Uid
	var ids []string
	for _, row := range tagPushRow {
		ids = append(ids, row.NewDocumentState.ID)
	}
	m := &model.Tag{}
	checkMap, err := m.GetTagCheckMap(uid, ids)
	if err != nil {
		return nil, errors.New("查询数据异常")
	}
	// 判断数据库
	var insertList []*model.Tag
	var updateList []*model.Tag
	var ut int64 = 0
	for _, row := range tagPushRow {
		tmp, _ := conv.TagDocToModel(uid, row.NewDocumentState)
		if updateTime := (*checkMap)[tmp.Id]; updateTime > 0 { // 需要更新
			if updateTime < tmp.UpdateTime {
				ut = utils.MaxTime(ut, tmp.UpdateTime)
				updateList = append(updateList, tmp)
			}
		} else { // 新增
			ut = utils.MaxTime(ut, tmp.UpdateTime)
			insertList = append(insertList, tmp)
		}
	}
	if len(insertList) > 0 {
		err = m.CreateTags(&insertList)
		fmt.Println("create tags err", err)
	}
	if len(updateList) > 0 {
		err = m.UpdateTags(&updateList)
		fmt.Println("update tags err", err)
	}
	// 刷新更新时间缓存
	cache.SetUserUpdateTime(uid, ut)
	// 第一个参数为冲突的数据列表
	return nil, nil
}

// PushView is the resolver for the pushView field.
func (r *mutationResolver) PushView(ctx context.Context, viewPushRow []*gmodel.ViewInputPushRow) ([]*gmodel.View, error) {
	uid := global.Uid
	var ids []string
	for _, row := range viewPushRow {
		ids = append(ids, row.NewDocumentState.ID)
	}
	t := &model.View{}
	checkMap, err := t.GetViewCheckMap(uid, ids)
	if err != nil {
		return nil, errors.New("查询数据异常")
	}
	// 判断数据库
	var insertList []*model.View
	var updateIds []string
	var updateList []*model.View
	var contentMap = make(map[string]string)
	var ut int64 = 0
	for _, row := range viewPushRow {
		tmp, _ := conv.ViewDocToModel(uid, row.NewDocumentState)
		contentMap[tmp.Id] = row.NewDocumentState.Content
		if updateTime := (*checkMap)[tmp.Id]; updateTime > 0 { // 需要更新
			if updateTime < tmp.UpdateTime {
				ut = utils.MaxTime(ut, tmp.UpdateTime)
				updateIds = append(updateIds, tmp.Id)
				updateList = append(updateList, tmp)
			}
		} else { // 新增
			ut = utils.MaxTime(ut, tmp.UpdateTime)
			insertList = append(insertList, tmp)
		}
	}
	srv := service.New(ctx)
	if len(insertList) > 0 {
		err = srv.CreateViews(&insertList, &contentMap)
		fmt.Println("create views err", err)
	}
	if len(updateList) > 0 {
		err = srv.UpdateViews(uid, &updateList, &updateIds, &contentMap)
		fmt.Println("update views err", err)
	}
	cache.SetUserUpdateTime(uid, ut)
	// 第一个参数为冲突的数据列表
	return nil, nil
}

// PushViewnode is the resolver for the pushViewnode field.
func (r *mutationResolver) PushViewnode(ctx context.Context, viewnodePushRow []*gmodel.ViewnodeInputPushRow) ([]*gmodel.Viewnode, error) {
	uid := global.Uid
	var ids []string
	for _, row := range viewnodePushRow {
		ids = append(ids, row.NewDocumentState.ID)
	}
	t := &model.Viewnode{}
	checkMap, err := t.GetViewnodeCheckMap(uid, ids)
	if err != nil {
		return nil, errors.New("查询数据异常")
	}
	// 判断数据库
	var insertList []*model.Viewnode
	var updateIds []string
	var updateList []*model.Viewnode
	var ut int64 = 0
	for _, row := range viewnodePushRow {
		tmp, _ := conv.ViewnodeDocToModel(uid, row.NewDocumentState)
		if updateTime := (*checkMap)[tmp.Id]; updateTime > 0 { // 需要更新
			if updateTime < tmp.UpdateTime {
				ut = utils.MaxTime(ut, tmp.UpdateTime)
				updateIds = append(updateIds, tmp.Id)
				updateList = append(updateList, tmp)
			}
		} else { // 新增
			ut = utils.MaxTime(ut, tmp.UpdateTime)
			insertList = append(insertList, tmp)
		}
	}
	srv := service.New(ctx)
	if len(insertList) > 0 {
		err = srv.CreateViewnodes(&insertList)
		fmt.Println("create viewnodes err", err)
	}
	if len(updateList) > 0 {
		err = srv.UpdateViewnodes(uid, &updateList, &updateIds)
		fmt.Println("update viewnodes err", err)
	}
	cache.SetUserUpdateTime(uid, ut)
	// 第一个参数为冲突的数据列表
	return nil, nil
}

// PushViewedge is the resolver for the pushViewedge field.
func (r *mutationResolver) PushViewedge(ctx context.Context, viewedgePushRow []*gmodel.ViewedgeInputPushRow) ([]*gmodel.Viewedge, error) {
	uid := global.Uid
	var ids []string
	for _, row := range viewedgePushRow {
		ids = append(ids, row.NewDocumentState.ID)
	}
	t := &model.Viewedge{}
	checkMap, err := t.GetViewedgeCheckMap(uid, ids)
	if err != nil {
		return nil, errors.New("查询数据异常")
	}
	// 判断数据库
	var insertList []*model.Viewedge
	var updateIds []string
	var updateList []*model.Viewedge
	var ut int64 = 0
	for _, row := range viewedgePushRow {
		tmp, _ := conv.ViewedgeDocToModel(uid, row.NewDocumentState)
		if updateTime := (*checkMap)[tmp.Id]; updateTime > 0 { // 需要更新
			if updateTime < tmp.UpdateTime {
				ut = utils.MaxTime(ut, tmp.UpdateTime)
				updateIds = append(updateIds, tmp.Id)
				updateList = append(updateList, tmp)
			}
		} else { // 新增
			ut = utils.MaxTime(ut, tmp.UpdateTime)
			insertList = append(insertList, tmp)
		}
	}
	srv := service.New(ctx)
	if len(insertList) > 0 {
		err = srv.CreateViewedges(&insertList)
		fmt.Println("create viewedges err", err)
	}
	if len(updateList) > 0 {
		err = srv.UpdateViewedges(uid, &updateList, &updateIds)
		fmt.Println("update viewedges err", err)
	}
	cache.SetUserUpdateTime(uid, ut)
	// 第一个参数为冲突的数据列表
	return nil, nil
}

// PullSpace is the resolver for the pullSpace field.
func (r *queryResolver) PullSpace(ctx context.Context, checkpoint *gmodel.InputCheckpoint, limit int) (*gmodel.SpacePullBulk, error) {
	var minUpdateTime int64
	if checkpoint != nil && checkpoint.UpdateTime > 0 {
		minUpdateTime = checkpoint.UpdateTime
	}
	if limit <= 0 || limit > 200 {
		limit = 100
	}
	// 查询未同步的数据
	uid := global.Uid
	s := &model.Space{}
	spaces, err := s.GetSpaces(uid, minUpdateTime, limit)
	if err != nil {
		return nil, errors.New("查询数据异常")
	}
	return conv.FormatSpace(spaces, minUpdateTime), nil
}

// PullType is the resolver for the pullType field.
func (r *queryResolver) PullType(ctx context.Context, checkpoint *gmodel.InputCheckpoint, limit int) (*gmodel.TypePullBulk, error) {
	var minUpdateTime int64
	if checkpoint != nil && checkpoint.UpdateTime > 0 {
		minUpdateTime = checkpoint.UpdateTime
	}
	if limit <= 0 || limit > 200 {
		limit = 100
	}
	// 查询未同步的数据
	uid := global.Uid
	srv := service.New(ctx)
	list, err := srv.GetTypes(uid, minUpdateTime, limit)
	if err != nil {
		return nil, errors.New("查询数据异常")
	}
	return conv.FormatType(list, minUpdateTime), nil
}

// PullCard is the resolver for the pullCard field.
func (r *queryResolver) PullCard(ctx context.Context, checkpoint *gmodel.InputCheckpoint, limit int) (*gmodel.CardPullBulk, error) {
	var minUpdateTime int64
	if checkpoint != nil && checkpoint.UpdateTime > 0 {
		minUpdateTime = checkpoint.UpdateTime
	}
	if limit <= 0 || limit > 200 {
		limit = 100
	}
	// 查询未同步的数据
	uid := global.Uid
	srv := service.New(ctx)
	list, err := srv.GetCards(uid, minUpdateTime, limit)
	if err != nil {
		return nil, errors.New("查询数据异常")
	}
	return conv.FormatCard(list, minUpdateTime), nil
}

// PullTag is the resolver for the pullTag field.
func (r *queryResolver) PullTag(ctx context.Context, checkpoint *gmodel.InputCheckpoint, limit int) (*gmodel.TagPullBulk, error) {
	var minUpdateTime int64
	if checkpoint != nil && checkpoint.UpdateTime > 0 {
		minUpdateTime = checkpoint.UpdateTime
	}
	if limit <= 0 || limit > 200 {
		limit = 100
	}
	// 查询未同步的数据
	uid := global.Uid
	m := &model.Tag{}
	tags, err := m.GetTags(uid, minUpdateTime, limit)
	if err != nil {
		return nil, errors.New("查询数据异常")
	}
	return conv.FormatTag(tags, minUpdateTime), nil
}

// PullView is the resolver for the pullView field.
func (r *queryResolver) PullView(ctx context.Context, checkpoint *gmodel.InputCheckpoint, limit int) (*gmodel.ViewPullBulk, error) {
	var minUpdateTime int64
	if checkpoint != nil && checkpoint.UpdateTime > 0 {
		minUpdateTime = checkpoint.UpdateTime
	}
	if limit <= 0 || limit > 200 {
		limit = 100
	}
	// 查询未同步的数据
	uid := global.Uid
	srv := service.New(ctx)
	list, contentMap, err := srv.GetViews(uid, minUpdateTime, limit)
	if err != nil {
		return nil, errors.New("查询数据异常")
	}
	return conv.FormatView(list, contentMap, minUpdateTime), nil
}

// PullViewnode is the resolver for the pullViewnode field.
func (r *queryResolver) PullViewnode(ctx context.Context, checkpoint *gmodel.InputCheckpoint, limit int) (*gmodel.ViewnodePullBulk, error) {
	var minUpdateTime int64
	if checkpoint != nil && checkpoint.UpdateTime > 0 {
		minUpdateTime = checkpoint.UpdateTime
	}
	if limit <= 0 || limit > 200 {
		limit = 100
	}
	// 查询未同步的数据
	uid := global.Uid
	srv := service.New(ctx)
	list, err := srv.GetViewnodes(uid, minUpdateTime, limit)
	if err != nil {
		return nil, errors.New("查询数据异常")
	}
	return conv.FormatViewnode(list, minUpdateTime), nil
}

// PullViewedge is the resolver for the pullViewedge field.
func (r *queryResolver) PullViewedge(ctx context.Context, checkpoint *gmodel.InputCheckpoint, limit int) (*gmodel.ViewedgePullBulk, error) {
	var minUpdateTime int64
	if checkpoint != nil && checkpoint.UpdateTime > 0 {
		minUpdateTime = checkpoint.UpdateTime
	}
	if limit <= 0 || limit > 200 {
		limit = 100
	}
	// 查询未同步的数据
	uid := global.Uid
	srv := service.New(ctx)
	list, err := srv.GetViewedges(uid, minUpdateTime, limit)
	if err != nil {
		return nil, errors.New("查询数据异常")
	}
	return conv.FormatViewedge(list, minUpdateTime), nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
